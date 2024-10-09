from datetime import datetime
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from django.contrib.auth import login as django_login
from django.contrib.auth import authenticate, login, logout

from ..models import (
    APICredentials,
    AccountType,
    CustomUser,
    TwoFactorAuthRecord,
)

# from .forms import RegistrationForm
from django.core.mail import send_mail, EmailMultiAlternatives
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from ..serializers import (
    APICredentialsSerializer,
    CustomUserSerializer,
)
import yaml
from flask import Flask, request, jsonify
import requests

import logging
from google.cloud import recaptchaenterprise_v1
import os

# 朱崇銘
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = (
#    "C:\\github\\stock-decision-support-system\\my-project-8423-1685343098922-1fed5b68860e.json"
# )
from django.http import JsonResponse

# 彭軍翔
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = (
    "C:\\Users\\NAOPIgee\\Desktop\\fork\\stock-decision-support-system\\my-project-8423-1685343098922-1fed5b68860e.json"
)


import random
import string
from django.template.loader import render_to_string
from datetime import timedelta

# 讀取配置文件
with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)  # 讀取 YAML 配置檔案


# 用戶列表視圖
class UserList(APIView):
    permission_classes = [AllowAny]  # 設定許可類別為任何人

    def get(self, request, format=None):
        # 獲取所有用戶並返回其用戶名
        output = [{"users": output.username} for output in CustomUser.objects.all()]
        return Response(output)

    def post(self, request, format=None):
        # 接收創建用戶的請求
        serializer = CustomUserSerializer(data=request.data)  # 創建序列化器實例
        if serializer.is_valid():
            serializer.save()  # 儲存有效的用戶資料
            return Response(
                serializer.data, status=status.HTTP_201_CREATED
            )  # 返回創建成功的響應
        return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )  # 返回錯誤響應


# 註冊功能
@api_view(["POST"])
def register(request):
    if request.method == "POST":
        # 獲取用戶註冊信息
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")

        # 檢查是否已存在相同的郵箱
        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"status": "error", "message": "信箱已被使用"},  # 返回錯誤信息
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 創建新用戶
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        if user is not None:
            # 如果註冊成功，創建一個初始帳戶
            AccountType.objects.create(
                username=user,  # 註冊的用戶
                icon="💰",  # 預設的 icon
                account_name="現金",  # 預設帳戶名稱
                balance=0.00,  # 初始餘額
                created_at=datetime.now(),  # 設置創建時間
            )

            return Response({"status": "success"})  # 返回註冊成功的響應
        else:
            return Response(
                {
                    "status": "error",
                    "message": "帳號已被使用，無法註冊",
                },  # 返回錯誤信息
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        return Response(
            {"status": "error", "message": "請求方法無效"},  # 返回錯誤信息
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


logger = logging.getLogger(__name__)  # 創建日誌記錄器


def verify_recaptcha(token):
    """用于验证前端传递的 reCAPTCHA token 的函数"""
    secret_key = "6LdmwcgpAAAAAFkprWdUSzzAZ8dE-1obmzqLK3Nf"  # 您的 reCAPTCHA 密鑰
    data = {"secret": secret_key, "response": token}  # 準備要發送的數據
    r = requests.post(
        "https://www.google.com/recaptcha/api/siteverify", data=data
    )  # 向 Google 發送請求進行驗證
    result = r.json()  # 解析 JSON 響應
    logger.debug(f"reCAPTCHA verification result: {result}")  # 記錄驗證結果
    return result  # 返回驗證結果


@api_view(["POST"])
def login_view(request):
    # 獲取用戶登入信息
    login_credential = request.data.get("username")
    password = request.data.get("password")
    recaptcha_response = request.data.get("g-recaptcha-response")  # 獲取 reCAPTCHA 響應
    client_ip = request.META.get("REMOTE_ADDR")  # 取得客戶端的 IP 位址

    logger.debug(f"Recaptcha Response: {recaptcha_response}")  # 記錄 reCAPTCHA 響應

    # 驗證 reCAPTCHA 響應
    verification_result = verify_recaptcha(recaptcha_response)  # 調用驗證函數
    assessment_result = create_assessment(  # 假設這是一個進行評估的函數
        "my-project-8423-1685343098922",
        "6LdmwcgpAAAAAChdggC5Z37c_r09EmUk1stanjTj",
        recaptcha_response,
        "login",
    )

    logger.debug(f"Assessment Result: {assessment_result}")  # 記錄評估結果

    # 判斷 reCAPTCHA 驗證結果
    if not verification_result.get("success"):
        return JsonResponse(
            {"status": "error", "message": "reCAPTCHA 驗證失敗"},
            status=400,  # 返回驗證失敗的響應
        )

    # reCAPTCHA 驗證透過後處理使用者登入
    try:
        user = CustomUser.objects.get(username=login_credential)  # 根據用戶名獲取用戶
        if user and user.check_password(password):  # 驗證密碼是否正確
            # 檢查是否有未過期的 2FA IP 記錄
            valid_record_exists = TwoFactorAuthRecord.objects.filter(
                user=user,
                ip_address=client_ip,
                login_date__gte=timezone.now()
                - timedelta(days=30),  # 假設驗證有效期為30天
            ).exists()

            if valid_record_exists:
                # 如果有有效記錄，跳過驗證碼，產生 token
                refresh = RefreshToken.for_user(user)  # 為用戶生成刷新令牌
                return JsonResponse(
                    {
                        "status": "success",
                        "username": user.username,
                        "is_active": user.is_active,
                        "is_superuser": user.is_superuser,
                        "is_staff": user.is_staff,
                        "token": str(refresh.access_token),  # 返回訪問令牌
                        "email": user.email,
                        "avatar": (
                            user.avatar_path.url if user.avatar_path else None
                        ),  # 返回用戶頭像的 URL
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                # 如果沒有有效記錄，產生 pending_token 以要求二次驗證
                pending_token = RefreshToken.for_user(
                    user
                )  # 為用戶生成待處理的刷新令牌
                return JsonResponse(
                    {
                        "status": "success",
                        "username": user.username,
                        "is_active": user.is_active,
                        "is_superuser": user.is_superuser,
                        "is_staff": user.is_staff,
                        "pending_token": str(
                            pending_token.access_token
                        ),  # 返回待處理的訪問令牌
                        "email": user.email,
                    },
                    status=status.HTTP_200_OK,
                )

        else:
            return JsonResponse(
                {"status": "error", "message": "密碼錯誤"},
                status=status.HTTP_400_BAD_REQUEST,
            )  # 返回錯誤響應

    except CustomUser.DoesNotExist:
        return JsonResponse(
            {"status": "error", "message": "帳號不存在"},
            status=status.HTTP_404_NOT_FOUND,
        )  # 返回用戶不存在的錯誤響應


# 登出
@api_view(["GET"])  # 只允許 GET 請求
@permission_classes([IsAuthenticated])  # 需要認證的用戶才能使用此視圖
def logout_view(request):
    logout(request)  # 注銷用戶
    return Response({"status": "success", "message": "登出成功"})  # 返回登出成功的消息


# 修改密碼
@api_view(["POST"])  # 只允許 POST 請求
@permission_classes([IsAuthenticated])  # 需要認證的用戶才能使用此視圖
def change_password(request):
    # 獲取當前認證用戶
    user = request.user

    # 獲取舊密碼和新密碼
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    # 打印接收到的請求數據以便調試
    print(f"Received request data: {request.data}")

    # 驗證舊密碼是否正確
    if check_password(old_password, user.password):
        user.set_password(new_password)  # 設置新密碼
        user.save()  # 保存用戶資料
        return Response(
            {"status": "success", "message": "密碼已成功更改"},  # 返回成功消息
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"status": "error", "message": "舊密碼不正確"},  # 返回錯誤消息
            status=status.HTTP_400_BAD_REQUEST,
        )


# 密碼重置令牌生成器
token_generator = PasswordResetTokenGenerator()


# 兩段式驗證 - 發送驗證碼
@api_view(["POST"])  # 只允許 POST 請求
def send_verification_code(request):
    print(f"Request data: {request.data}")  # 調試時打印接收到的數據
    email = request.data.get("email")  # 獲取用戶輸入的電子郵件地址
    try:
        user = CustomUser.objects.get(email=email)  # 獲取對應的用戶
        verification_code = "".join(
            random.choices(string.digits, k=6)
        )  # 生成六位數字的驗證碼

        # 設置驗證碼及其過期時間
        user.verification_code = verification_code
        user.verification_code_expiry = timezone.now() + timedelta(
            minutes=10
        )  # 設置10分鐘的有效期
        user.save()  # 保存用戶資料

        # 構建郵件內容
        html_message = render_to_string(
            "verification_code_email.html",
            {
                "verification_code": verification_code,
            },
        )
        subject = "Your Verification Code"  # 郵件主題
        from_email = "your_email@example.com"  # 寄件人電子郵件
        to_email = [email]  # 收件人電子郵件

        # 發送郵件
        email_message = EmailMultiAlternatives(subject, "", from_email, to_email)
        email_message.attach_alternative(
            html_message, "text/html"
        )  # 附加 HTML 郵件內容
        email_message.send(fail_silently=False)  # 發送郵件

        return Response(
            {"status": "success", "message": "驗證碼已發送"}, status=status.HTTP_200_OK
        )  # 返回成功消息
    except CustomUser.DoesNotExist:
        return Response(
            {"status": "error", "message": "該E-mail對應的帳號不存在"},  # 返回錯誤消息
            status=status.HTTP_400_BAD_REQUEST,
        )


# 兩段式驗證 - 驗證驗證碼
@api_view(["POST"])  # 只允許 POST 請求
def verify_code(request):
    print(f"Request data: {request.data}")  # 打印請求數據以進行調試
    email = request.data.get("email")  # 獲取用戶輸入的電子郵件地址
    input_code = request.data.get("code")  # 獲取用戶輸入的驗證碼
    remember_device = request.data.get(
        "remember_device", False
    )  # 獲取“記住此電腦”的選項

    try:
        user = CustomUser.objects.get(email=email)  # 獲取對應的用戶
        if user.verification_code == input_code:  # 驗證碼有效
            # 紀錄 IP 地址和“記住此電腦”狀態
            if remember_device:
                ip_address = request.META.get("REMOTE_ADDR")  # 獲取客戶端的 IP 地址
                TwoFactorAuthRecord.objects.create(
                    user=user,
                    ip_address=ip_address,
                    login_date=timezone.now(),  # 此處的 login_date 已自動記錄，若無其他特殊需求可省略
                )

            return Response(
                {"status": "success", "message": "驗證成功"},  # 返回成功消息
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"status": "error", "message": "驗證碼不正確"},  # 返回錯誤消息
                status=status.HTTP_400_BAD_REQUEST,
            )
    except CustomUser.DoesNotExist:
        return Response(
            {"status": "error", "message": "該E-mail對應的帳號不存在"},  # 返回錯誤消息
            status=status.HTTP_400_BAD_REQUEST,
        )


# 忘記密碼 - 會發送修改密碼連結到輸入的email
@api_view(["POST"])
def password_reset_request(request):
    if request.method == "POST":
        # 從請求中獲取用戶的電子郵件地址
        email = request.data.get("email")
        try:
            # 根據電子郵件查找用戶
            user = CustomUser.objects.get(email=email)
            # 生成密碼重置令牌
            token = token_generator.make_token(user)
            # 將用戶ID進行編碼，以便安全地傳遞
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # 創建密碼重置郵件的鏈接
            reset_link = request.build_absolute_uri(
                f"http://localhost:3000/reset-password/{uid}/{token}/"
                # f"http://140.131.114.159:3000/reset-password/{uid}/{token}/"
            )
            # 郵件內容，使用HTML模板渲染重置鏈接
            html_message = render_to_string(
                "password_reset_email.html",
                {
                    "reset_link": reset_link,
                },
            )
            # 郵件主題和發件人信息
            subject = "Password Reset Request"
            from_email = "allen9111054@gmail.com"
            to_email = [email]

            # 使用 EmailMultiAlternatives 發送 HTML 郵件
            email_message = EmailMultiAlternatives(subject, "", from_email, to_email)
            email_message.attach_alternative(html_message, "text/html")
            email_message.send(fail_silently=False)  # 發送郵件，若失敗則拋出異常

            return Response(
                {
                    "status": "success",
                    "message": "密碼重設連結已經寄送到你的註冊E-mail",
                    "token": token,
                    "uid": uid,
                },
                status=status.HTTP_200_OK,
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"status": "error", "message": "沒有對應的帳號使用此E-mail"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    return Response(
        {"status": "error", "message": "請求方法無效"},
        status=status.HTTP_405_METHOD_NOT_ALLOWED,
    )


# 根據連結（含有Token）導入到重設密碼網頁
@api_view(["POST"])
def password_reset_confirm(request, uidb64, token):
    if request.method == "POST":
        # 從請求中獲取新密碼
        password = request.data.get("password")
        try:
            # 將UID從編碼轉回原始值
            uid = force_str(urlsafe_base64_decode(uidb64))
            # 根據UID查找用戶
            user = CustomUser.objects.get(pk=uid)
            # 檢查令牌是否有效
            if token_generator.check_token(user, token):
                # 設置新密碼並保存
                user.set_password(password)
                user.save()
                return Response(
                    {
                        "status": "success",
                        "message": "密碼重設成功",
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"status": "error", "message": "無效的token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response(
                {"status": "error", "message": "請求無效"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    return Response(
        {"status": "error", "message": "請求方法無效"},
        status=status.HTTP_405_METHOD_NOT_ALLOWED,
    )


# （管理員）帳戶管理GET帳戶資訊的頁面 - 有根據username的關鍵字搜尋、根據is-superuser, is_staff和is_active狀態做篩選、依據date_joined做排序
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def manage_users(request):
    query = request.GET.get("q", "")

    # 構建基礎查詢
    users = CustomUser.objects.all()
    if query:
        # 根據username關鍵字篩選用戶
        users = users.filter(username__icontains=query)

    # 構建狀態篩選查詢
    is_superuser = request.GET.get("is_superuser")
    is_staff = request.GET.get("is_staff")
    is_active = request.GET.get("is_active")

    if is_superuser:
        # 根據is_superuser狀態篩選
        users = users.filter(is_superuser=is_superuser)
    if is_staff:
        # 根據is_staff狀態篩選
        users = users.filter(is_staff=is_staff)
    if is_active:
        # 根據is_active狀態篩選
        users = users.filter(is_active=is_active)

    # 處理排序
    sort_by = request.GET.get("sort_by", "date_joined")
    if sort_by not in ["date_joined", "-date_joined"]:
        sort_by = "date_joined"
    # 根據指定字段排序用戶
    users = users.order_by(sort_by)

    # 使用序列化器序列化用戶數據
    serializer = CustomUserSerializer(users, many=True)
    return Response(serializer.data)


# （管理員）修改帳戶詳細資訊
@api_view(["POST"])  # 允許 POST 方法
@permission_classes([IsAuthenticated, IsAdminUser])  # 需要認證且必須是管理員
def edit_user(request):
    if request.method == "POST":
        # 獲取請求中的用戶名
        username = request.GET.get("username")
        try:
            # 根據用戶名獲取用戶對象
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            # 若找不到用戶，返回 404 錯誤
            return Response(
                {"status": "error", "message": "查無此用戶"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 從請求數據中獲取要更新的字段
        is_superuser = request.data.get("is_superuser")
        is_active = request.data.get("is_active")
        is_staff = request.data.get("is_staff")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        password = request.data.get("password")

        # 根據請求數據部分更新用戶對象
        if is_superuser is not None:
            user.is_superuser = is_superuser
        if is_active is not None:
            user.is_active = is_active
        if is_staff is not None:
            user.is_staff = is_staff
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if email is not None:
            user.email = email
        if password is not None:
            user.set_password(password)  # 更新密碼，使用 set_password 方法以安全地處理

        # 保存更新後的用戶信息
        user.save()

        return Response({"status": "success", "message": "個人資料修改成功"})


# 依據帳號顯示個人資料
@api_view(["GET"])  # 允許 GET 方法
@permission_classes([IsAuthenticated])  # 需要認證
def profile(request):
    if request.method == "GET":
        # 獲取請求中的用戶名
        username = request.GET.get("username")
        try:
            # 根據用戶名獲取用戶對象
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            # 若找不到用戶，返回 404 錯誤
            return Response(
                {"status": "error", "message": "查無此用戶"},
                status=status.HTTP_404_NOT_FOUND,
            )

    # 返回用戶的資料
    return Response(
        {
            "status": "success",
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": username,
            "avatar": (
                user.avatar_path.url if user.avatar_path else None
            ),  # 回傳圖片 URL
        },
        status=status.HTTP_200_OK,
    )


# 修改個人帳戶資訊
@api_view(["POST"])  # 允許 POST 方法
@permission_classes([IsAuthenticated])  # 需要認證
def edit_profile(request):
    if request.method == "POST":
        # 獲取請求中的用戶名
        username = request.data.get("username")
        try:
            # 根據用戶名獲取用戶對象
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            # 若找不到用戶，返回 404 錯誤
            return Response(
                {"status": "error", "message": "查無此用戶"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 從請求數據中獲取要更新的字段
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        password = request.data.get("password")
        avatar = request.FILES.get("avatar")  # 獲取上傳的圖片（如果有）

        # 根據請求數據部分更新用戶對象
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if email is not None:
            user.email = email
        if password is not None:
            user.set_password(password)  # 更新密碼，使用 set_password 方法以安全地處理
        if avatar is not None:
            user.avatar_path = avatar  # 更新圖片欄位

        # 保存更新後的用戶信息
        user.save()

        return Response(
            {"status": "success", "message": "個人資料修改成功"},
            status=status.HTTP_200_OK,
        )


# 獲取用戶的銀行資料列表
@api_view(["GET"])  # 只允許 GET 方法
@permission_classes([IsAuthenticated])  # 需要身份驗證
def get_bank_profile_list(request):
    if request.method == "GET":
        username = request.user.username  # 獲取當前用戶的用戶名
        list = APICredentials.objects.filter(
            username=username
        )  # 根據用戶名查找銀行資料

        if not list.exists():  # 如果沒有資料
            return Response(
                {"status": "error", "message": "用戶不存在銀行資料"},
                status=status.HTTP_404_NOT_FOUND,
            )

        bank_data = []  # 儲存銀行資料的列表
        for bank in list:
            bank_data.append(
                {
                    "id": bank.id,
                    "bank_name": bank.bank_name,  # 銀行名稱
                    "region": bank.region,  # 銀行區域
                    "branch": bank.branch,  # 銀行分行
                    "account": bank.account[-4:],  # 只顯示帳號的後四位
                }
            )

        return Response(
            {"status": "success", "data": bank_data},  # 返回成功信息和銀行資料
            status=status.HTTP_200_OK,
        )


# 銀行資料的個別查詢
@api_view(["GET"])  # 只允許 GET 方法
@permission_classes([IsAuthenticated])  # 需要身份驗證
def get_bank_profile(request, id):
    if request.method == "GET":
        try:
            bank = APICredentials.objects.get(id=id)  # 根據ID查找銀行資料
        except APICredentials.DoesNotExist:
            return Response(
                {"status": "error", "message": "查無此銀行資料"},  # 如果找不到，返回404
                status=status.HTTP_404_NOT_FOUND,
            )

    serializer = APICredentialsSerializer(bank)  # 對查找到的銀行資料進行序列化
    return Response(
        {"status": "success", "data": serializer.data},  # 返回成功信息和序列化數據
        status=status.HTTP_200_OK,
    )


# 新增銀行資料
@api_view(["POST"])  # 只允許 POST 方法
@permission_classes([IsAuthenticated])  # 需要身份驗證
def add_bank_profile(request):
    if request.method == "POST":
        serializer = APICredentialsSerializer(
            data=request.data, context={"request": request}
        )  # 使用請求數據進行序列化
        if serializer.is_valid():  # 驗證數據是否有效
            ca_file = request.data.get("ca_file", None)  # 檢查是否有上傳文件
            if not ca_file:  # 如果沒有上傳文件
                return Response(
                    {"status": "error", "message": "未上傳文件"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 將文件路徑設置為序列化後的數據
            serializer.validated_data["ca_path"] = ca_file

            # 保存數據
            serializer.save()
            return Response(
                {"status": "success", "message": "銀行資料新增成功"},
                status=status.HTTP_201_CREATED,  # 返回201狀態表示創建成功
            )
        else:
            return Response(
                {"status": "error", "message": serializer.errors},  # 返回錯誤信息
                status=status.HTTP_404_NOT_FOUND,
            )


# 更新銀行資料
@api_view(["PUT"])  # 只允許 PUT 方法
@permission_classes([IsAuthenticated])  # 需要身份驗證
def update_bank_profile(request, id):
    if request.method == "PUT":
        try:
            # 根據ID查找銀行資料
            bank = APICredentials.objects.get(id=id)
        except APICredentials.DoesNotExist:
            return Response(
                {
                    "status": "error",
                    "message": "查無此銀行資料",
                },  # 找不到銀行資料時返回404
                status=status.HTTP_404_NOT_FOUND,
            )

        # 檢查是否有新的文件上傳
        ca_file = request.FILES.get("ca_file", None)
        if ca_file:  # 如果有文件
            request.data["ca_path"] = ca_file  # 更新文件路徑
            serializer = APICredentialsSerializer(
                bank, data=request.data, partial=True
            )  # 部分更新
            if serializer.is_valid():  # 如果數據有效
                serializer.save()  # 保存更新
                storage, path = (
                    bank.ca_path.storage,
                    bank.ca_path.path,
                )  # 獲取當前文件存儲信息
                storage.delete(path)  # 刪除舊文件
                return Response(
                    {"status": "success", "message": "銀行資料更新成功"},
                    status=status.HTTP_200_OK,  # 返回200表示更新成功
                )
            else:
                return Response(
                    serializer.errors, status=status.HTTP_400_BAD_REQUEST
                )  # 返回驗證錯誤
        else:
            # 如果沒有文件上傳，檢查是否提供了文件路徑
            ca_path = request.data.get("ca_path", None)
            if isinstance(ca_path, str):  # 如果文件路徑是字串
                bank.ca_path = ca_path  # 更新銀行資料的文件路徑
                bank.save()
                return Response(
                    {"status": "success", "message": "銀行資料更新成功"},
                    status=status.HTTP_200_OK,
                )
            else:
                # 進行部分更新
                serializer = APICredentialsSerializer(
                    bank, data=request.data, partial=True
                )
                if serializer.is_valid():  # 如果數據有效
                    serializer.update()  # 更新數據
                    return Response(
                        {"status": "success", "message": "銀行資料更新成功"},
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )  # 返回驗證錯誤


# 刪除銀行資料
@api_view(["DELETE"])  # 只允許 DELETE 方法
@permission_classes([IsAuthenticated])  # 需要身份驗證
def delete_bank_profile(request, id):
    if request.method == "DELETE":
        try:
            # 根據ID查找銀行資料
            bank = APICredentials.objects.get(id=id)
            bank.delete()  # 刪除資料
            return Response(
                {"status": "success", "message": "銀行資料刪除成功"},
                status=status.HTTP_200_OK,  # 返回200表示刪除成功
            )
        except APICredentials.DoesNotExist:
            return Response(
                {
                    "status": "error",
                    "message": "查無此銀行資料",
                },  # 找不到銀行資料時返回404
                status=status.HTTP_404_NOT_FOUND,
            )


# 設定 Flask 應用程序
app = Flask(__name__)

# 設置日誌級別為 DEBUG，並定義日誌格式
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)


# 處理 reCAPTCHA 驗證的路由
@app.route("/submit", methods=["POST"])
def validate_recaptcha():
    logging.debug("Function called")  # 當函數被呼叫時，輸出 DEBUG 級別的日誌
    recaptcha_response = request.form[
        "g-recaptcha-response"
    ]  # 從表單中提取 reCAPTCHA 響應
    secret_key = "6LdmwcgpAAAAAFkprWdUSzzAZ8dE-1obmzqLK3Nf"  # 定義 reCAPTCHA 秘鑰

    logging.debug(
        f"Received reCAPTCHA response: {recaptcha_response}"
    )  # 記錄接收到的 reCAPTCHA 響應

    # 準備 POST 請求數據，用於驗證 reCAPTCHA
    data = {"secret": secret_key, "response": recaptcha_response}
    verify_url = (
        "https://www.google.com/recaptcha/api/siteverify"  # Google 驗證的 API URL
    )
    response = requests.post(verify_url, data=data)  # 發送請求至 Google 進行驗證
    verification_result = response.json()  # 解析 Google 的回應

    logging.debug(f"Google verification result: {verification_result}")  # 記錄驗證結果

    # 檢查驗證結果是否成功
    if verification_result.get("success"):
        logging.info("CAPTCHA verification succeeded")  # 驗證成功，輸出 INFO 級別日誌
        return Response(
            {"status": "success", "message": "CAPTCHA驗證成功"},  # 回傳成功響應
            status=status.HTTP_200_OK,
        )
    else:
        logging.warning(
            "CAPTCHA verification failed"
        )  # 驗證失敗，輸出 WARNING 級別日誌
        return Response(
            {"status": "error", "message": "CAPTCHA驗證失敗"},  # 回傳錯誤響應
            status=status.HTTP_400_BAD_REQUEST,
        )


# 自訂日誌記錄器
logger = logging.getLogger("my_logger")


# 創建評估函數，使用 Google reCAPTCHA Enterprise 進行評估
def create_assessment(
    project_id: str, recaptcha_key: str, token: str, recaptcha_action: str
):
    # 記錄所有傳遞進來的參數
    logger.debug(f"Project ID: {project_id}")
    logger.debug(f"Recaptcha Key: {recaptcha_key}")
    logger.debug(f"Token: {token}")
    logger.debug(f"Recaptcha Action: {recaptcha_action}")

    # 初始化 reCAPTCHA Enterprise 客戶端
    client = recaptchaenterprise_v1.RecaptchaEnterpriseServiceClient()

    # 設定要追蹤的事件屬性
    event = recaptchaenterprise_v1.Event()
    event.site_key = recaptcha_key  # 設定 site key
    event.token = token  # 使用從參數傳遞進來的 token

    # 建立一個 Assessment 實例並將事件賦值給它
    assessment = recaptchaenterprise_v1.Assessment()
    assessment.event = event

    # 定義專案名稱，用於 reCAPTCHA Enterprise
    project_name = f"projects/{project_id}"

    # 建立評估請求
    request = recaptchaenterprise_v1.CreateAssessmentRequest()
    request.assessment = assessment  # 將評估分配給請求
    request.parent = project_name  # 設定專案名稱

    # 呼叫 Google reCAPTCHA Enterprise 進行評估
    response = client.create_assessment(request)

    # 檢查 token 是否有效
    if not response.token_properties.valid:
        print(
            "CreateAssessment 呼叫失敗，因為令牌因下列原因無效："
            + str(response.token_properties.invalid_reason)
        )
        return

    # 確認是否已執行預期的動作
    if response.token_properties.action != recaptcha_action:
        print("reCAPTCHA 標記中的操作屬性與您期望評分的操作不匹配")
        return
    else:
        # 取得風險分析結果，並輸出風險分數與原因
        for reason in response.risk_analysis.reasons:
            print(reason)
        print("該令牌的 reCAPTCHA 分數為：" + str(response.risk_analysis.score))

        # 取得評量作業的名稱 (ID)，可用於後續加註
        assessment_name = client.parse_assessment_path(response.name).get("assessment")
        print(f"Assessment name: {assessment_name}")

    return response  # 返回評估結果
