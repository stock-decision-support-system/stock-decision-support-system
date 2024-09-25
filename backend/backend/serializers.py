from rest_framework import serializers
from .models import (
    CustomUser,
    Accounting,
    ConsumeType,
    APICredentials,
    InvestmentPortfolio,
    Investment,
    Asset,
    Liability,
    Budget,
)


class CustomUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = "__all__"


class ConsumeTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ConsumeType
        fields = "__all__"


class AccountingSerializer(serializers.ModelSerializer):
    consumeType = ConsumeTypeSerializer(read_only=True)

    class Meta:
        model = Accounting
        fields = "__all__"


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
        fields = ["id", "name", "description", "available", "user", "investments"]

    def create(self, validated_data):
        investments_data = validated_data.pop("investments", [])  # 獲取投資數據
        portfolio = InvestmentPortfolio.objects.create(**validated_data)  # 創建投資組合

        # 保存每一個投資項目
        for investment_data in investments_data:
            Investment.objects.create(portfolio=portfolio, **investment_data)

        return portfolio


class AssetSerializer(serializers.ModelSerializer):
    transactions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = "__all__"


class LiabilitySerializer(serializers.ModelSerializer):

    class Meta:
        model = Liability
        fields = "__all__"


class BudgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Budget
        fields = "__all__"
