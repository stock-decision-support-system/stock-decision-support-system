from datetime import timezone, date

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta


# 自訂用戶管理器
class CustomUserManager(BaseUserManager):

    # 創建用戶的方法
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("電子郵件不為空")  # 確保電子郵件不為空
        email = self.normalize_email(email)  # 正規化電子郵件
        user = self.model(email=email, **extra_fields)  # 建立用戶實例
        user.set_password(password)  # 設定密碼
        user.save(using=self._db)  # 儲存用戶
        return user

    # 創建超級用戶的方法
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", True)  # 設定超級用戶標誌
        extra_fields.setdefault("is_staff", True)  # 設定員工標誌

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("確保超級用戶的標誌為 True")  # 確保超級用戶的標誌為 True
        return self.create_user(email, password, **extra_fields)  # 創建用戶


# 自訂用戶模型
class CustomUser(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True,
                                primary_key=True)  # 用戶名，唯一且為主鍵
    first_name = models.CharField(max_length=150)  # 用戶的名字
    last_name = models.CharField(max_length=150)  # 用戶的姓氏
    email = models.EmailField(max_length=254, unique=True)  # 用戶的電子郵件，唯一
    password = models.CharField(max_length=128)  # 用於存儲加密的密碼
    is_superuser = models.BooleanField(default=False)  # 是否為超級用戶
    is_staff = models.BooleanField(default=False)  # 是否為員工
    is_active = models.BooleanField(default=True)  # 用戶是否活躍
    date_joined = models.DateTimeField(auto_now_add=True)  # 記錄用戶加入的日期時間
    last_login = models.DateTimeField(null=True, blank=True)  # 記錄用戶最後登入的時間
    total_assets = models.DecimalField(max_digits=10,
                                       decimal_places=2,
                                       default=Decimal("0.00"))  # 總資產
    net_assets = models.DecimalField(max_digits=10,
                                     decimal_places=2,
                                     default=Decimal("0.00"))  # 淨資產
    verification_code = models.CharField(max_length=6, blank=True,
                                         null=True)  # 驗證碼
    verification_code_expiry = models.DateTimeField(blank=True,
                                                    null=True)  # 驗證碼過期時間
    avatar_path = models.FileField(upload_to="avatars/",
                                   max_length=250,
                                   blank=True,
                                   null=True,
                                   default=None)  # 用戶頭像路徑

    objects = CustomUserManager()  # 自訂用戶管理器

    USERNAME_FIELD = "email"  # 用於登入的字段
    REQUIRED_FIELDS = ["first_name", "last_name"]  # 創建用戶時需要的其他字段

    def __str__(self):
        return self.email  # 返回用戶的電子郵件

    def has_perm(self, perm, obj=None):
        return True  # 確保用戶有權限

    def has_module_perms(self, app_label):
        return True  # 確保用戶對模組有權限

    def calculate_net_and_total_assets(self):
        # 計算收入總和，assetType 為 '0' 表示收入
        total_income = Accounting.objects.filter(
            createdId=self, assetType='0').aggregate(
                total_income=Sum('amount'))['total_income'] or 0

        # 計算支出總和，assetType 為 '1' 表示支出
        total_expenses = Accounting.objects.filter(
            createdId=self, assetType='1').aggregate(
                total_expenses=Sum('amount'))['total_expenses'] or 0

        # 計算總資產和淨資產
        self.total_assets = total_income
        self.net_assets = total_income - total_expenses

        # 儲存更新的 total_assets 和 net_assets
        self.save(update_fields=["total_assets", "net_assets"])

    class Meta:
        db_table = "auth_user"  # 資料表名稱


# 消費類別模型
class ConsumeType(models.Model):
    id = models.AutoField(primary_key=True)  # 自動生成的主鍵
    icon = models.TextField(max_length=20, null=True)  # 顯示的圖示
    name = models.CharField(max_length=20)  # 消費類別的名稱
    available = models.BooleanField(default=True)  # 是否可用
    createdId = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        db_column="createdId",  # 在資料庫中的列名
    )
    createDate = models.DateTimeField(auto_now_add=True)  # 創建日期

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "consume_type"  # 資料表名稱


ASSET_TYPE = [
    ('0', '收入'),
    ('1', '支出'),
]


# 帳戶模型
class AccountType(models.Model):
    id = models.AutoField(primary_key=True)  # 自動生成的主鍵
    icon = models.TextField(max_length=20, null=True)  # 顯示的圖示
    username = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        db_column="username",  # 在資料庫中的列名
    )
    # 帳戶名稱，由使用者自訂
    account_name = models.CharField(max_length=255)
    # 餘額欄位，使用 Decimal 型別確保精度，預設為 0.00
    balance = models.DecimalField(max_digits=10,
                                  decimal_places=2,
                                  default=0.00)
    # 資料創建時間，當新增資料時自動填入當前時間
    createDate = models.DateTimeField(auto_now_add=True)
    available = models.BooleanField(default=True)  # 是否可用

    def calculate_balance(self):
        # 計算收入總和，assetType 為 '0' 表示收入
        total_income = Accounting.objects.filter(assetType='0', accountType=self.id).aggregate(
                total_income=Sum('amount'))['total_income'] or 0

        # 計算支出總和，assetType 為 '1' 表示支出
        total_expenses = Accounting.objects.filter(assetType='1', accountType=self.id).aggregate(
                total_expenses=Sum('amount'))['total_expenses'] or 0

        # 計算淨資產
        self.balance = total_income - total_expenses

        self.save(update_fields=["balance"])


    def __str__(self):
        return self.account_name
    
    class Meta:
        db_table = "account_type"


# 記帳模型
class Accounting(models.Model):
    id = models.AutoField(primary_key=True)  # 記帳紀錄的主鍵
    accountingName = models.CharField(max_length=50)  # 記帳名稱
    amount = models.DecimalField(max_digits=10, decimal_places=2,
                                 null=True)  # 金額，用於收入、支出、轉帳
    accountType = models.ForeignKey(AccountType,
                                      on_delete=models.CASCADE,
                                      db_column="accountType")  # 外鍵，關聯到消費帳戶
    consumeType = models.ForeignKey(ConsumeType,
                                      on_delete=models.CASCADE,
                                      db_column="consumeType")  # 外鍵，關聯到消費類別
    assetType = models.CharField(max_length=1,
                                 choices=ASSET_TYPE,
                                 default='0')
    transactionDate = models.DateTimeField(null=True)  # 交易日期
    content = models.TextField(null=True)  # 交易內容
    available = models.BooleanField(default=True)  # 是否可用
    createdId = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        db_column="createdId",  # 在資料庫中的列名
    )
    createDate = models.DateTimeField(auto_now_add=True)  # 創建日期
    fee = models.DecimalField(max_digits=10,
                              decimal_places=2,
                              null=True,
                              blank=True)  # 手續費

    class Meta:
        db_table = "accounting"  # 資料表名稱


# 紀錄API憑證的模型
class APICredentials(models.Model):
    id = models.AutoField(primary_key=True)  # 自動生成的主鍵
    username = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="api_credentials",  # 與CustomUser的反向關聯
        to_field="username",  # 使用CustomUser的username字段
        db_column="username",  # 在資料庫中的列名
    )
    api_key = models.CharField(max_length=255)  # API金鑰
    secret_key = models.CharField(max_length=255)  # 密鑰
    bank_name = models.CharField(max_length=100)  # 銀行名稱，例如 'Yuanta Investment'
    account = models.CharField(max_length=20)  # 帳號
    region = models.CharField(max_length=10)  # 地區
    branch = models.CharField(max_length=20)  # 分行名稱
    ca_path = models.FileField(
        upload_to="ca_file/",  # CA憑證的路徑
        max_length=250,
        null=True,
        default=None)
    ca_passwd = models.CharField(max_length=255)  # CA憑證密碼
    person_id = models.CharField(max_length=100)  # 與CA憑證相關聯的ID
    available = models.BooleanField(default=True)  # 是否有效

    class Meta:
        db_table = "api_credentials"  # 在資料庫中的表名


# 投資組合模型
class InvestmentPortfolio(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="portfolios",  # 與CustomUser的反向關聯
        to_field="username",  # 使用CustomUser的username字段
    )
    name = models.CharField(max_length=100)  # 投資組合名稱
    description = models.TextField()  # 投資組合描述
    available = models.BooleanField(default=True)  # 是否有效
    quota = models.IntegerField(null=True)  # 定期金額

    # 計算投資組合的當前總市值（使用買入價格）
    def calculate_portfolio_value(self):
        total_value = sum(
            investment.shares * investment.buy_price  # 計算所有有效投資的總市值
            for investment in self.investments.filter(available=True))
        return total_value  # 返回總市值

    # 計算投資組合的表現
    def calculate_portfolio_performance(self):
        total_invested = sum(
            investment.shares * investment.buy_price  # 計算所有有效投資的總投入
            for investment in self.investments.filter(available=True))
        current_value = self.calculate_portfolio_value()  # 獲取當前市值
        # 如果總投資為 0，避免除以 0 的錯誤
        return ((current_value - total_invested) / total_invested *
                100 if total_invested else 0)  # 返回投資組合的表現百分比

    class Meta:
        db_table = "investment_portfolio"  # 在資料庫中的表名


BUY_TYPE = [
    ('0', 'buy and hold'),
    ('1', 'naive'),
    ('2', 'custom'),
]


# 投資模型
class Investment(models.Model):
    portfolio = models.ForeignKey(
        InvestmentPortfolio,
        related_name="investments",  # 與InvestmentPortfolio的反向關聯
        on_delete=models.CASCADE)  # 連結到投資組合
    symbol = models.CharField(max_length=10)  # 股票代碼或資產標誌
    shares = models.IntegerField()  # 持有股票的數量
    buy_price = models.DecimalField(max_digits=10, decimal_places=2)  # 買入價格
    buyType = models.CharField(max_length=1,
                                 choices=BUY_TYPE,
                                 default='0')
    available = models.BooleanField(default=True)  # 是否仍然有效

    def __str__(self):
        return f"{self.symbol} - {self.shares} shares"  # 返回股票代碼及數量的字串表示

    class Meta:
        db_table = "investment"  # 在資料庫中的表名

#預設投資組合料表
class DefaultInvestmentPortfolio(models.Model):
    name = models.CharField(max_length=100)  # 投資組合名稱
    investment_threshold = models.DecimalField(max_digits=12, decimal_places=2)  # 投資門檻

    class Meta:
        db_table = "default_investment_portfolio"  # 在資料庫中的表名

    def __str__(self):
        return self.name

# 預設投資組合中的股票列表
class DefaultStockList(models.Model):
    stock_symbol = models.CharField(max_length=10)  # 股票代碼
    stock_name = models.CharField(max_length=100, null=True, blank=True)  # 股票名稱（可選）
    quantity = models.IntegerField(default=1)  # 股票數量，預設為 1
    default_investment_portfolio = models.ForeignKey(DefaultInvestmentPortfolio, on_delete=models.CASCADE, related_name='stocks')  # 關聯到預設投資組合

    class Meta:
        db_table = "default_stock_list" 

    def __str__(self):
        return self.stock_symbol


# 目標模型
class Budget(models.Model):
    id = models.AutoField(primary_key=True)  # 自動生成的主鍵
    username = models.ForeignKey(CustomUser,
                             on_delete=models.CASCADE,
                             to_field="username")  # 關聯到CustomUser的username字段
    start_date = models.DateField(auto_now_add=True)  # 目標起始日期
    end_date = models.DateField(null=True)
    name = models.CharField(max_length=20)  # 名稱
    target = models.DecimalField(max_digits=10, decimal_places=2)  # 目標
    current = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))  # 目前金額
    is_successful = models.BooleanField(default=False)  # 是否達成
    available = models.BooleanField(default=True)  # 是否有效

    class Meta:
        db_table = "budget"  # 在資料庫中的表名


# 兩步驟認證紀錄模型
class TwoFactorAuthRecord(models.Model):
    id = models.AutoField(primary_key=True)  # 流水號，自動生成
    user = models.ForeignKey(CustomUser,
                             on_delete=models.CASCADE,
                             to_field="username")  # 關聯到CustomUser帳號
    login_date = models.DateTimeField(auto_now_add=True)  # 登入日期和時間，自動生成
    ip_address = models.GenericIPAddressField()  # 用戶的IP地址

    def save(self, *args, **kwargs):
        super(TwoFactorAuthRecord, self).save(*args, **kwargs)  # 調用父類的save方法

    class Meta:
        db_table = 'two_factor_auth_record'  # 在資料庫中的表名
