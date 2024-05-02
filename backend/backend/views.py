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

