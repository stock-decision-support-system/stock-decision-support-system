from django.http import JsonResponse
from rest_framework.decorators import api_view
import shioaji as sj
import yaml
import logging

from rest_framework import status  # 新增這行導入
from rest_framework.response import Response
from .models import InvestmentPortfolio, Investment
from .serializers import InvestmentPortfolioSerializer, InvestmentSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)

# 設置日誌
logger = logging.getLogger(__name__)

# 加載配置
with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)

# 初始化 Shioaji API 並登錄
api = sj.Shioaji(simulation=True)


# 定義合約加載回調函數
def contracts_callback(security_type):
    logger.info(f"{security_type} contracts fetch done.")


api.login(
    api_key=config["shioaji"]["api_key"],
    secret_key=config["shioaji"]["secret_key"],
    contracts_cb=contracts_callback,  # 使用回調函數來確認合約加載完成
)

from shioaji import TickSTKv1, Exchange

import logging

logging.basicConfig(level=logging.DEBUG)


# 股票資料查詢 (使用訂閱模式)
@api_view(["GET"])
def get_stock_detail(request, id):
    try:
        stock_contract = api.Contracts.Stocks[id]
        contracts = [stock_contract]
        snapshots = api.snapshots(contracts)
        data = vars(snapshots[0])
        data["name"] = stock_contract.name

        return Response(
            {"status": "success", "data": data},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger.error(f"Error fetching stocks: {str(e)}")
        return JsonResponse({"status": "error", "message": str(e)}, status=400)


@api_view(["GET"])
def get_all_stocks(request):
    try:
        # 獲取所有股票合約
        stocks = api.Contracts.Stocks

        # 初始化股票列表
        stock_list = []

        # 遍歷所有板塊中的股票合約
        for market, contracts in stocks.__dict__.items():
            if isinstance(contracts, dict):  # 確保 contracts 是字典
                for stock in contracts.values():
                    # 確認每個股票合約具有 'code' 和 'name' 屬性
                    if hasattr(stock, "code") and hasattr(stock, "name"):
                        stock_list.append({"symbol": stock.code, "name": stock.name})

        # # 添加日誌輸出以便於檢查
        # logger.info(f"Total stocks fetched: {len(stock_list)}")
        # logger.debug(f"Stocks data: {stock_list[:5]}...")  # 只顯示前5個以簡化輸出

        return JsonResponse({"status": "success", "stocks": stock_list}, status=200)
    except Exception as e:
        logger.error(f"Error fetching stocks: {str(e)}")
        return JsonResponse({"status": "error", "message": str(e)}, status=400)


# 定義一個全局變數來存儲即時行情數據
last_price = None


# 定義 Shioaji 的回調函數，用於處理即時行情數據
def tick_callback(exchange, tick):
    global last_price
    last_price = tick.close  # 使用 close 價作為即時價格
    logger.info(f"Tick received for {tick.code}: {tick}")


# 設置回調函數來處理即時行情數據
api.quote.set_on_tick_fop_v1_callback(tick_callback)


@api_view(["GET"])
def get_stock_price(request, symbol):
    global last_price
    try:
        # 清空之前的價格
        last_price = None

        # 查詢即時行情
        contract = api.Contracts.Stocks.get(symbol)
        if not contract:
            return JsonResponse({"error": "無法找到指定股票合約"}, status=404)

        # 股票名稱
        stock_name = contract.name  # 從合約中提取股票名稱

        # 訂閱即時行情
        api.quote.subscribe(
            contract,
            quote_type=sj.constant.QuoteType.Tick,
            version=sj.constant.QuoteVersion.v1,
        )

        # # 等待數據回來（這裡使用一個簡單的等待機制）
        # for _ in range(1):  # 最多等待 10 次
        #     if last_price is not None:
        #         break
        #     time.sleep(0.1)  # 每次等待 1 秒

        # 如果即時價格未能獲取，嘗試使用收盤價
        if last_price is None:
            snap = api.snapshots([contract])
            last_price = snap[0].close if snap else None

        # 返回即時價格或收盤價和股票名稱
        if last_price is not None:
            response_data = {
                "symbol": symbol,
                "name": stock_name,  # 返回股票名稱
                "price": last_price,
            }
            return JsonResponse(response_data, status=200)
        else:
            return JsonResponse({"error": "未能獲取即時價格或收盤價"}, status=400)

    except Exception as e:
        logger.error(f"Error fetching stock price for {symbol}: {str(e)}")
        return JsonResponse({"status": "error", "message": str(e)}, status=400)


# 獲取當前用戶的所有投資組合
@api_view(["GET"])
@permission_classes([IsAuthenticated])  # 只有已認證用戶可以訪問
def get_portfolios(request):
    portfolios = InvestmentPortfolio.objects.filter(user=request.user).prefetch_related(
        "investments"
    )
    response_data = []

    for portfolio in portfolios:
        total_value = portfolio.calculate_portfolio_value()
        total_invested = sum(
            investment.shares * investment.buy_price
            for investment in portfolio.investments.filter(available=True)
        )
        performance = (
            (total_value - total_invested) / total_invested * 100
            if total_invested
            else 0
        )

        portfolio_data = {
            "id": portfolio.id,
            "name": portfolio.name,
            "description": portfolio.description,
            "performance": round(performance, 2),
            "marketValue": total_value,
            "annualReturn": performance / (portfolio.investments.count() or 1),
            "dayChange": "+0.00",
            "investments": InvestmentSerializer(
                portfolio.investments.all(), many=True
            ).data,
        }

        # 調試輸出 investments 確保 name 被包含
        print(portfolio_data["investments"])
        response_data.append(portfolio_data)

    return Response(response_data)


# 創建新的投資組合
@api_view(["POST"])
@permission_classes([IsAuthenticated])  # 確保只有已認證用戶可以訪問
def create_portfolio(request):
    user = request.user
    print(f"Authenticated user: {user}")  # 檢查後端是否識別到用戶
    serializer = InvestmentPortfolioSerializer(data=request.data)

    if serializer.is_valid():
        portfolio = serializer.save(user=user)  # 保存用戶相關的數據
        print(f"Portfolio created: {portfolio}")
        # 檢查投資數據是否傳遞
        for investment in request.data.get("investments", []):
            print(f"Investment: {investment}")  # 這裡應該打印出來每個投資項目的資料

        return Response(serializer.data, status=201)
    else:
        print(f"Serializer errors: {serializer.errors}")  # 輸出錯誤信息
    return Response(serializer.errors, status=400)


# 用於向某個投資組合中添加新的投資
@api_view(["POST"])
def add_investment(request, portfolio_id):
    portfolio = InvestmentPortfolio.objects.get(id=portfolio_id)
    serializer = InvestmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(portfolio=portfolio)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


# 刪除
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])  # 確保只有認證的用戶可以訪問
def delete_portfolio(request, portfolio_id):
    try:
        # 確保投資組合是該用戶的
        portfolio = InvestmentPortfolio.objects.get(id=portfolio_id, user=request.user)
        portfolio.delete()  # 刪除投資組合
        return Response({"message": "投資組合已刪除"}, status=status.HTTP_200_OK)
    except InvestmentPortfolio.DoesNotExist:
        return Response(
            {"error": "未找到投資組合或您無權限刪除此投資組合"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def some_protected_view(request):
    return JsonResponse({"message": "已通過身份驗證"})
