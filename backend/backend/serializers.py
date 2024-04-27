from rest_framework import serializers
from .models import CustomUser, Accounting, ConsumeType


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


