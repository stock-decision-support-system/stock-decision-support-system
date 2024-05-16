from rest_framework import serializers
from .models import CustomUser, Accounting, ConsumeType, APICredentials, InvestmentPortfolio, Investment, Asset, \
    Liability, Transaction, Budget


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

class ConsumeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumeType
        fields = '__all__'

class AccountingSerializer(serializers.ModelSerializer):
    consumeType = ConsumeTypeSerializer(read_only=True)
    class Meta:
        model = Accounting
        fields = '__all__'


class APICredentialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = APICredentials
        fields = ['id', 'api_key', 'secret_key', 'bank_name', 'region', 'branch', 'account']


class InvestmentPortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentPortfolio
        fields = '__all__'


class InvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = '__all__'


class AssetSerializer(serializers.ModelSerializer):
    transactions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'


class LiabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Liability
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
