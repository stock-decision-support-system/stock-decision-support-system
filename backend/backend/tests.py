from django.test import TestCase
import shioaji as sj
import yaml

with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)


class ShioajiTestCase(TestCase):
    def test_virtual_account_login(self):
        api = sj.Shioaji(simulation=True)  # 模擬模式
        api.login(
            api_key=config["shioaji"]["api_key"],
            secret_key=config["shioaji"]["secret_key"],
            # contracts_cb=lambda security_type: print(
            #    f"{repr(security_type)} fetch done."
            # ),  # 獲取商品檔Callback
        )
        # print(api.stock_account)# 預設帳號
        """
         order = api.Order(
            price=12,
            quantity=1,
            action=sj.constant.Action.Buy,
            price_type=sj.constant.StockPriceType.LMT,
            order_type=sj.constant.OrderType.ROD,
            order_lot=sj.constant.StockOrderLot.Common,
            account=api.stock_account
         )

        # print(api.Contracts) #商品檔資訊
        # print(api.Contracts.Stocks["2890"]) #證券
        # print(api.Contracts.Futures["TXFA3"]) #期貨
        # print(api.Contracts.Options["TXO18000R3"]) #選擇權
        # print(api.Contracts.Indexs.TSE) #顯示所有指數
        # print(api.Contracts.Indexs.TSE["001"])  # 指數
        """

    def test_tick(self):  # 整股 即時行情
        api = sj.Shioaji(simulation=True)  # 模擬模式
        api.login(
            api_key=config["shioaji"]["api_key"],
            secret_key=config["shioaji"]["secret_key"],
        )
        api.quote.subscribe(
            api.Contracts.Stocks["2330"],
            quote_type=sj.constant.QuoteType.Tick,
            version=sj.constant.QuoteVersion.v1,
        )
        

    def test_order(self):
        api = sj.Shioaji(simulation=True)  # 模擬模式
        api.login(
            api_key=config["shioaji"]["api_key"],
            secret_key=config["shioaji"]["secret_key"],
        )
        """
        contract = api.Contracts.Stocks.TSE.TSE2890
        order = api.Order(
            price=17, 
            quantity=3, 
            action=sj.constant.Action.Buy, 
            price_type=sj.constant.StockPriceType.LMT, 
            order_type=sj.constant.OrderType.ROD, 
            order_lot=sj.constant.StockOrderLot.Common, 
            # daytrade_short=False,
            custom_field="test",
            account=api.stock_account
        )
        trade = api.place_order(contract, order)
        print(trade)
        """
        # trade = api.update_status(api.stock_account) #更新狀態(成交後)
        # print(trade)

        #api.update_status(api.stock_account)  # 取得證券委託狀態
        #print(api.list_trades())
    def test_balance(self):
        api = sj.Shioaji(simulation=True)  # 模擬模式
        api.login(
            api_key=config["shioaji"]["api_key"],
            secret_key=config["shioaji"]["secret_key"],
        )
        print(api.account_balance())#查看銀行餘額
        
