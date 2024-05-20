from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from decimal import Decimal

class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True, primary_key=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254, unique=True)
    password = models.CharField(max_length=128)  # 以加密形式存儲密碼
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    total_assets = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    net_assets = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    def calculate_net_and_total_assets(self):
        self.total_assets = sum(asset.balance for asset in self.assets.all())
        self.net_assets = self.total_assets - sum(liability.amount for liability in self.liabilities.all())
        self.save(update_fields=['total_assets', 'net_assets'])

    class Meta:
        db_table = 'auth_user'


# 消費類別
class ConsumeType(models.Model):
    consumeTypeId = models.CharField(max_length=2, primary_key=True)
    icon = models.TextField()
    name = models.CharField(max_length=20)
    available = models.BooleanField(default=True)
    createdId = models.CharField(max_length=20)
    createDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'consume_type'


#記帳
class Accounting(models.Model):
    accountingId = models.AutoField(primary_key=True)
    accountingName = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)  # 用於收入、支出、轉帳的金額
    consumeType_id = models.ForeignKey(ConsumeType, on_delete=models.CASCADE, db_column='consumeType_id')  # Set a default value
    assetType = models.CharField(max_length=50)
    transactionDate = models.DateTimeField(null=True)
    content = models.TextField(null=True)
    available = models.BooleanField(default=True)
    createdId = models.CharField(max_length=150)
    createDate = models.DateTimeField(auto_now_add=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def save(self, *args, **kwargs):
        user = CustomUser.objects.get(username=self.createdId)
        asset, created = Asset.objects.get_or_create(user=user, type=self.assetType, defaults={'balance': 0})

        if self.consumeType_id.name == "Income":
            asset.balance += self.amount  # 增加資產
        elif self.consumeType_id.name == "Expense":
            asset.balance -= self.amount  # 減少資產
        elif self.consumeType_id.name == "Transfer" and 'out' in self.content.lower():
            total_amount = self.amount + (self.fee if self.fee else 0)
            bank_assets = Asset.objects.filter(user=user, type='Bank')
            for bank_asset in bank_assets:
                bank_asset.balance -= total_amount  # 使用總額更新餘額
                bank_asset.save()
        asset.save()
        super(Accounting, self).save(*args, **kwargs)
        user.calculate_net_and_total_assets()

    class Meta:
        db_table = 'accounting'


#紀錄api憑證key
class APICredentials(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='api_credentials', to_field='username', db_column='username')
    api_key = models.CharField(max_length=255)
    secret_key = models.CharField(max_length=255)
    bank_name = models.CharField(max_length=100)  # e.g., 'Yuanta Investment'
    account = models.CharField(max_length=20)
    region = models.CharField(max_length=10)
    branch = models.CharField(max_length=20)
    ca_path = models.CharField(max_length=255)  # Path to the CA certificate
    ca_passwd = models.CharField(max_length=255)  # CA certificate password
    person_id = models.CharField(
        max_length=100)  # ID associated with the CA certificate


    class Meta:
        db_table = 'api_credentials'


#投資組合
class InvestmentPortfolio(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='portfolios', to_field='username')
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        db_table = 'investment_portfolio'


#投資
class Investment(models.Model):
    portfolio = models.ForeignKey(InvestmentPortfolio,
                                  on_delete=models.CASCADE,
                                  related_name='investments')
    type = models.CharField(max_length=50)  # 'Stock', 'Bond', 'ETF'
    symbol = models.CharField(max_length=10)
    shares = models.DecimalField(max_digits=10, decimal_places=2)
    buy_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'investment'


#資產
class Asset(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='assets', to_field='username')
    type = models.CharField(max_length=50)  # Types like 'Cash', 'Bank', 'Credit Card'
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'asset'


#負債
class Liability(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='liabilities', to_field='username')
    type = models.CharField(max_length=50)  # Types might include 'Loan', 'Credit Card'
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'liability'

#預算
class Budget(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, to_field='username')
    month = models.DateField()
    income_target = models.DecimalField(max_digits=10, decimal_places=2)
    expense_target = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'budget'
