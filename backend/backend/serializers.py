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
            "name",
        ]

    def create(self, validated_data):
        validated_data["createdId"] = self.context["request"].user
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
            'start_date',
            'target'
        ]

    def create(self, validated_data):
        validated_data["createdId"] = self.context["request"].user
        return super().create(validated_data)
