import traceback
from datetime import datetime, timedelta

from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from rest_framework.decorators import api_view
import shioaji as sj
import yaml
import logging

from rest_framework import status  # 新增這行導入
from rest_framework.response import Response
from ..models import InvestmentPortfolio, Investment, DefaultInvestmentPortfolio, APICredentials
from ..serializers import InvestmentPortfolioSerializer, InvestmentSerializer, DefaultInvestmentPortfolioSerializer
from backend.models import DefaultStockList, DefaultInvestmentPortfolio
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
import pandas as pd

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

import logging

logging.basicConfig(level=logging.DEBUG)

def login_to_shioaji(user):
    try:
        # 從資料庫獲取對應用戶的 API 憑證
        credentials = APICredentials.objects.get(username=user)

        # 解密數據
        decrypted_data = credentials.get_decrypted_data()

        # 登入永豐金 API (非模擬模式)
        api = sj.Shioaji(simulation=False)  # 將模擬模式設置為False
        accounts = api.login(
            api_key=decrypted_data['api_key'],  # 使用解密後的api_key
            secret_key=decrypted_data['secret_key']  # 使用解密後的secret_key
        )

        # 激活CA憑證
        api.activate_ca(
            ca_path=credentials.ca_path.path,  # CA 憑證的路徑
            ca_passwd=decrypted_data['ca_passwd'],  # 使用解密後的ca_passwd
            person_id=decrypted_data['person_id']  # 使用解密後的person_id
        )

        return api, accounts

    except ObjectDoesNotExist:
        raise Exception(f"No API credentials found for username {user}")
    except Exception as e:
        error_message = f"Error logging into Shioaji API: {str(e)}"
        error_traceback = traceback.format_exc()  # 獲取詳細的錯誤堆疊信息
        raise Exception(f"{error_message}\nDetails:\n{error_traceback}")


@api_view(['GET'])
# @permission_classes([IsAuthenticated])  # 確保用戶已登錄
def login_to_shioaji_view(request):
    try:
        # 使用當前登錄的用戶進行操作
        user = '11046003'
        # user = request.user
        api, accounts = login_to_shioaji(user)

        # 調試：先打印 accounts 的類型和屬性，方便調試
        account_details = []
        for account in accounts:
            account_details.append(str(account))  # 將 account 轉換為字串，看看裡面有哪些屬性

        return JsonResponse({
            "status": "success",
            "message": f"Logged in successfully for {user}.",
            # "message": f"Logged in successfully for {user.username}.",
            "accounts": account_details  # 暫時返回 account 的字串表示
        })

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=400)

# 股票資料查詢 (使用訂閱模式)
# 這個端點根據股票 ID 獲取股票的詳細資料
@api_view(["GET"])
def get_stock_detail(request, id):
    try:
        # 根據傳入的股票 ID，從 API 獲取對應的股票合約
        stock_contract = api.Contracts.Stocks[id]

        # 創建一個合約列表 (在這裡僅包含一個合約)
        contracts = [stock_contract]

        # 使用 API 獲取指定合約的快照數據
        snapshots = api.snapshots(contracts)

        # 將快照數據轉換為字典格式，便於返回給前端
        data = vars(snapshots[0])

        # 在返回的數據中附加股票名稱
        data["name"] = stock_contract.name

        # 返回成功的響應，包含股票詳細資料
        return Response(
            {
                "status": "success",
                "data": data
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        # 如果出現錯誤，返回錯誤信息
        return Response(
            {
                "status": "error",
                "message": str(e)  # 返回錯誤的詳細信息
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# K線圖資料查詢
# 這個端點根據股票 ID 和時間範圍（傳入類型）獲取股票的 K 線圖資料
@api_view(["GET"])
def get_kbars(request, id):
    try:
        # 根據傳入的 'type' 參數來判斷時間範圍（月、週、日）
        kbar_type = request.GET.get('type')

        # 取得當前日期
        today = datetime.today()

        # 根據傳入的 'type' 來設置開始和結束日期
        if kbar_type == "0":  # 月資料
            start_date = today - timedelta(days=30)
            end_date = today
        elif kbar_type == "1":  # 週資料
            start_date = today - timedelta(days=7)
            end_date = today
        elif kbar_type == "2":  # 日資料
            snapshots = api.snapshots([api.Contracts.Stocks[id]])
            ts = snapshots[0].ts
            # 將時間戳轉換為秒並轉換為 datetime
            end_date = datetime.fromtimestamp(ts / 1_000_000_000)
            start_date = end_date - timedelta(days=1)
        else:
            # 如果傳入的類型無效，返回錯誤信息
            return Response(
                {
                    "status": "error",
                    "message": "無效的傳入，傳入只能是月、週、日"  # 提示正確的傳入類型
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        kbars = api.kbars(contract=api.Contracts.Stocks[id],
                          start=start_str,
                          end=end_str)
        # 將返回的 K 線圖資料轉換為 Pandas DataFrame 格式
        df = pd.DataFrame({**kbars})

        # 返回成功的響應，並將資料進行轉置以便於前端顯示
        return Response(
            {
                "status": "success",
                "data": df.T  # 將 DataFrame 進行轉置
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        # 如果出現錯誤（如查詢不到資料），返回錯誤信息
        return Response(
            {
                "status": "error",
                "message": "查無資料"  # 提示查詢不到資料
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
#
# # 获取台股股票的快照資料
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_tw_stocks(request):
#     try:
#         # 使用當前登錄的用戶進行操作
#         user = request.user
#         api, accounts = login_to_shioaji(user)
#
#         # 定義股票合約
#         contracts = [
#             api.Contracts.Stocks['1101'],  # 台泥
#             api.Contracts.Stocks['1216'],  # 統一
#             api.Contracts.Stocks['1301'],  # 台塑
#             api.Contracts.Stocks['1303'],  # 南亞
#             api.Contracts.Stocks['2327'],  # 國巨
#             api.Contracts.Stocks['2330'],  # 台積電
#             api.Contracts.Stocks['2454'],  # 聯發科
#             api.Contracts.Stocks['2881'],  # 富邦金
#             api.Contracts.Stocks['2882'],  # 國泰金
#             api.Contracts.Stocks['2317'],  # 鴻海
#         ]
#
#         # 使用 API 獲取股票快照資料
#         snapshots = api.snapshots(contracts)
#
#         # 序列化資料
#         snapshot_data = []
#         for i, snapshot in enumerate(snapshots):
#             snapshot_data.append({
#                 'name': contracts[i].name,
#                 'price': snapshot.close,  # 假設你需要close價格
#                 'volume': snapshot.volume,
#                 'high': snapshot.high,
#                 'low': snapshot.low,
#                 'open': snapshot.open,
#             })
#
#         return JsonResponse({
#             "status": "success",
#             "data": snapshot_data
#         })
#
#     except Exception as e:
#         return JsonResponse({
#             "status": "error",
#             "message": str(e)
#         }, status=400)

# 獲取特定台股股票的快照資料
# 這個端點返回多支指定台股股票的即時快照資料
@api_view(["GET"])
def get_tw_stocks(request):
    # 定義一組股票合約，包括台灣市場上的幾支主要股票
    contracts = [
        api.Contracts.Stocks['1101'],  # 台泥
        api.Contracts.Stocks['1216'],  # 統一
        api.Contracts.Stocks['1301'],  # 台塑
        api.Contracts.Stocks['1303'],  # 南亞
        api.Contracts.Stocks['1326'],  # 台化
        api.Contracts.Stocks['1590'],  # 亞德客-KY
        api.Contracts.Stocks['2002'],  # 中鋼
        api.Contracts.Stocks['2207'],  # 和泰車
        api.Contracts.Stocks['2301'],  # 光寶科
        api.Contracts.Stocks['2303'],  # 聯電
        api.Contracts.Stocks['2308'],  # 台達電
        api.Contracts.Stocks['2317'],  # 鴻海
        api.Contracts.Stocks['2327'],  # 國巨
        api.Contracts.Stocks['2330'],  # 台積電
        api.Contracts.Stocks['2345'],  # 智邦
        api.Contracts.Stocks['2357'],  # 華碩
        api.Contracts.Stocks['2379'],  # 瑞昱
        api.Contracts.Stocks['2382'],  # 廣達
        api.Contracts.Stocks['2395'],  # 研華
        api.Contracts.Stocks['2412'],  # 中華電
        api.Contracts.Stocks['2454'],  # 聯發科
        api.Contracts.Stocks['2603'],  # 長榮
        api.Contracts.Stocks['2880'],  # 華南金
        api.Contracts.Stocks['2881'],  # 富邦金
        api.Contracts.Stocks['2882'],  # 國泰金
        api.Contracts.Stocks['2883'],  # 開發金
        api.Contracts.Stocks['2884'],  # 玉山金
        api.Contracts.Stocks['2885'],  # 元大金
        api.Contracts.Stocks['2886'],  # 兆豐金
        api.Contracts.Stocks['2887'],  # 台新金
        api.Contracts.Stocks['2890'],  # 永豐金
        api.Contracts.Stocks['2891'],  # 中信金
        api.Contracts.Stocks['2892'],  # 第一金
        api.Contracts.Stocks['2912'],  # 統一超
        api.Contracts.Stocks['3008'],  # 大立光
        api.Contracts.Stocks['3017'],  # 奇鋐
        api.Contracts.Stocks['3034'],  # 聯詠
        api.Contracts.Stocks['3037'],  # 欣興
        api.Contracts.Stocks['3045'],  # 台灣大
        api.Contracts.Stocks['3231'],  # 緯創
        api.Contracts.Stocks['3661'],  # 世芯-KY
        api.Contracts.Stocks['3711'],  # 日月光投控
        api.Contracts.Stocks['4904'],  # 遠傳
        api.Contracts.Stocks['4938'],  # 和碩
        api.Contracts.Stocks['5871'],  # 中租-KY
        api.Contracts.Stocks['5876'],  # 上海商銀
        api.Contracts.Stocks['5880'],  # 合庫金
        api.Contracts.Stocks['6446'],  # 藥華藥
        api.Contracts.Stocks['6505'],  # 台塑化
        api.Contracts.Stocks['6669'],  # 緯穎
    ]
    try:
        # 使用 API 獲取上述所有股票的快照資料
        snapshots = api.snapshots(contracts)

        # 遍歷每個快照並將股票名稱附加到結果中
        for i, snapshot in enumerate(snapshots):
            snapshots[i] = {**vars(snapshot), "name": contracts[i].name}

        # 返回成功響應，包含股票快照資料
        return Response(
            {
                "status": "success",
                "data": snapshots
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        # 出現異常時返回錯誤信息
        return Response(
            {
                "status": "error",
                "message": str(e)
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    
@api_view(['GET', 'POST'])
def default_investment_portfolios(request):
    if request.method == 'GET':
        try:
            # 查詢所有投資組合
            portfolios = DefaultInvestmentPortfolio.objects.all()
            serializer = DefaultInvestmentPortfolioSerializer(portfolios, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        print(request.data)  # 用於檢查接收到的數據

        if 'name' not in request.data or 'investment_threshold' not in request.data:
            return Response({'error': '缺少必要參數'}, status=status.HTTP_400_BAD_REQUEST)

        # 根據投資組合名稱更新或創建投資門檻
        portfolio_name = request.data.get('name')
        investment_threshold = request.data.get('investment_threshold')

        try:
            portfolio, created = DefaultInvestmentPortfolio.objects.get_or_create(
                name=portfolio_name,  # 根據名稱查詢或創建
                defaults={'investment_threshold': investment_threshold}
            )

            if not created:
                # 如果已存在，則更新門檻
                portfolio.investment_threshold = investment_threshold
                portfolio.save()

            # 如果請求中還有 'stocks'，那麼處理投資組合中的股票
            if 'stocks' in request.data:
                for stock_data in request.data['stocks']:
                    # 根據股票代碼和投資組合關聯，創建或更新股票
                    stock, stock_created = DefaultStockList.objects.get_or_create(
                        stock_symbol=stock_data['stock_symbol'],
                        default_investment_portfolio=portfolio,
                        defaults={'stock_name': stock_data.get('stock_name', '')}
                    )
                    # 可以選擇更新股票名稱
                    if not stock_created:
                        stock.stock_name = stock_data.get('stock_name', '')
                        stock.save()

            serializer = DefaultInvestmentPortfolioSerializer(portfolio)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)





# 獲取所有股票合約
# 這個端點返回所有股票的名稱和代碼
@api_view(["GET"])
def get_all_stocks(request):
    try:
        # 獲取所有股票的合約資料
        stocks = api.Contracts.Stocks

        # 初始化一個列表來存儲股票資料
        stock_list = []

        # 遍歷所有市場中的股票合約
        for market, contracts in stocks.__dict__.items():
            if isinstance(contracts, dict):  # 確保 contracts 是字典
                for stock in contracts.values():
                    # 只添加具有 'code' 和 'name' 屬性的股票合約
                    if hasattr(stock, "code") and hasattr(stock, "name"):
                        stock_list.append({
                            "symbol": stock.code,  # 股票代碼
                            "name": stock.name  # 股票名稱
                        })

        # 返回成功響應，包含所有股票的資料
        return JsonResponse({
            "status": "success",
            "data": stock_list
        },
                            status=status.HTTP_200_OK)
    except Exception as e:
        # 記錄錯誤並返回錯誤信息
        logger.error(f"Error fetching stocks: {str(e)}")
        return JsonResponse({
            "status": "error",
            "message": str(e)
        },
                            status=status.HTTP_400_BAD_REQUEST)


# 定義一個全局變數來存儲即時行情數據
last_price = None


# 定義 Shioaji 的回調函數，用於處理即時行情數據
def tick_callback(exchange, tick):
    global last_price
    last_price = tick.close  # 使用 close 價作為即時價格
    logger.info(f"Tick received for {tick.code}: {tick}")


# 設置回調函數來處理即時行情數據
api.quote.set_on_tick_fop_v1_callback(tick_callback)


# 獲取指定股票即時價格
@api_view(["GET"])
def get_stock_price(request, symbol):
    global last_price
    try:
        # 清空之前的價格
        last_price = None

        # 查詢即時行情合約
        contract = api.Contracts.Stocks.get(symbol)
        if not contract:
            return JsonResponse({"error": "無法找到指定股票合約"},
                                status=status.HTTP_404_NOT_FOUND)

        # 股票名稱從合約中提取
        stock_name = contract.name

        # 訂閱即時行情
        api.quote.subscribe(
            contract,
            quote_type=sj.constant.QuoteType.Tick,
            version=sj.constant.QuoteVersion.v1,
        )

        # 嘗試獲取收盤價作為備用
        if last_price is None:
            snap = api.snapshots([contract])
            last_price = snap[0].close if snap else None

        # 返回即時價格或收盤價，並附加股票名稱
        if last_price is not None:
            response_data = {
                "symbol": symbol,
                "name": stock_name,
                "price": last_price,
            }
            return JsonResponse({
                "status": "success",
                "data": response_data
            },
                                status=status.HTTP_200_OK)
        else:
            return JsonResponse({"error": "未能獲取即時價格或收盤價"},
                                status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Error fetching stock price for {symbol}: {str(e)}")
        return JsonResponse({
            "status": "error",
            "message": str(e)
        },
                            status=status.HTTP_400_BAD_REQUEST)


# 獲取當前用戶的所有投資組合
@api_view(["GET"])
@permission_classes([IsAuthenticated])  # 需要認證用戶才能訪問
def get_portfolios(request):
    portfolios = InvestmentPortfolio.objects.filter(
        user=request.user).prefetch_related("investments")
    response_data = []

    for portfolio in portfolios:
        # 計算投資組合的總市值和總投資金額
        total_value = portfolio.calculate_portfolio_value()
        total_invested = sum(
            investment.shares * investment.buy_price
            for investment in portfolio.investments.filter(available=True))

        # 計算投資組合的績效（%）
        performance = ((total_value - total_invested) / total_invested *
                       100 if total_invested else 0)

        # 整理每個投資組合的詳細資訊
        portfolio_data = {
            "id":
            portfolio.id,
            "name":
            portfolio.name,
            "description":
            portfolio.description,
            "performance":
            round(performance, 2),
            "marketValue":
            total_value,
            "annualReturn":
            performance / (portfolio.investments.count() or 1),  # 簡單平均年回報
            "dayChange":
            "+0.00",  # 當日變動暫設為 0
            "investments":
            InvestmentSerializer(portfolio.investments.all(),
                                 many=True).data,  # 投資明細
        }

        # 調試：確認 investments 列表中的 name 是否正確包含
        print(portfolio_data["investments"])
        response_data.append(portfolio_data)

    return Response({
        "status": "success",
        "data": response_data
    },
                    status=status.HTTP_200_OK)


# 創建新的投資組合
@api_view(["POST"])
@permission_classes([IsAuthenticated])  # 確保只有已認證用戶可以訪問
def create_portfolio(request):
    user = request.user
    print(f"Authenticated user: {user}")  # 調試：檢查後端是否識別到用戶
    serializer = InvestmentPortfolioSerializer(data=request.data)

    if serializer.is_valid():
        # 保存投資組合並將用戶與其關聯
        portfolio = serializer.save(user=user)
        print(f"Portfolio created: {portfolio}")  # 調試：確認創建的投資組合

        # 檢查是否傳遞了投資資料並進行調試輸出
        for investment in request.data.get("investments", []):
            print(f"Investment: {investment}")  # 調試：打印每個投資項目的資料

        # 返回成功響應與創建的投資組合資料
        return Response({
            "status": "success",
            "data": serializer.data
        },
                        status=status.HTTP_201_CREATED)
    else:
        print(f"Serializer errors: {serializer.errors}")  # 調試：輸出序列化過程中的錯誤
    return Response({
        "status": "error",
        "message": serializer.errors
    },
                    status=status.HTTP_400_BAD_REQUEST)


# 獲取特定投資組合的詳細資料
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # 確保只有已認證用戶可以訪問
def get_portfolio_detail(request, portfolio_id):
    try:
        # 獲取投資組合並確認是否屬於當前用戶
        portfolio = InvestmentPortfolio.objects.get(id=portfolio_id,
                                                    user=request.user)
        serializer = InvestmentPortfolioSerializer(portfolio)
        return Response({
            "status": "success",
            "data": serializer.data
        },
                        status=status.HTTP_200_OK)
    except InvestmentPortfolio.DoesNotExist:
        return Response({"error": "未找到投資組合"}, status=status.HTTP_404_NOT_FOUND)


# 向指定投資組合中添加新的投資
@api_view(["POST"])
def add_investment(request, portfolio_id):
    # 根據ID獲取對應的投資組合
    portfolio = InvestmentPortfolio.objects.get(id=portfolio_id)

    # 序列化並驗證提交的投資數據
    serializer = InvestmentSerializer(data=request.data)
    if serializer.is_valid():
        # 保存新投資並與投資組合關聯
        serializer.save(portfolio=portfolio)

        # 返回成功響應與新增的投資資料
        return Response({
            "status": "success",
            "data": serializer.data
        },
                        status=status.HTTP_201_CREATED)
    return Response({
        "status": "error",
        "message": serializer.errors
    },
                    status=status.HTTP_400_BAD_REQUEST)


# 刪除指定的投資組合
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])  # 確保只有認證用戶可以刪除投資組合
def delete_portfolio(request, portfolio_id):
    try:
        # 確認該投資組合屬於當前用戶
        portfolio = InvestmentPortfolio.objects.get(id=portfolio_id,
                                                    user=request.user)

        # 刪除該投資組合
        portfolio.delete()
        return Response({
            "status": "success",
            "message": "投資組合已刪除"
        },
                        status=status.HTTP_200_OK)
    except InvestmentPortfolio.DoesNotExist:
        # 如果未找到投資組合或用戶無權限，返回404錯誤
        return Response({
            "status": "error",
            "message": "未找到投資組合或您無權限刪除此投資組合"
        },
                        status=status.HTTP_404_NOT_FOUND)


# 一個簡單的受保護視圖，只有已認證用戶可以訪問
@api_view(["GET"])
@permission_classes([IsAuthenticated])  # 確保只有認證用戶可以訪問
def some_protected_view(request):
    return JsonResponse({"message": "已通過身份驗證"})  # 返回簡單的成功信息
