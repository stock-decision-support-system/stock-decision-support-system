import traceback
from datetime import datetime, timedelta
import time


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

#證券登入測試
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # 確保用戶已登錄
def login_to_shioaji_view(request):
    try:
        # 使用當前登錄的用戶進行操作
        # user = '11046003'
        user = request.user
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

#查看銀行餘額
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_account_balance(request):
    try:
        # 使用當前登錄的用戶進行操作
        # user = '11046003'
        user = request.user  # 根據你的系統設置
        api, accounts = login_to_shioaji(user)  # 假設已經有 `login_to_shioaji` 函數

        # 調用帳戶餘額
        balance_data = api.account_balance()

        # 組織回傳資料
        serialized_balance = {
            "status": balance_data.status.name,  # 轉換 FetchStatus 為字串
            "acc_balance": balance_data.acc_balance,
            "date": balance_data.date,
            "errmsg": balance_data.errmsg if balance_data.errmsg else ""  # 錯誤訊息，如果有的話
        }

        return JsonResponse({
            "status": "success",
            "data": serialized_balance
        }, status=200)

    except Exception as e:
        error_message = str(e)
        error_traceback = traceback.format_exc()

        return JsonResponse({
            "status": "error",
            "message": error_message,
            "details": error_traceback
        }, status=400)

#查詢股票交易狀況
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_order_status(request):
    try:
        # 使用當前登錄的用戶進行操作
        user = request.user.username
        # user = '11046013'
        api, accounts = login_to_shioaji(user)

        # 更新證券委託狀態
        api.update_status(api.stock_account)

        # 獲取所有交易（下單）狀態
        trades = api.list_trades()  # 列出當前所有交易（下單）狀態

         # 如果沒有交易，返回空數據
        if not trades:
            return JsonResponse({
                "status": "success",
                "data": [],
                "message": "No active trades found."
            }, status=200)

        # 將交易狀態轉換為 JSON 格式
        serialized_trades = []
        for trade in trades:
            trade_data = {
                "contract": {
                    "exchange": trade.contract.exchange.value if trade.contract.exchange else "Unknown",
                    "code": trade.contract.code if trade.contract.code else "Unknown",
                    "symbol": trade.contract.symbol if trade.contract.symbol else "Unknown",
                    "name": trade.contract.name if trade.contract.name else "Unknown",
                    "category": trade.contract.category if trade.contract.category else "Unknown",
                    "unit": trade.contract.unit if trade.contract.unit else 0,
                    "limit_up": trade.contract.limit_up if trade.contract.limit_up else 0.0,
                    "limit_down": trade.contract.limit_down if trade.contract.limit_down else 0.0,
                    "reference": trade.contract.reference if trade.contract.reference else 0.0,
                    "update_date": trade.contract.update_date if trade.contract.update_date else "",
                    "day_trade": trade.contract.day_trade.value if trade.contract.day_trade else "No",
                },
                "order": {
                    "action": trade.order.action.value if trade.order.action else "Unknown",
                    "price": trade.order.price,
                    "quantity": trade.order.quantity,
                    "id": trade.order.id,
                    "seqno": trade.order.seqno,
                    "ordno": trade.order.ordno,
                    "account": {
                        "account_type": trade.order.account.account_type.value,
                        "person_id": trade.order.account.person_id,
                        "broker_id": trade.order.account.broker_id,
                        "account_id": trade.order.account.account_id,
                    },
                    "custom_field": trade.order.custom_field if trade.order.custom_field else "",
                    "price_type": trade.order.price_type.value if trade.order.price_type else "Unknown",
                    "order_type": trade.order.order_type.value if trade.order.order_type else "Unknown",
                    "daytrade_short": trade.order.daytrade_short,
                },
                "status": {
                    "id": trade.status.id,
                    "status": trade.status.status.value if trade.status.status else "Unknown",
                    "status_code": trade.status.status_code,
                    "order_datetime": trade.status.order_datetime.isoformat() if trade.status.order_datetime else "",
                    "order_quantity": trade.status.order_quantity,
                    "deals": [
                        {
                            "seq": deal.seq,
                            "price": deal.price,
                            "quantity": deal.quantity,
                            "ts": deal.ts
                        } for deal in trade.status.deals
                    ] if trade.status.deals else []
                }
            }
            serialized_trades.append(trade_data)

        # 返回 JSON 格式的訂單狀態和交易資料
        return JsonResponse({
            "status": "success",
            "data": serialized_trades
        }, status=200)

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=400)


#查詢損益與持有股票
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_portfolio_status(request):
    try:
        user = request.user
        api, accounts = login_to_shioaji(user)

        start_date = request.query_params.get("start_date", "2024-05-05")
        end_date = request.query_params.get("end_date", "2024-10-13")

        positions = api.list_positions(api.stock_account,unit=sj.constant.Unit.Share)
        profit_loss = api.list_profit_loss(api.stock_account, start_date, end_date)
        settlements = api.settlements(api.stock_account)

        serialized_positions = []
        
        for position in positions:
            stock_id = position.code  # 使用股票代號
            # 調用你的 get_stock_detail 方法來獲取股票名稱
            stock_name = get_stock_name_by_id(stock_id)
            
            serialized_positions.append({
                "id": position.id,
                "code": position.code,
                "name": stock_name,  # 將股票名稱加入
                "direction": position.direction.name,
                "quantity": position.quantity,
                "price": position.price,
                "last_price": position.last_price,
                "pnl": position.pnl,
                "yd_quantity": position.yd_quantity,
                "margin_purchase_amount": position.margin_purchase_amount,
                "collateral": position.collateral,
                "short_sale_margin": position.short_sale_margin,
                "interest": position.interest,
            })

        serialized_profit_loss = [
            {
                "id": pl.id,
                "code": pl.code,
                "seqno": pl.seqno,
                "dseq": pl.dseq,
                "quantity": pl.quantity,
                "price": pl.price,
                "pnl": pl.pnl,
                "pr_ratio": pl.pr_ratio,
                "cond": pl.cond,
                "date": pl.date
            }
            for pl in profit_loss
        ]

        serialized_settlements = [
            {
                "settle_date": settlement.date.isoformat(),
                "amount": settlement.amount,
                "T": settlement.T
            }
            for settlement in settlements
        ]

        return JsonResponse({
            "status": "success",
            "positions": serialized_positions,
            "profit_loss": serialized_profit_loss,
            "settlements": serialized_settlements
        }, status=200)

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e),
            "details": traceback.format_exc()
        }, status=400)


def get_stock_name_by_id(stock_id):
    try:
        # 根據傳入的股票代號，獲取對應的股票合約
        stock_contract = api.Contracts.Stocks[stock_id]

        # 使用 API 獲取該合約的快照數據
        snapshots = api.snapshots([stock_contract])

        # 返回股票名稱
        return stock_contract.name
    except Exception as e:
        # 出現問題時返回 None 或處理錯誤
        print(f"Error fetching stock name for {stock_id}: {str(e)}")
        return None


    except Exception as e:
        error_message = str(e)
        error_traceback = traceback.format_exc()  # 捕捉詳細的錯誤信息

        return JsonResponse({
            "status": "error",
            "message": error_message,
            "details": error_traceback
        }, status=400)


#單獨下單零股
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def place_odd_lot_order(request):
    try:
        # 使用當前登錄的用戶進行操作
        user = request.user  # 根據你系統的需求設置當前使用者
        # user = '11046003'
        api, accounts = login_to_shioaji(user)

        # 從請求中獲取下單相關參數
        stock_symbol = request.data.get("stock_symbol")  # 股票代號
        order_quantity = request.data.get("order_quantity")  # 下單股數
        order_price = request.data.get("order_price")  # 下單價格
        action = request.data.get("action", sj.constant.Action.Buy)  # 默認為買單
        price_type = request.data.get("price_type", sj.constant.StockPriceType.LMT)  # 默認為限價單
        order_type = request.data.get("order_type", sj.constant.OrderType.ROD) # 默認為ROD

        # 構建股票合約
        contract = api.Contracts.Stocks.TSE[stock_symbol]

        # 構建零股下單委託
        order = api.Order(
            price=order_price,
            quantity=order_quantity,
            action=action,  # "Buy" or "Sell"
            price_type=price_type,  # "LMT" for limit, "MKT" for market
            order_type=order_type,  # ROD (當日有效)
            order_lot=sj.constant.StockOrderLot.IntradayOdd,  # 零股
            account=api.stock_account  # 設定帳戶
        )

        # 發送下單請求
        trade = api.place_order(contract, order)

        # 手動序列化 Trade 結構，將 contract, order, 和 status 資料轉為 JSON
        serialized_trade = {
            "contract": {
                "exchange": trade.contract.exchange.value,
                "code": trade.contract.code,
                "symbol": trade.contract.symbol,
                "name": trade.contract.name,
                "category": trade.contract.category,
                "limit_up": trade.contract.limit_up,
                "limit_down": trade.contract.limit_down,
                "reference": trade.contract.reference,
                "update_date": trade.contract.update_date,
                "margin_trading_balance": trade.contract.margin_trading_balance,
                "short_selling_balance": trade.contract.short_selling_balance,
                "day_trade": trade.contract.day_trade.name,
            },
            "order": {
                "action": trade.order.action.name,
                "price": trade.order.price,
                "quantity": trade.order.quantity,
                "id": trade.order.id,
                "seqno": trade.order.seqno,
                "ordno": trade.order.ordno,
                "account": {
                    "account_type": trade.order.account.account_type.name,
                    "person_id": trade.order.account.person_id,
                    "broker_id": trade.order.account.broker_id,
                    "account_id": trade.order.account.account_id,
                    "signed": trade.order.account.signed,
                },
                "price_type": trade.order.price_type.name,
                "order_type": trade.order.order_type.name,
                "order_lot": trade.order.order_lot.name,
            },
            "status": {
                "id": trade.status.id,
                "status": trade.status.status.name,
                "status_code": trade.status.status_code,
                "order_datetime": trade.status.order_datetime.isoformat(),
                "deals": [
                    {
                        "seq": deal.seq,
                        "price": deal.price,
                        "quantity": deal.quantity,
                        "timestamp": deal.ts
                    }
                    for deal in trade.status.deals
                ]
            }
        }

        return JsonResponse({
            "status": "success",
            "message": f"Odd-lot order placed for {stock_symbol}.",
            "trade": serialized_trade
        })

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=400)


import traceback

#單獨刪單
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_odd_lot_order(request):
    try:
        # 使用當前登錄的用戶進行操作
        # user = '11046003'
        user = request.user
        api, accounts = login_to_shioaji(user)

        # 從請求中獲取取消訂單的相關參數
        order_id = request.data.get("order_id")  # 下單時返回的訂單ID

        if not order_id:
            return JsonResponse({
                "status": "error",
                "message": "order_id is required"
            }, status=400)

        # 打印用於調試的日誌
        print(f"Stock account: {api.stock_account}")

        # 使用 update_status 來獲取所有訂單狀態
        updated_status = api.update_status(api.stock_account)

        # 調試：檢查是否成功獲取到訂單狀態數據
        if updated_status is None:
            print("Failed to retrieve order status data. Trying list_trades.")
            trades = api.list_trades()  # 嘗試使用 list_trades()

            if not trades:
                return JsonResponse({
                    "status": "error",
                    "message": "No trades found, unable to cancel order."
                }, status=500)

            # 調試：輸出交易列表
            print(f"Trades: {trades}")

            # 嘗試查找訂單
            trade = next((trade for trade in trades if trade.order.id == order_id), None)
        else:
            # 查找對應的訂單
            trade = next((trade for trade in updated_status if trade.order.id == order_id), None)

        if trade is None:
            return JsonResponse({
                "status": "error",
                "message": f"Order with ID {order_id} not found."
            }, status=404)

        # 發送取消訂單請求
        api.cancel_order(trade)

        # 更新訂單狀態
        api.update_status(api.stock_account)

        # 返回已取消的交易資料
        return JsonResponse({
            "status": "success",
            "message": f"Order with ID {order_id} canceled successfully."
        })

    except Exception as e:
        error_message = str(e)
        error_traceback = traceback.format_exc()  # 獲取完整的錯誤堆疊信息

        return JsonResponse({
            "status": "error",
            "message": error_message,
            "details": error_traceback
        }, status=400)


#批次下單零股
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def place_odd_lot_orders(request):
    try:
        print("收到的請求資料: ", request.data)

        # 使用當前登錄的用戶進行操作
        user = request.user
        # user = '11046003'
        api, accounts = login_to_shioaji(user)

        # 從請求中獲取多筆下單參數
        stock_symbols = request.data.get("stock_symbols", [])  # 股票代號列表
        order_quantities = request.data.get("order_quantities", [])  # 下單股數列表
        order_prices = request.data.get("order_prices", [])  # 下單價格列表
        actions = request.data.get("actions", [sj.constant.Action.Buy] * len(stock_symbols))  # 默認為買單
        price_types = request.data.get("price_types", [sj.constant.StockPriceType.LMT] * len(stock_symbols))  # 默認為限價單
        order_types = request.data.get("order_types", [sj.constant.OrderType.ROD] * len(stock_symbols)) # 默認為ROD

        print("股票代號: ", stock_symbols)
        print("下單股數: ", order_quantities)
        print("下單價格: ", order_prices)
        print("操作行為: ", actions)


        # 檢查參數是否一致
        if not (len(stock_symbols) == len(order_quantities) == len(order_prices) == len(actions) == len(price_types)):
            return JsonResponse({
                "status": "error",
                "message": "The number of stock symbols, quantities, prices, actions, and price types must match."
            }, status=400)

        trades = []  # 儲存所有交易結果

        # 依次處理每一筆訂單
        for i in range(len(stock_symbols)):
            stock_symbol = stock_symbols[i]
            order_quantity = order_quantities[i]
            order_price = order_prices[i]
            action = actions[i]
            price_type = price_types[i]
            order_type = order_types[i]

            # 檢查該股票代號是否存在於 API 合約中
            contract = api.Contracts.Stocks.TSE.get(stock_symbol)
            if contract is None:
                return JsonResponse({
                    "status": "error",
                    "message": f"無效的股票代號: {stock_symbol}"
                }, status=400)

            # 構建零股下單委託
            order = api.Order(
                price=order_price,
                quantity=order_quantity,
                action=action,
                price_type=price_type,
                order_type=order_type,  # ROD (當日有效)
                order_lot=sj.constant.StockOrderLot.IntradayOdd,  # 零股
                account=api.stock_account
            )

            # 發送下單請求
            trade = api.place_order(contract, order)

            # 手動序列化 Trade 結構
            serialized_trade = {
                "contract": {
                    "exchange": trade.contract.exchange.value,
                    "code": trade.contract.code,
                    "symbol": trade.contract.symbol,
                    "name": trade.contract.name,
                    "category": trade.contract.category,
                    "limit_up": trade.contract.limit_up,
                    "limit_down": trade.contract.limit_down,
                    "reference": trade.contract.reference,
                    "update_date": trade.contract.update_date,
                    "margin_trading_balance": trade.contract.margin_trading_balance,
                    "short_selling_balance": trade.contract.short_selling_balance,
                    "day_trade": trade.contract.day_trade.name,
                },
                "order": {
                    "action": trade.order.action.name,
                    "price": trade.order.price,
                    "quantity": trade.order.quantity,
                    "id": trade.order.id,
                    "seqno": trade.order.seqno,
                    "ordno": trade.order.ordno,
                    "account": {
                        "account_type": trade.order.account.account_type.name,
                        "person_id": trade.order.account.person_id,
                        "broker_id": trade.order.account.broker_id,
                        "account_id": trade.order.account.account_id,
                        "signed": trade.order.account.signed,
                    },
                    "price_type": trade.order.price_type.name,
                    "order_type": trade.order.order_type.name,
                    "order_lot": trade.order.order_lot.name,
                },
                "status": {
                    "id": trade.status.id,
                    "status": trade.status.status.name,
                    "status_code": trade.status.status_code,
                    "order_datetime": trade.status.order_datetime.isoformat(),
                    "deals": [
                        {
                            "seq": deal.seq,
                            "price": deal.price,
                            "quantity": deal.quantity,
                            "timestamp": deal.ts
                        }
                        for deal in trade.status.deals
                    ]
                }
            }

            # 將序列化的交易加入結果列表
            trades.append(serialized_trade)

        return JsonResponse({
            "status": "success",
            "message": "Multiple odd-lot orders placed successfully.",
            "trades": trades
        })

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=400)

#批次刪單零股
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_odd_lot_orders(request):
    try:
        # 使用當前登錄的用戶進行操作
        # user = '11046003'
        user = request.user
        api, accounts = login_to_shioaji(user)

        # 從請求中獲取多筆訂單ID
        order_ids = request.data.get("order_ids", [])

        if not order_ids:
            return JsonResponse({
                "status": "error",
                "message": "order_ids are required."
            }, status=400)

        cancelled_orders = []  # 儲存所有取消的訂單結果

        # 使用 update_status 來獲取所有訂單狀態
        updated_status = api.update_status(api.stock_account)

        # 調試：檢查是否成功獲取到訂單狀態數據
        if updated_status is None:
            print("Failed to retrieve order status data. Trying list_trades.")
            trades = api.list_trades()  # 嘗試使用 list_trades()

            if not trades:
                return JsonResponse({
                    "status": "error",
                    "message": "No trades found."
                }, status=500)

            # 遍歷 order_ids 並取消每個訂單
            for order_id in order_ids:
                trade = next((trade for trade in trades if trade.order.id == order_id), None)

                if trade is None:
                    cancelled_orders.append({
                        "order_id": order_id,
                        "status": "Order not found"
                    })
                    continue

                # 發送取消訂單請求
                api.cancel_order(trade)

                # 將取消成功的訂單加入結果
                cancelled_orders.append({
                    "order_id": order_id,
                    "status": "cancelled"
                })
        else:
            # 使用 updated_status 遍歷 order_ids 並取消每個訂單
            for order_id in order_ids:
                trade = next((trade for trade in updated_status if trade.order.id == order_id), None)

                if trade is None:
                    cancelled_orders.append({
                        "order_id": order_id,
                        "status": "Order not found"
                    })
                    continue

                # 發送取消訂單請求
                api.cancel_order(trade)

                # 將取消成功的訂單加入結果
                cancelled_orders.append({
                    "order_id": order_id,
                    "status": "cancelled"
                })

        # 更新訂單狀態
        api.update_status(api.stock_account)

        # 返回已取消的交易資料
        return JsonResponse({
            "status": "success",
            "message": "Multiple odd-lot orders cancelled successfully.",
            "cancelled_orders": cancelled_orders
        })

    except Exception as e:
        error_message = str(e)
        error_traceback = traceback.format_exc()  # 獲取完整的錯誤堆疊信息

        return JsonResponse({
            "status": "error",
            "message": error_message,
            "details": error_traceback
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

#抓預設投資組合資料
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

@api_view(['GET'])
def get_portfolio_detaila(request, portfolio_id):
    logger.info(f"Request received for portfolio ID: {portfolio_id}")
    logger.info("This is an info log message")

    try:
        portfolio = DefaultInvestmentPortfolio.objects.get(id=portfolio_id)
        logger.info(f"Portfolio found: {portfolio}")
        serializer = DefaultInvestmentPortfolioSerializer(portfolio)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except DefaultInvestmentPortfolio.DoesNotExist:
        logger.error("Portfolio not found")
        return Response({'error': 'Portfolio not found'}, status=status.HTTP_404_NOT_FOUND)

#計算投資門檻
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def calculate_threshold(request, portfolio_id):
    print(f"Calculating threshold for portfolio: {portfolio_id}")  # 用來檢查函數是否執行
    
    try:
        portfolio = DefaultInvestmentPortfolio.objects.get(id=portfolio_id)
        stocks = portfolio.stocks.all()
        # 當調用每隻股票的價格計算時打印出來
        for stock in stocks:
            print(f"Calculating for stock: {stock.stock_symbol}")  # 打印每隻股票代號
            price = get_current_stock_price(stock.stock_symbol)
            print(f"Price for {stock.stock_symbol}: {price}")  # 打印股票價格
        # 其餘代碼...

        # 計算每個股票的總價，將所有股票的價格加起來
        total_investment_threshold = 0
        for stock in stocks:
            # 調用獲取股票價格的函數
            price = get_current_stock_price(stock.stock_symbol)
            total_investment_threshold += price * stock.quantity
        
        # 更新該投資組合的投資門檻
        portfolio.investment_threshold = total_investment_threshold
        portfolio.save()  # 保存變更到資料庫
        
        # 返回更新的門檻
        return Response({"threshold": total_investment_threshold}, status=status.HTTP_200_OK)
    
    except DefaultInvestmentPortfolio.DoesNotExist:
        return Response({'error': '投資組合不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_current_stock_price(stock_symbol):
    try:
        return get_closing_price(stock_symbol)  # 現在只傳遞股票代碼
    except Exception as e:
        print(f"Error fetching stock price for {stock_symbol}: {str(e)}")
        return 0


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



# 輔助函數，用於生成從 2024 年到當前日期每月 1 日的日期列表
def generate_first_days():
    today = datetime.today()
    current = datetime(2024, 1, 1)  # 從 2024 年 1 月 1 日開始
    dates = []
    
    # 迴圈生成每個月的 1 號，直到今天
    while current <= today:
        dates.append(current.strftime('%Y-%m-%d'))  # 將日期轉換為字串格式
        if current.month == 12:
            current = current.replace(year=current.year + 1, month=1, day=1)
        else:
            current = current.replace(month=current.month + 1, day=1)
    
    return dates

from datetime import datetime, timedelta

def get_closing_price(stock_symbol, date=None, max_retries=5):
    try:
        # 查詢股票合約
        contract = api.Contracts.Stocks[stock_symbol]

        if date:
            retries = 0
            while retries < max_retries:
                # 嘗試查詢特定日期的歷史收盤價
                ticks = api.ticks(
                    contract=contract,
                    date=date,
                    query_type=sj.constant.TicksQueryType.LastCount,
                    last_cnt=1  # 只取最後一筆
                )

                if ticks and hasattr(ticks, 'close') and len(ticks.close) > 0:
                    print(f"Data found for {stock_symbol} on {date}. Close: {ticks.close[-1]}")
                    return ticks.close[-1]
                else:
                    print(f"No data for {stock_symbol} on {date}. Retrying for the previous day.")
                    # 日期回溯一天
                    date = (datetime.strptime(date, '%Y-%m-%d') - timedelta(days=1)).strftime('%Y-%m-%d')
                    retries += 1

            print(f"No valid data for {stock_symbol} after {max_retries} retries. Returning 0.")
            return 0

        else:
            # 沒有提供日期，則查詢當前即時行情快照
            snapshot = api.snapshots([contract])

            if snapshot and hasattr(snapshot[0], 'close'):
                print(f"Data found for {stock_symbol}. Close: {snapshot[0].close}")
                return snapshot[0].close
            else:
                print(f"No data for {stock_symbol}. Returning 0.")
                return 0

    except Exception as e:
        print(f"Error fetching data for {stock_symbol}: {str(e)}")
        return 0


#投資績效
@api_view(["POST"])
def portfolio_monthly_performance(request, portfolio_id):
    try:
        portfolio = DefaultInvestmentPortfolio.objects.get(id=portfolio_id)
        stocks = DefaultStockList.objects.filter(default_investment_portfolio=portfolio)

        if not stocks.exists():
            return Response({'error': '投資組合中沒有股票'}, status=status.HTTP_404_NOT_FOUND)

        months = generate_first_days()  # 生成每個月的1日日期
        result = {month: 0 for month in months}
        total_investment_cost = 0
        current_portfolio_value = 0

        for stock in stocks:
            # 對於每支股票，找到該月份第一筆有效收盤價作為成本
            initial_price = get_closing_price(stock.stock_symbol, months[0])  # 查詢1月份第一筆有效價格
            stock_cost = stock.quantity * initial_price
            total_investment_cost += stock_cost

            for month in months:
                closing_price = get_closing_price(stock.stock_symbol, month)
                stock_value = stock.quantity * closing_price
                result[month] += stock_value

                if month == months[-1]:  # 只計算最新月份的市值
                    current_portfolio_value += stock_value

        pnl = current_portfolio_value - total_investment_cost  # 損益計算
        roi = (pnl / total_investment_cost) * 100 if total_investment_cost != 0 else 0  # 投報率計算

        return JsonResponse({
            'portfolio_name': portfolio.name,
            'performance': result,
            'pnl': pnl,
            'roi': roi
        }, status=status.HTTP_200_OK)

    except DefaultInvestmentPortfolio.DoesNotExist:
        return JsonResponse({'error': '找不到投資組合'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
