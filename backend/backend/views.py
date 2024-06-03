from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import login as django_login
from django.contrib.auth import authenticate, login, logout
from django.utils.dateparse import parse_date

from .models import APICredentials, CustomUser, Accounting, ConsumeType

# from .forms import RegistrationForm
from django.core.mail import send_mail, EmailMultiAlternatives
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.auth.decorators import user_passes_test, login_required
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    APICredentialsSerializer,
    CustomUserSerializer,
    AccountingSerializer,
    ConsumeTypeSerializer,
)
import shioaji as sj
import yaml
import pandas as pd
from flask import Flask, request, jsonify
import requests

import logging
from google.cloud import recaptchaenterprise_v1
from google.cloud.recaptchaenterprise_v1 import Assessment
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "C:\\github\\stock-decision-support-system\\my-project-8423-1685343098922-1fed5b68860e.json"
from django.http import JsonResponse




with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)


class UserList(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        output = [{"users": output.username} for output in CustomUser.objects.all()]
        return Response(output)

    def post(self, request, format=None):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 註冊
@api_view(["POST"])
def register(request):
    if request.method == "POST":
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")

        # 檢查是否已存在相同的郵箱
        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"status": "error", "message": "信箱已被使用"},
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
            return Response({"status": "success"})
        else:
            return Response(
                {"status": "error", "message": "帳號已被使用，無法註冊"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        return Response(
            {"status": "error", "message": "請求方法無效"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
    
logger = logging.getLogger(__name__)

def verify_recaptcha(token):
    """用于验证前端传递的 reCAPTCHA token 的函数"""
    secret_key = "6LdmwcgpAAAAAFkprWdUSzzAZ8dE-1obmzqLK3Nf"
    data = {
        'secret': secret_key,
        'response': token
    }
    r = requests.post('https://www.google.com/recaptcha/api/siteverify', data=data)
    result = r.json()
    logger.debug(f"reCAPTCHA verification result: {result}")
    return result

@api_view(["POST"])
def login_view(request):
    login_credential = request.data.get("username")
    password = request.data.get("password")
    recaptcha_response = request.data.get('g-recaptcha-response')

    logger.debug(f"Recaptcha Response: {recaptcha_response}")

    # 验证 reCAPTCHA 响应
    verification_result = verify_recaptcha(recaptcha_response)
    assessment_result = create_assessment(
        "my-project-8423-1685343098922",
        "6LdmwcgpAAAAAChdggC5Z37c_r09EmUk1stanjTj",
        recaptcha_response,
        "login"
    )
    
    logger.debug(f"Assessment Result: {assessment_result}")

    # 判断 reCAPTCHA 验证结果
    if not verification_result.get('success'):
        return JsonResponse({'status': 'error', 'message': 'reCAPTCHA 验证失败'}, status=400)

    # reCAPTCHA 验证通过后处理用户登录
    try:
        user = CustomUser.objects.get(username=login_credential)
        if user and user.check_password(password):
            django_login(request, user)
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            # 生成 token
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                "status": "success",
                "username": user.username,
                "is_active": user.is_active,
                "is_superuser": user.is_superuser,
                "is_staff": user.is_staff,
                "token": str(refresh.access_token),
            })
        else:
            return JsonResponse({"status": "error", "message": "密码错误"}, status=400)
    except CustomUser.DoesNotExist:
        return JsonResponse({"status": "error", "message": "账号不存在"}, status=404)


# 登出
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"status": "success", "message": "登出成功"})

# 修改密碼
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    # 獲取當前認證用戶
    user = request.user

    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    # 打印接收到的請求數據以便調試
    print(f"Received request data: {request.data}")

    if check_password(old_password, user.password):
        user.set_password(new_password)
        user.save()
        return Response(
            {"status": "success", "message": "密碼已成功更改"},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"status": "error", "message": "舊密碼不正確"},
            status=status.HTTP_400_BAD_REQUEST,
        )


token_generator = PasswordResetTokenGenerator()


# 忘記密碼 - 會發送修改密碼連結到輸入的email
@api_view(["POST"])
def password_reset_request(request):
    if request.method == "POST":
        email = request.data.get("email")
        try:
            user = CustomUser.objects.get(email=email)
            # 生成密碼重置令牌
            token = token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # 創建密碼重置郵件的鏈接
            reset_link = request.build_absolute_uri(
                f"http://localhost:3000/reset-password/{uid}/{token}/"
            )
            # 郵件內容
            html_message = render_to_string(
                "password_reset_email.html",
                {
                    "reset_link": reset_link,
                },
            )
            subject = "Password Reset Request"
            from_email = "allen9111054@gmail.com"
            to_email = [email]

            # 使用 EmailMultiAlternatives 發送 HTML 郵件
            email_message = EmailMultiAlternatives(subject, "", from_email, to_email)
            email_message.attach_alternative(html_message, "text/html")
            email_message.send(fail_silently=False)

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
        password = request.data.get("password")
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            if token_generator.check_token(user, token):
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

    # 构建基础查询
    users = CustomUser.objects.all()
    if query:
        users = users.filter(username__icontains=query)

    # 构建状态筛选查询
    is_superuser = request.GET.get("is_superuser")
    is_staff = request.GET.get("is_staff")
    is_active = request.GET.get("is_active")

    if is_superuser:
        users = users.filter(is_superuser=is_superuser)
    if is_staff:
        users = users.filter(is_staff=is_staff)
    if is_active:
        users = users.filter(is_active=is_active)

    # 处理排序
    sort_by = request.GET.get("sort_by", "date_joined")
    if sort_by not in ["date_joined", "-date_joined"]:
        sort_by = "date_joined"
    users = users.order_by(sort_by)

    serializer = CustomUserSerializer(users, many=True)
    return Response(serializer.data)


# （管理員）修改帳戶詳細資訊
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def edit_user(request):
    if request.method == "POST":
        username = request.GET.get("username")
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response(
                {"status": "error", "message": "查無此用戶"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 从请求数据中获取要更新的字段
        is_superuser = request.data.get("is_superuser")
        is_active = request.data.get("is_active")
        is_staff = request.data.get("is_staff")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        password = request.data.get("password")

        # 部分更新用户对象
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
            user.set_password(password)

        # 保存更新后的用户信息
        user.save()

        return Response({"status": "success", "message": "個人資料修改成功"})


# 依據帳號顯示個人資料
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == "GET":
        username = request.GET.get("username")
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response(
                {"status": "error", "message": "查無此用戶"},
                status=status.HTTP_404_NOT_FOUND,
            )

    return Response(
        {
            "status": "success",
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": username,
        }
    )


# 修改個人帳戶資訊
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def edit_profile(request):
    if request.method == "POST":
        username = request.data.get("username")
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response(
                {"status": "error", "message": "查無此用戶"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 从请求数据中获取要更新的字段
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        password = request.data.get("password")

        # 部分更新用户对象
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if email is not None:
            user.email = email
        if password is not None:
            user.set_password(password)

        # 保存更新后的用户信息
        user.save()

        return Response({"status": "success", "message": "個人資料修改成功"})


@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def accounting_list_for_user(request):
    user = request.user
    if request.method == "GET":
        accountings = Accounting.objects.filter(
            createdId=user.username, available=True
        ).select_related("consumeType_id")
        serializer = AccountingSerializer(accountings, many=True)
        return Response(
            {"status": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )
    elif request.method == "POST":
        serializer = AccountingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(createdId=user.username, createDate=timezone.now())
            user.calculate_net_and_total_assets()
            return Response(
                {"status": "success", "message": "新增成功"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response({"status": "error", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "PUT":
        accounting = get_object_or_404(Accounting, pk=request.data.get("accountingId"))
        serializer = AccountingSerializer(accounting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user.calculate_net_and_total_assets()
            return Response(
                    {"status": "success", "message": "更新成功"}, status=status.HTTP_200_OK
                )
        else:
            return Response(
                {"status": "error", "message": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
    elif request.method == "DELETE":
        accounting = get_object_or_404(Accounting, pk=request.data.get("accountingId"))
        accounting.available = False
        accounting.save()
        user.calculate_net_and_total_assets()
        return Response(
                    {"status": "success", "message": "紀錄已被刪除"}, status=status.HTTP_200_OK
                )


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAdminUser])
def accounting_list_for_admin(request):
    user = request.user
    if request.method == "GET":
        create_id = request.query_params.get("createId")
        available = request.query_params.get("available")
        sort_order = request.query_params.get(
            "sort", "createDate"
        )  # Use '-createDate' for descending order

        # Build the query
        query = Accounting.objects.all()
        if create_id:
            query = query.filter(createdId=create_id)
        query = query.filter(available=available)
        query = query.order_by(sort_order)

        # Execute the query
        if not query.exists():
            return Response(
                {"status": "error", "message": "紀錄不存在"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Serialize the queryset
        serializer = AccountingSerializer(query, many=True)
        return Response(
            {"status": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )
    elif request.method == "PUT":
        pk = request.GET.get("accountingId")
        accounting = Accounting.objects.get(accountingId=pk)
        serializer = AccountingSerializer(accounting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user.calculate_net_and_total_assets()
            return Response(
                    {"status": "success", "message": "更新成功"}, status=status.HTTP_200_OK
                )
        return Response(
            {"status": "error", "message": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    elif request.method == "DELETE":
        accounting = get_object_or_404(Accounting, pk=request.data.get("accountingId"))
        accounting.available = False
        accounting.save()
        user.calculate_net_and_total_assets()
        return Response(
                    {"status": "success", "message": "紀錄已被刪除"}, status=status.HTTP_200_OK
                )


# ConsumeType Views
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAdminUser])
def consume_type_operations(request, pk=None):
    if request.method == "GET":
        if pk is not None:
            try:
                consume_type = ConsumeType.objects.get(pk=pk)
                serializer = ConsumeTypeSerializer(consume_type)
            except ConsumeType.DoesNotExist:
                return Response(
                {"status": "error", "message": "紀錄不存在"},
                status=status.HTTP_404_NOT_FOUND,
            )
        else:
            consume_types = ConsumeType.objects.all()
            serializer = ConsumeTypeSerializer(consume_types, many=True)
        return Response(
            {"status": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )

    elif request.method == "POST":
        serializer = ConsumeTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(createdId=request.user.username, createDate=timezone.now())
            return Response(
                {"status": "success", "message": "新增成功"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return  Response(
                {"status": "error", "message": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

    elif request.method == "PUT":
        pk = request.GET.get("consumeTypeId")
        try:
            consume_type = ConsumeType.objects.get(consumeTypeId=pk)
            serializer = ConsumeTypeSerializer(
                consume_type, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"status": "success", "message": "更新成功"}, status=status.HTTP_200_OK
                )
        except ConsumeType.DoesNotExist:
            return Response(
                {"status": "error", "message": "紀錄不存在"},
                status=status.HTTP_404_NOT_FOUND,
            )

    elif request.method == "DELETE":
        pk = request.GET.get("consumeTypeId")
        try:
            # Use .update() for QuerySets
            updated = ConsumeType.objects.filter(consumeTypeId=pk).update(
                available=False
            )
            if updated:
                return Response(
                    {"status": "success", "message": "紀錄已被刪除"}, status=status.HTTP_200_OK
                )
            else:
                # If nothing was updated, then the accounting record doesn't exist
                return Response(
                {"status": "error", "message": "紀錄不存在"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ConsumeType.DoesNotExist:
            return Response(
                {"status": "error", "message": "紀錄不存在"},
                status=status.HTTP_404_NOT_FOUND,
            )

#取得資產和負債資訊
@api_view(["GET"])
def financial_summary(request, username):
    user = get_object_or_404(CustomUser, username=username)

    # Retrieve query parameters
    asset_type = request.query_params.get("asset_type", None)
    start_date = request.query_params.get("start_date", None)
    end_date = request.query_params.get("end_date", None)
    aggregate_by = request.query_params.get("aggregate_by", None)
    model_type = request.query_params.get(
        "model_type", "assets"
    )  # Default to 'assets' if not specified

    if model_type not in ["assets", "liabilities"]:
        return Response(
                {"status": "error", "message": "指定的模型類型無效。選擇“資產”或“負債”"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    data = user.aggregate_financials(
        model_type, asset_type, start_date, end_date, aggregate_by
    )

    return Response(
                {"status": "success", "data": data},
                status=status.HTTP_200_OK,
            )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_bank_profile_list(request):
    if request.method == "GET":
        username = request.user.username
        list = APICredentials.objects.filter(username=username)

        if not list.exists():
            return Response(
                {"status": "error", "message": "用戶不存在銀行資料"},
                status=status.HTTP_404_NOT_FOUND,
            )

        bank_data = []
        for bank in list:
            bank_data.append(
                {
                    "id": bank.id,
                    "bank_name": bank.bank_name,
                    "region": bank.region,
                    "branch": bank.branch,
                    "account": bank.account[-4:],
                }
            )

        return Response(
            {"status": "success", "data": bank_data}, status=status.HTTP_200_OK
        )


# 銀行資料 個別查詢
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_bank_profile(request, id):
    if request.method == "GET":
        try:
            bank = APICredentials.objects.get(id=id)
        except APICredentials.DoesNotExist:
            return Response(
                {"status": "error", "message": "查無此銀行資料"},
                status=status.HTTP_404_NOT_FOUND,
            )

    serializer = APICredentialsSerializer(bank)
    return Response(
        {"status": "success", "data": serializer.data}, status=status.HTTP_200_OK
    )


# 銀行資料 新增
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_bank_profile(request):
    if request.method == "POST":
        username = request.user.username
        serializer = APICredentialsSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            ca_file = request.data.get('ca_file', None)
            if not ca_file:
                return Response(
                    {"status": "error", "message": "未上傳文件"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            serializer.validated_data['ca_path'] = ca_file

            serializer.save()
            return Response(
                {"status": "success", "message": "銀行資料新增成功"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"status": "error", "message": serializer.errors},
                status=status.HTTP_404_NOT_FOUND,
            )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_bank_profile(request, id):
    if request.method == "PUT":
        try:
            bank = APICredentials.objects.get(id=id)
        except APICredentials.DoesNotExist:
            return Response(
                {"status": "error", "message": "查無此銀行資料"},
                status=status.HTTP_404_NOT_FOUND,
            )

        ca_file = request.FILES.get('ca_file', None)
        if ca_file:
            request.data['ca_path'] = ca_file
            serializer = APICredentialsSerializer(bank, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                storage, path = bank.ca_path.storage, bank.ca_path.path
                storage.delete(path)
                return Response(
                    {"status": "success", "message": "銀行資料更新成功"},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            ca_path = request.data.get('ca_path', None)
            if isinstance(ca_path, str):
                bank.ca_path = ca_path
                bank.save()
                return Response(
                    {"status": "success", "message": "銀行資料更新成功"},
                    status=status.HTTP_200_OK,
                )
            else:
                serializer = APICredentialsSerializer(bank, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.update()
                    return Response(
                        {"status": "success", "message": "銀行資料更新成功"},
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 銀行資料 刪除
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_bank_profile(request, id):
    if request.method == "DELETE":
        try:
            bank = APICredentials.objects.get(id=id)
            bank.delete()
            return Response(
                {"status": "success", "message": "銀行資料刪除成功"},
                status=status.HTTP_200_OK,
            )
        except APICredentials.DoesNotExist:
            return Response(
                {"status": "error", "message": "查無此銀行資料"},
                status=status.HTTP_404_NOT_FOUND,
            )


# 股票資料 單獨查詢
@api_view(["GET"])
def get_stock_detail(request, id):
    if request.method == "GET":
        try:
            api = sj.Shioaji(simulation=True)  # 模擬模式
            api.login(
                api_key=config["shioaji"]["api_key"],
                secret_key=config["shioaji"]["secret_key"],
            )
            ticks = api.ticks(contract=api.Contracts.Stocks[id], date="2024-05-15")
            df = pd.DataFrame({**ticks})
            df.ts = pd.to_datetime(df.ts)
        except:
            return Response(
                {"status": "error", "message": "查無此股票代碼"},
                status=status.HTTP_404_NOT_FOUND,
            )

    return Response({"status": "success", "data": df.T}, status=status.HTTP_200_OK)

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/submit', methods=['POST'])
def validate_recaptcha():
    logging.debug("Function called")  # 新增日誌輸出
    recaptcha_response = request.form['g-recaptcha-response']
    secret_key = '6LdmwcgpAAAAAFkprWdUSzzAZ8dE-1obmzqLK3Nf'
    
    logging.debug(f"Received reCAPTCHA response: {recaptcha_response}")
    
    data = {
        'secret': secret_key,
        'response': recaptcha_response
    }
    verify_url = 'https://www.google.com/recaptcha/api/siteverify'
    response = requests.post(verify_url, data=data)
    verification_result = response.json()

    logging.debug(f"Google verification result: {verification_result}")
    
    if verification_result.get('success'):
        logging.info('CAPTCHA verification succeeded')
        return Response(
                {"status": "success", "message": "CAPTCHA驗證成功"},
                status=status.HTTP_200_OK,
            )
    else:
        logging.warning('CAPTCHA verification failed')
        return Response(
                {"status": "error", "message": "CAPTCHA驗證失敗"},
                status=status.HTTP_400_BAD_REQUEST,
            )

logger = logging.getLogger('my_logger')

def create_assessment(project_id: str, recaptcha_key: str, token: str, recaptcha_action: str):
    logger.debug(f"Project ID: {project_id}")
    logger.debug(f"Recaptcha Key: {recaptcha_key}")
    logger.debug(f"Token: {token}")
    logger.debug(f"Recaptcha Action: {recaptcha_action}")
    client = recaptchaenterprise_v1.RecaptchaEnterpriseServiceClient()

    # 设定要追踪的事件属性。
    event = recaptchaenterprise_v1.Event()
    event.site_key = recaptcha_key
    event.token = token  # 使用从参数传递进来的 token

    assessment = recaptchaenterprise_v1.Assessment()
    assessment.event = event

    project_name = f"projects/{project_id}"

    # 建立评估请求。
    request = recaptchaenterprise_v1.CreateAssessmentRequest()
    request.assessment = assessment
    request.parent = project_name

    response = client.create_assessment(request)

    # 确认 token 是否有效。
    if not response.token_properties.valid:
        print(
            "The CreateAssessment call failed because the token was invalid for the following reasons: "
            + str(response.token_properties.invalid_reason)
        )
        return

    # 确认是否已执行预期的动作。
    if response.token_properties.action != recaptcha_action:
        print(
            "The action attribute in your reCAPTCHA tag does not match the action you are expecting to score"
        )
        return
    else:
        # 获取风险分数和原因。
        for reason in response.risk_analysis.reasons:
            print(reason)
        print(
            "The reCAPTCHA score for this token is: " + str(response.risk_analysis.score)
        )
        # 获取评估作业名称 (ID)，然后使用该名称为评估作业加注。
        assessment_name = client.parse_assessment_path(response.name).get("assessment")
        print(f"Assessment name: {assessment_name}")
    
    return response
