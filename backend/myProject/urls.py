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
    path('users/', views.UserList.as_view(), name='user-list'),

    # 註冊 URL
    path('register/', views.register, name='register'),

    # 登入 URL
    path('login/', views.login_view, name='login'),

    # 登出 URL
    path('logout/', views.logout_view, name='logout'),

    # 修改密碼 URL
    path('change-password/', views.change_password, name='change_password'),

]

