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
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Example required fields

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    class Meta:
        db_table = 'auth_user'

class ConsumeType(models.Model):
    consumeTypeId = models.CharField(max_length=2, primary_key=True)
    icon = models.TextField()
    name = models.CharField(max_length=20)
    available = models.BooleanField(default=True)
    createdId = models.CharField(max_length=20)
    createDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'consume_type'

class Accounting(models.Model):
    accountingId = models.AutoField(primary_key=True)
    accountingName = models.CharField(max_length=50)
    spend = models.IntegerField()
    consumeType = models.ForeignKey(ConsumeType, on_delete=models.CASCADE)  # ForeignKey relationship
    assetType = models.CharField(max_length=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    transactionDate = models.DateTimeField(null=True)
    content = models.TextField(null=True)
    available = models.BooleanField(default=True)
    createdId = models.CharField(max_length=20)
    createDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounting'




