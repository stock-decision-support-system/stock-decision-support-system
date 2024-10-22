from rest_framework import serializers
from .models import (
    AccountType,
    CustomUser,
    Accounting,
    ConsumeType,
    APICredentials,
    InvestmentPortfolio,
    Investment,
    Budget,
    DefaultInvestmentPortfolio,
    DefaultStockList,
)


class CustomUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = "__all__"


class ConsumeTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ConsumeType
        fields = [
            "id",
            "icon",
            "name",
        ]

    def create(self, validated_data):
        validated_data["createdId"] = self.context["request"].user
        return super().create(validated_data)


class AccountTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AccountType
        fields = [
            "id",
            "icon",
            "account_name",
        ]

    def create(self, validated_data):
        validated_data["username"] = self.context["request"].user
        return super().create(validated_data)


class AccountingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Accounting
        fields = [
            "id",  # 主鍵
            "accountingName",  # 記帳名稱
            "amount",  # 金額
            "accountType",  # 帳戶類型
            "consumeType",  # 消費類型 (外鍵)
            "assetType",  # 資產類型
            "transactionDate",  # 交易日期
            "content",  # 交易內容
        ]

    def create(self, validated_data):
        validated_data["createdId"] = self.context["request"].user
        return super().create(validated_data)


class APICredentialsSerializer(serializers.ModelSerializer):

    class Meta:
        model = APICredentials
        fields = [
            "id",
            "api_key",
            "secret_key",
            "bank_name",
            "region",
            "branch",
            "account",
            "ca_path",
            "ca_passwd",
            "person_id",
        ]

    def create(self, validated_data):
        validated_data["username"] = self.context["request"].user
        return super().create(validated_data)


class InvestmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Investment
        fields = ["symbol", "shares", "buy_price", "available"]  # 確保包含必要的欄位


class InvestmentPortfolioSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    investments = InvestmentSerializer(many=True)  # 加上投資的序列化器

    class Meta:
        model = InvestmentPortfolio
        fields = [
            "id", "name", "description", "available", "user", "investments"
        ]

    def create(self, validated_data):
        investments_data = validated_data.pop("investments", [])  # 獲取投資數據
        portfolio = InvestmentPortfolio.objects.create(
            **validated_data)  # 創建投資組合

        # 保存每一個投資項目
        for investment_data in investments_data:
            Investment.objects.create(portfolio=portfolio, **investment_data)

        return portfolio


class BudgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Budget
        fields = [
            'id',
            'name',
            'start_date',
            'end_date',
            'target'
        ]

    def create(self, validated_data):
        validated_data["username"] = self.context["request"].user
        return super().create(validated_data)
    

class DefaultStockListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefaultStockList
        fields = ['stock_symbol', 'stock_name', 'quantity']

class DefaultInvestmentPortfolioSerializer(serializers.ModelSerializer):
    stocks = DefaultStockListSerializer(many=True, required=False)

    class Meta:
        model = DefaultInvestmentPortfolio
        fields = ['id', 'name', 'investment_threshold', 'stocks']

    def create(self, validated_data):
        stocks_data = validated_data.pop('stocks', [])
        portfolio = DefaultInvestmentPortfolio.objects.create(**validated_data)
        for stock_data in stocks_data:
            DefaultStockList.objects.create(default_investment_portfolio=portfolio, **stock_data)
        return portfolio

    def update(self, instance, validated_data):
        stocks_data = validated_data.pop('stocks', [])
        instance.name = validated_data.get('name', instance.name)
        instance.investment_threshold = validated_data.get('investment_threshold', instance.investment_threshold)
        instance.save()

        # Clear existing stocks and add the new ones
        instance.stocks.all().delete()
        for stock_data in stocks_data:
            DefaultStockList.objects.create(default_investment_portfolio=instance, **stock_data)

        return instance



