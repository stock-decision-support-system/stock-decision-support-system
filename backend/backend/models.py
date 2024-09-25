from datetime import timezone, date

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncYear


class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
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
    total_assets = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    net_assets = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    verification_code_expiry = models.DateTimeField(blank=True, null=True)
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    def calculate_net_and_total_assets(self):
        self.total_assets = sum(asset.balance for asset in self.assets.all())
        self.net_assets = self.total_assets - sum(
            liability.amount for liability in self.liabilities.all()
        )
        self.save(update_fields=["total_assets", "net_assets"])

    def aggregate_financials(
        self,
        model_type,
        asset_type=None,
        start_date=None,
        end_date=None,
        aggregate_by=None,
    ):
        """
        General method for aggregating financial data.
        :param model_type: 'assets' or 'liabilities' to select the correct model
        :param asset_type: Type of asset ('Cash', 'Bank', 'Credit Card', etc.)
        :param start_date: The start date for filtering
        :param end_date: The end date for filtering
        :param aggregate_by: 'month' or 'year' for time-based aggregation
        :return: Aggregated data based on the provided parameters
        """
        # Choose the correct model based on the type
        model = getattr(self, model_type)
        query = model.filter(type=asset_type) if asset_type else model.all()

        # Filter by date if specified
        if start_date:
            query = query.filter(date_added__gte=start_date)
        if end_date:
            query = query.filter(date_added__lte=end_date)

        # Aggregate by month or year if specified
        if aggregate_by == "month":
            return (
                query.annotate(period=TruncMonth("date_added"))
                .values("period")
                .annotate(total=Sum("balance"))
                .order_by("period")
            )
        elif aggregate_by == "year":
            return (
                query.annotate(period=TruncYear("date_added"))
                .values("period")
                .annotate(total=Sum("balance"))
                .order_by("period")
            )
        else:
            return query.aggregate(total=Sum("balance"))["total"] or 0

    class Meta:
        db_table = "auth_user"


# 消費類別
class ConsumeType(models.Model):
    consumeTypeId = models.CharField(max_length=2, primary_key=True)
    icon = models.TextField()
    name = models.CharField(max_length=20)
    available = models.BooleanField(default=True)
    createdId = models.CharField(max_length=20)
    createDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "consume_type"


# 記帳
class Accounting(models.Model):
    accountingId = models.AutoField(primary_key=True)
    accountingName = models.CharField(max_length=50)
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True
    )  # 用於收入、支出、轉帳的金額
    consumeType_id = models.ForeignKey(
        ConsumeType, on_delete=models.CASCADE, db_column="consumeType_id"
    )  # Set a default value
    assetType = models.CharField(max_length=50)
    transactionDate = models.DateTimeField(null=True)
    content = models.TextField(null=True)
    available = models.BooleanField(default=True)
    createdId = models.CharField(max_length=150)
    createDate = models.DateTimeField(auto_now_add=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def save(self, *args, **kwargs):
        user = CustomUser.objects.get(username=self.createdId)
        today = date.today()
        current_month_start = date(
            today.year, today.month, 1
        )  # First day of the current month

        if self.assetType == "Credit Card":
            # Handle credit card liabilities
            liability, created = Liability.objects.get_or_create(
                user=user,
                type=self.assetType,
                defaults={"amount": 0, "date_added": today},
            )
            if liability.date_added < current_month_start:
                liability = Liability.objects.create(
                    user=user, type=self.assetType, amount=0, date_added=today
                )

            if self.consumeType_id.name == "Expense":
                liability.amount += self.amount  # Increase liability
            elif self.consumeType_id.name == "Payment":
                liability.amount -= self.amount  # Decrease liability
            liability.save()

        else:
            # Handle assets like Bank or Cash
            asset, created = Asset.objects.get_or_create(
                user=user,
                type=self.assetType,
                defaults={"balance": 0, "date_added": today},
            )
            if asset.date_added < current_month_start:
                asset = Asset.objects.create(
                    user=user, type=self.assetType, balance=0, date_added=today
                )

            if self.consumeType_id.name == "Income":
                asset.balance += self.amount  # Increase asset
            elif self.consumeType_id.name == "Expense":
                asset.balance -= self.amount  # Decrease asset
            elif self.consumeType_id.name == "Transfer":
                total_amount = self.amount + (self.fee if self.fee else 0)
                asset.balance -= total_amount  # Update balance for transfers
            asset.save()

        super(Accounting, self).save(*args, **kwargs)
        user.calculate_net_and_total_assets()

    class Meta:
        db_table = "accounting"


# 紀錄api憑證key
class APICredentials(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="api_credentials",
        to_field="username",
        db_column="username",
    )
    api_key = models.CharField(max_length=255)
    secret_key = models.CharField(max_length=255)
    bank_name = models.CharField(max_length=100)  # e.g., 'Yuanta Investment'
    account = models.CharField(max_length=20)
    region = models.CharField(max_length=10)
    branch = models.CharField(max_length=20)
    ca_path = models.FileField(
        upload_to="ca_file/", max_length=250, null=True, default=None
    )
    ca_passwd = models.CharField(max_length=255)  # CA certificate password
    person_id = models.CharField(
        max_length=100
    )  # ID associated with the CA certificate
    available = models.BooleanField(default=True)

    class Meta:
        db_table = "api_credentials"


# 投資組合
class InvestmentPortfolio(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="portfolios",
        to_field="username",
    )
    name = models.CharField(max_length=100)
    description = models.TextField()
    available = models.BooleanField(default=True)

    # 计算投资组合的当前总市值（使用买入价格）
    def calculate_portfolio_value(self):
        total_value = sum(
            investment.shares * investment.buy_price
            for investment in self.investments.filter(available=True)
        )
        return total_value

    # 计算投资组合的表现
    def calculate_portfolio_performance(self):
        total_invested = sum(
            investment.shares * investment.buy_price
            for investment in self.investments.filter(available=True)
        )
        current_value = self.calculate_portfolio_value()
        # 如果总投资为 0，避免除以 0 的错误
        return (
            (current_value - total_invested) / total_invested * 100
            if total_invested
            else 0
        )

    class Meta:
        db_table = "investment_portfolio"


# 投資
class Investment(models.Model):
    portfolio = models.ForeignKey(
        InvestmentPortfolio, related_name="investments", on_delete=models.CASCADE
    )
    symbol = models.CharField(max_length=10)  # 股票代码或资产标志
    shares = models.IntegerField()  # 持有股票数量
    buy_price = models.DecimalField(max_digits=10, decimal_places=2)  # 买入价格
    available = models.BooleanField(default=True)  # 是否仍然有效

    def __str__(self):
        return f"{self.symbol} - {self.shares} shares"

    class Meta:
        db_table = "investment"  # 確保這裡的表名正確


# 資產
class Asset(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="assets", to_field="username"
    )
    type = models.CharField(max_length=50)  # 如 'Cash', 'Bank', 'Credit Card'
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    name = models.CharField(max_length=100)
    date_added = models.DateField(auto_now_add=True)  # 添加日期字段
    available = models.BooleanField(default=True)

    class Meta:
        db_table = "asset"


# 負債
class Liability(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="liabilities",
        to_field="username",
    )
    type = models.CharField(max_length=50)  # 如 'Loan', 'Credit Card'
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    name = models.CharField(max_length=100)
    date_added = models.DateField(auto_now_add=True)  # 添加日期字段
    available = models.BooleanField(default=True)

    class Meta:
        db_table = "liability"


# 預算
class Budget(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, to_field="username")
    month = models.DateField()
    income_target = models.DecimalField(max_digits=10, decimal_places=2)
    expense_target = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)

    class Meta:
        db_table = "budget"
