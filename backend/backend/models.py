from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


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


#帳號資料
class CustomUser(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254, unique=True)
    password = models.CharField(max_length=128)  # 以加密形式存儲密碼
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    net_assets = models.DecimalField(max_digits=10,
                                     decimal_places=2,
                                     default=0.00)
    total_assets = models.DecimalField(max_digits=10,
                                       decimal_places=2,
                                       default=0.00)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Example required fields

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    # 計算淨資產
    @property
    def net_assets(self):
        total_assets = sum(asset.balance for asset in self.asset_set.all())
        total_liabilities = sum(liability.amount
                                for liability in self.liability_set.all())
        return total_assets - total_liabilities

    # 計算總資產
    def calculate_total_assets(self):
        return sum(asset.balance for asset in self.asset_set.all())

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
    spend = models.IntegerField()
    consumeType = models.ForeignKey(
        ConsumeType, on_delete=models.CASCADE)  # ForeignKey relationship
    assetType = models.CharField(max_length=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    transactionDate = models.DateTimeField(null=True)
    content = models.TextField(null=True)
    available = models.BooleanField(default=True)
    createdId = models.CharField(max_length=20)
    createDate = models.DateTimeField(auto_now_add=True)

    #判斷收入或是支出來讓總資產增加或減少
    def save(self, *args, **kwargs):
        # 獲取對應的Asset實例，假設assetType字段與Asset的type字段匹配
        asset = Asset.objects.filter(user_id=self.createdId,
                                     type=self.assetType).first()
        if asset:
            if self.consumeType.name == "Income":
                asset.balance += self.price  # 增加資產
            elif self.consumeType.name == "Expense":
                asset.balance -= self.price  # 減少資產
            asset.save()
        super(Accounting, self).save(*args, **kwargs)

    class Meta:
        db_table = 'accounting'


#紀錄api憑證key
class APICredentials(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser,
                             on_delete=models.CASCADE,
                             related_name='api_credentials')
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
    user = models.ForeignKey(CustomUser,
                             on_delete=models.CASCADE,
                             related_name='portfolios')
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
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    type = models.CharField(
        max_length=50)  # Types like 'Cash', 'Bank', 'Credit Card'
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'asset'


#負債
class Liability(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    type = models.CharField(
        max_length=50)  # Types might include 'Loan', 'Credit Card'
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'liability'


#轉帳紀錄
class Transaction(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee = models.DecimalField(max_digits=10,
                              decimal_places=2,
                              null=True,
                              blank=True)  # 可選的手續費欄位
    transaction_type = models.CharField(
        max_length=50)  # 'Income', 'Expense', 'Transfer'
    account = models.ForeignKey(Asset,
                                on_delete=models.CASCADE,
                                related_name='transactions')
    description = models.TextField(null=True, blank=True)

    def save(self, *args, **kwargs):
        total_amount = self.amount + (self.fee if self.fee else 0)  # 如果有手續費則加上
        if self.transaction_type == 'Transfer' and 'out' in self.description.lower(
        ):
            bank_assets = Asset.objects.filter(user=self.account.user,
                                               type='Bank')
            for asset in bank_assets:
                asset.balance -= total_amount  # 使用總額更新餘額
                asset.save()
        super(Transaction, self).save(*args, **kwargs)

    class Meta:
        db_table = 'transaction'


#預算
class Budget(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    month = models.DateField()
    income_target = models.DecimalField(max_digits=10, decimal_places=2)
    expense_target = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'budget'
