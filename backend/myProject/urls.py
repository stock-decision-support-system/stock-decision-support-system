"""
URL configuration for myProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from backend import views

urlpatterns = [
    #django後台
    path('admin/', admin.site.urls),

    #資料庫轉換為json後的資料
    path('users/', views.UserList.as_view(), name="anything"),

    # 註冊 URL
    path('register/', views.register, name='register'),

    # 登入 URL
    path('login/', views.login_view, name='login'),

    # 登出 URL
    path('logout/', views.logout_view, name='logout'),

    # 修改密碼 URL
    path('change-password/', views.change_password, name='change_password'),

    # 忘記密碼 URL
    path('password-reset/', views.password_reset_request, name='password_reset_request'),
    path('reset-password/<uidb64>/<token>/', views.password_reset_confirm, name='password_reset_confirm'),

    # (管理員）帳戶管理 URL
    path('manage-users/', views.manage_users, name='manage_users'),
    path('edit-user/', views.edit_user, name='edit_user'),

    # 依據帳號顯示個人資料 URL
    path('profile/', views.profile, name='profile'),

    # 修改個人資料 URL
    path('edit-profile/', views.edit_profile, name='profile'),

    path('accounting/user/', views.accounting_list_for_user, name='accounting-list-user'),
    path('accounting/admin/', views.accounting_list_for_admin, name='accounting-list-admin'),
    path('consume-type/', views.consume_type_operations, name='consume_type_list'),
    path('consume-type/<int:pk>/', views.consume_type_operations, name='consume_type_detail'),

    #銀行資料
    path('bank-profile/', views.add_bank_profile, name='add-bank-profile'),
    path('bank-profile/<int:id>/', views.update_bank_profile, name='update-bank-profile'),
    path('bank-profile/<int:id>/', views.delete_bank_profile, name='delete-bank-profile'),
    path('bank-profile/list/', views.get_bank_profile_list, name='get-bank-profile-list'),
    path('bank-profile/list/<int:id>/', views.get_bank_profile, name='get-bank-profile'),

]

