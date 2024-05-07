from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import login as django_login
from django.contrib.auth import authenticate, login, logout

from .models import CustomUser, Accounting, ConsumeType
# from .forms import RegistrationForm
from django.core.mail import send_mail
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
from .serializers import CustomUserSerializer, AccountingSerializer, ConsumeTypeSerializer


class UserList(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        users = CustomUser.objects.all()
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 註冊
@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')

        # 检查是否已存在相同的邮箱
        if CustomUser.objects.filter(email=email).exists():
            return Response({'status': 'error', 'message': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # 創建新用戶
        user = CustomUser.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)
        if user is not None:
            return Response({'status': 'success'})
        else:
            return Response({'status': 'error', 'message': 'Unable to register user.'},
                            status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'status': 'error', 'message': 'Invalid request method.'},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)


# 登入
@api_view(['POST'])
def login_view(request):
    login_credential = request.data.get('username')  # 可以是用户名也可以是邮箱
    password = request.data.get('password')

    try:
        # 確保用戶存在於數據庫中
        user = CustomUser.objects.get(username=login_credential)
    except CustomUser.DoesNotExist:
        return Response({'status': 'error', 'message': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    if user and check_password(password, user.password):
        # 更新最后登录时间
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        # 登入用户并设置会话
        django_login(request, user)
        # 重定向到主页
        return Response({'status': 'success', 'username': user.username, 'is_superuser': user.is_superuser})
    else:
        # 如果认证失败，返回登录页面并显示错误信息
        return Response({'status': 'error', 'message': 'Unable to log in with provided credentials.'})

# 登出
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'status': 'success', 'message': 'Logged out successfully'})

# 修改密碼
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):

    if request.method == 'POST':
        username = request.GET.get('username')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        user = CustomUser.objects.get(username=username)

        if check_password(old_password, user.password):
            user.set_password(new_password)
            user.save()
            return Response({'status': 'success', 'message': 'Password has been changed successfully.'})
        else:
            return Response({'status': 'error', 'message': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'status': 'error', 'message': 'Invalid request method.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


token_generator = PasswordResetTokenGenerator()

# 忘記密碼 - 會發送修改密碼連結到輸入的email
@api_view(['POST'])
def password_reset_request(request):
    if request.method == 'POST':
        email = request.data.get('email')
        try:
            user = CustomUser.objects.get(email=email)
            # 生成密碼重置令牌
            token = token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # 創建密碼重置郵件的鏈接
            reset_link = request.build_absolute_uri(f'/reset-password/{uid}/{token}/')
            # 郵件內容
            message = render_to_string('password_reset_email.html', {
                'reset_link': reset_link,
            })
            # 發送郵件
            send_mail(
                'Password Reset Request',
                message,
                'allen9111054@gmail.com',
                [email],
                fail_silently=False,
            )
            return Response({'status': 'success', 'message': 'Password reset email has been sent.', 'token': token, 'uid': uid}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'No account with that email.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'status': 'error', 'message': 'Invalid request method.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

# 根據連結（含有Token）導入到重設密碼網頁
@api_view(['POST'])
def password_reset_confirm(request, uidb64, token):
    if request.method == 'POST':
        password = request.data.get('password')
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            if token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({'status': 'success', 'message': 'Password has been reset successfully.'})
            else:
                return Response({'status': 'error', 'message': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({'status': 'error', 'message': 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'status': 'error', 'message': 'Invalid request method.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


# （管理員）帳戶管理GET帳戶資訊的頁面 - 有根據username的關鍵字搜尋、根據is-superuser, is_staff和is_active狀態做篩選、依據date_joined做排序
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def manage_users(request):
    query = request.GET.get('q', '')

    # 构建基础查询
    users = CustomUser.objects.all()
    if query:
        users = users.filter(username__icontains=query)

    # 构建状态筛选查询
    is_superuser = request.GET.get('is_superuser')
    is_staff = request.GET.get('is_staff')
    is_active = request.GET.get('is_active')

    if is_superuser:
        users = users.filter(is_superuser=is_superuser)
    if is_staff:
        users = users.filter(is_staff=is_staff)
    if is_active:
        users = users.filter(is_active=is_active)

    # 处理排序
    sort_by = request.GET.get('sort_by', 'date_joined')
    if sort_by not in ['date_joined', '-date_joined']:
        sort_by = 'date_joined'
    users = users.order_by(sort_by)

    serializer = CustomUserSerializer(users, many=True)
    return Response(serializer.data)
# （管理員）修改帳戶詳細資訊
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def edit_user(request):
    if request.method == 'POST':
        username = request.GET.get('username')
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # 从请求数据中获取要更新的字段
        is_superuser = request.data.get('is_superuser')
        is_active = request.data.get('is_active')
        is_staff = request.data.get('is_staff')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        password = request.data.get('password')

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

        return Response({'status': 'success', 'message': 'User information updated successfully.'})

# 依據帳號顯示個人資料
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        username = request.GET.get('username')
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'status': 'success', 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'username': username})

# 修改個人帳戶資訊
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def edit_profile(request):
    if request.method == 'POST':
        username = request.GET.get('username')
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # 从请求数据中获取要更新的字段
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        password = request.data.get('password')

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

        return Response({'status': 'success', 'message': 'User information updated successfully.'})


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def accounting_list_for_user(request):
    if request.method == 'GET':
        create_id = request.GET.get('createId', request.user.username)
        accountings = Accounting.objects.filter(createdId=create_id, available=True).select_related('consumeType')
        serializer = AccountingSerializer(accountings, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AccountingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(createId=request.user.username,createDate=timezone.now())
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method in ['PUT', 'DELETE']:
        pk = request.GET.get('accountingId')
        accounting = Accounting.objects.get(accountingId=pk)
        if request.method == 'PUT':
            serializer = AccountingSerializer(accounting, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == 'DELETE' and request.user.username == accounting.createdId:
            try:
                # Use .update() for QuerySets
                updated = Accounting.objects.filter(accountingId=pk).update(available=False)
                if updated:
                    return Response({'message': 'Accounting record has been soft-deleted.'},
                                    status=status.HTTP_204_NO_CONTENT)
                else:
                    # If nothing was updated, then the accounting record doesn't exist
                    return Response({'error': 'Accounting record not found.'}, status=status.HTTP_404_NOT_FOUND)
            except Accounting.DoesNotExist:
                return Response({'error': 'Accounting record not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def accounting_list_for_admin(request):
    if request.method == 'GET':
        create_id = request.query_params.get('createId')
        available = request.query_params.get('available')
        sort_order = request.query_params.get('sort', 'createDate')  # Use '-createDate' for descending order

        # Build the query
        query = Accounting.objects.all()
        if create_id:
            query = query.filter(createdId=create_id)
        query = query.filter(available=available)
        query = query.order_by(sort_order)

        # Execute the query
        if not query.exists():
            return Response({'error': 'No accounting records found.'}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the queryset
        serializer = AccountingSerializer(query, many=True)
        return Response(serializer.data)
    elif request.method == 'PUT':
        pk = request.GET.get('accountingId')
        accounting = Accounting.objects.get(accountingId=pk)
        serializer = AccountingSerializer(accounting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        # Handle soft-delete for admin
        pk = request.GET.get('accountingId')
        try:
            # Use .update() for QuerySets
            updated = Accounting.objects.filter(accountingId=pk).update(available=False)
            if updated:
                return Response({'message': 'Accounting record has been soft-deleted.'},
                                status=status.HTTP_204_NO_CONTENT)
            else:
                # If nothing was updated, then the accounting record doesn't exist
                return Response({'error': 'Accounting record not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Accounting.DoesNotExist:
            return Response({'error': 'Accounting record not found.'}, status=status.HTTP_404_NOT_FOUND)

# ConsumeType Views
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def consume_type_operations(request, pk=None):
    if request.method == 'GET':
        if pk is not None:
            try:
                consume_type = ConsumeType.objects.get(pk=pk)
                serializer = ConsumeTypeSerializer(consume_type)
            except ConsumeType.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            consume_types = ConsumeType.objects.all()
            serializer = ConsumeTypeSerializer(consume_types, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ConsumeTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(createdId=request.user.username, createDate=timezone.now())
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        pk = request.GET.get('consumeTypeId')
        try:
            consume_type = ConsumeType.objects.get(consumeTypeId=pk)
            serializer = ConsumeTypeSerializer(consume_type, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
        except ConsumeType.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'DELETE':
        pk = request.GET.get('consumeTypeId')
        try:
            # Use .update() for QuerySets
            updated = ConsumeType.objects.filter(consumeTypeId=pk).update(available=False)
            if updated:
                return Response({'message': 'ConsumeType record has been soft-deleted.'},
                                status=status.HTTP_204_NO_CONTENT)
            else:
                # If nothing was updated, then the accounting record doesn't exist
                return Response({'error': 'ConsumeType record not found.'}, status=status.HTTP_404_NOT_FOUND)
        except ConsumeType.DoesNotExist:
            return Response({'error': 'ConsumeType record not found.'}, status=status.HTTP_404_NOT_FOUND)