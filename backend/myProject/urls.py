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
from django.conf import settings
from django.conf.urls.static import static
from backend.views import views
from backend.views import stockViews
from backend.views import accountingViews

from backend.views.accountingViews import FinancialAnalysisView

urlpatterns = [
    # django後台
    path('admin/', admin.site.urls),

    # 資料庫轉換為json後的資料
    path('users/', views.UserList.as_view(), name="anything"),

    # 註冊 URL
    path('register/', views.register, name='register'),

    # 登入 URL
    path('login/', views.login_view, name='login'),

    # 二段式驗證
    path('send_verification_code/', views.send_verification_code, name='send_verification_code'),
    path('verify_code/', views.verify_code, name='verify_code'),

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

    # 記帳
    path('accounting/user/', accountingViews.accounting_list_for_user, name='accounting-list-user'),
    path('accounting/page/', accountingViews.get_accounting_total_pages, name='accounting-list-page'),
    path('accounting/admin/', accountingViews.accounting_list_for_admin, name='accounting-list-admin'),
    path('consume-type/', accountingViews.consume_type_operations, name='consume_type_list'),
    path('consume-type/<int:id>/', accountingViews.consume_type_operations, name='consume_type_detail'),
    path('account-type/', accountingViews.account_type_operations, name='account_type_list'),
    path('account-type/<int:id>/', accountingViews.account_type_operations, name='account_type_detail'),
    path('account-type/chart/', accountingViews.account_charts_user, name='accounting_charts_user'),
    path('consume-type/chart/', accountingViews.consume_charts_user, name='consume_charts_user'),
    path('financial-analysis/', FinancialAnalysisView.as_view(), name='financial-analysis'),

    # 儲蓄目標
    path('budget/', accountingViews.budget_operations, name='budget_operations'),
    path('budget/<int:id>/', accountingViews.budget_operations, name='budget_detail'),

    # 銀行資料
    path('bank-profile/add/', views.add_bank_profile, name='add-bank-profile'),
    path('bank-profile/update/<int:id>/', views.update_bank_profile, name='update-bank-profile'),
    path('bank-profile/delete/<int:id>/', views.delete_bank_profile, name='delete-bank-profile'),
    path('bank-profile/list/', views.get_bank_profile_list, name='get-bank-profile-list'),
    path('bank-profile/get/<int:id>/', views.get_bank_profile, name='get-bank-profile'),
    
    # 股票查詢
    path('stock/get/<str:id>/', stockViews.get_stock_detail, name='get-stock-detail'),
    path('stock/kbar/<str:id>/', stockViews.get_kbars, name='get-kbar'),
    path('investment/stocks/', stockViews.get_all_stocks, name='get_all_stocks'),
    path('stock/twfif/', stockViews.get_tw_stocks, name='get-tw-stocks'),

    # 投資組合
    path('investment/portfolios/', stockViews.get_portfolios, name='get_portfolios'),
    path('investment/portfolios/create/', stockViews.create_portfolio, name='create_portfolio'),
    path('investment/portfolios/<int:id>/investments/', stockViews.add_investment, name='add_investment'),
    path('investment/portfolios/<int:portfolio_id>/delete/', stockViews.delete_portfolio, name='delete_portfolio'),
    path('investment/stock_price/<str:symbol>/', stockViews.get_stock_price, name='get_stock_price'),
    path('investment/portfolios/<int:portfolio_id>/', stockViews.get_portfolio_detail, name='get_portfolio_detail'),
    path('investment/default-investment-portfolios/', stockViews.default_investment_portfolios, name='default-investment-portfolios'),
    path('investment/default-investment-portfolios/<int:portfolio_id>/', stockViews.get_portfolio_detaila, name='portfolio-detail'),
    path('investment/portfolio-performance/<int:portfolio_id>/', stockViews.portfolio_monthly_performance, name='portfolio_monthly_performance'),
    path('investment/calculate-threshold/<int:portfolio_id>/', stockViews.calculate_threshold, name='calculate_threshold'),



    # 資產負債查詢
    path('users/<username>/financial-summary/', accountingViews.financial_summary, name='financial-summary'),
    path('asset-change/', accountingViews.assets_change_chart, name='assets_change_chart'),

    # 股票下單
    path('api/login-to-shioaji/', stockViews.login_to_shioaji_view, name='login_to_shioaji'),
    path('api/place-odd-lot-order/', stockViews.place_odd_lot_order, name='place-odd-lot-order'),
    path('api/cancel-odd-lot-order/', stockViews.cancel_odd_lot_order, name='cancel-odd-lot-order'),
    path('api/place-odd-lot-orders/', stockViews.place_odd_lot_orders, name='place_odd_lot_orders'),
    path('api/cancel-odd-lot-orders/',stockViews.cancel_odd_lot_orders, name='cancel_odd_lot_orders'),
    path('api/order-status/', stockViews.get_all_order_status, name='get_order_status'),
    path('api/portfolio-status/', stockViews.get_portfolio_status, name='get_portfolio_status'),
    path('api/account-balance/', stockViews.get_account_balance, name='get_account_balance'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)