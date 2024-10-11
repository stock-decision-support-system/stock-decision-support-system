from datetime import datetime, timedelta
from decimal import Decimal

import openai
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView

from ..models import (
    AccountType,
    Budget,
    CustomUser,
    Accounting,
    ConsumeType,
)

from django.db.models import Sum, Case, When, F, Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from ..serializers import (
    AccountTypeSerializer,
    AccountingSerializer,
    BudgetSerializer,
    ConsumeTypeSerializer,
)
from django.db import models
import yaml
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

import logging

from myProject import settings

# 設置日誌
logger = logging.getLogger(__name__)

# 讀取配置文件
with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)  # 讀取 YAML 配置檔案


# 獲取記帳紀錄總頁數的 API
@api_view(["GET"])  # 允許 GET 方法
@permission_classes([IsAuthenticated])  # 需要認證
def get_accounting_total_pages(request):
    user = request.user  # 獲取當前請求的用戶

    page_size = 8  # 每頁顯示 8 條記錄

    # 獲取過濾參數
    account_type_filter = request.query_params.get(
        "accountType", None
    )  # 從查詢參數獲取 accountType
    asset_type_filter = request.query_params.get(
        "assetType", None
    )  # 從查詢參數獲取 assetType

    # 構建查詢集，先過濾出可用的記帳紀錄
    accountings = Accounting.objects.filter(
        createdId=user, available=True  # 使用 User 物件而不是 username
    ).select_related(
        "consumeType", "accountType"
    )  # 預加載相關的 consumeType, accountType

    # 根據 account 過濾，如果 account_filter 有值
    if account_type_filter:
        accountings = accountings.filter(accountType=account_type_filter)

    # 根據 assetType 過濾，如果 asset_type_filter 有值
    if asset_type_filter:
        accountings = accountings.filter(assetType=asset_type_filter)

    # 分頁計算
    paginator = Paginator(accountings, page_size)
    total_pages = paginator.num_pages  # 獲取總頁數

    return Response(
        {"status": "success", "data": {"totalPages": total_pages}},
        status=status.HTTP_200_OK,
    )


# 用戶記帳紀錄列表 API
@api_view(["GET", "POST", "PUT", "DELETE"])  # 允許 GET、POST、PUT 和 DELETE 方法
@permission_classes([IsAuthenticated])  # 需要認證
def accounting_list_for_user(request):
    user = request.user  # 獲取當前請求的用戶

    if request.method == "GET":
        page = request.GET.get("page", 1)  # 默認第1頁
        page_size = 8  # 每頁顯示 8 條記錄
        # 獲取過濾參數
        account_type_filter = request.query_params.get(
            "accountType", None
        )  # 從查詢參數獲取 accountType
        asset_type_filter = request.query_params.get(
            "assetType", None
        )  # 從查詢參數獲取 assetType

        # 構建查詢集，先過濾出可用的記帳紀錄
        accountings = Accounting.objects.filter(
            createdId=user, available=True  # 使用 User 物件而不是 username
        ).select_related(
            "consumeType", "accountType"
        )  # 預加載相關的 consumeType, accountType

        # 根據 account 過濾，如果 account_filter 有值
        if account_type_filter:
            accountings = accountings.filter(
                accountType=account_type_filter
            )  # 假設 Accounting 模型有 accountType 欄位

        # 根據 assetType 過濾，如果 asset_type_filter 有值
        if asset_type_filter:
            accountings = accountings.filter(
                assetType=asset_type_filter
            )  # 假設 consumeType_id 代表 assetType

        # 分頁
        paginator = Paginator(accountings, page_size)

        try:
            # 獲取對應頁面的記錄
            accountings_page = paginator.page(page)
        except PageNotAnInteger:
            # 如果 page 不是整數，返回第一頁
            accountings_page = paginator.page(1)
        except EmptyPage:
            # 如果 page 超出範圍，返回最後一頁
            accountings_page = paginator.page(paginator.num_pages)

        # 序列化記帳紀錄
        serializer = AccountingSerializer(accountings_page, many=True)
        data = serializer.data

        for i, accounting in enumerate(data):
            data[i] = {
                **accounting,
                "accountTypeName": str(accountings[i].accountType.account_name),
                "accountTypeIcon": str(accountings[i].accountType.icon),
                "consumeTypeName": str(accountings[i].consumeType.name),
                "consumeTypeIcon": str(accountings[i].consumeType.icon),
            }

        return Response({"status": "success", "data": data}, status=status.HTTP_200_OK)

    elif request.method == "POST":
        # 創建新的記帳紀錄
        serializer = AccountingSerializer(
            data=request.data, context={"request": request}
        )  # 使用請求數據進行序列化
        if serializer.is_valid():  # 驗證數據
            accounting_record = serializer.save(
                createDate=timezone.now(), createdId=user
            )  # 保存並設置創建者
            try:
                accounting_record.accountType.calculate_balance()
            except AccountType.DoesNotExist:
                return Response(
                    {"status": "error", "message": "紀錄不存在"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            user.calculate_net_and_total_assets()  # 更新用戶資產狀態

            return Response(
                {"status": "success", "message": "新增成功"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"status": "error", "message": serializer.errors},  # 返回驗證錯誤
                status=status.HTTP_400_BAD_REQUEST,
            )

    elif request.method == "PUT":
        # 更新現有的記帳紀錄
        accounting = get_object_or_404(Accounting, pk=request.data.get("accountingId"))
        serializer = AccountingSerializer(
            accounting, data=request.data, partial=True
        )  # 使用部分更新
        if serializer.is_valid():  # 驗證數據
            accounting_record = serializer.save()  # 保存更新
            try:
                accounting_record.accountType.calculate_balance()
            except AccountType.DoesNotExist:
                return Response(
                    {"status": "error", "message": "紀錄不存在"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            user.calculate_net_and_total_assets()  # 更新用戶資產狀態
            return Response(
                {"status": "success", "message": "更新成功"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"status": "error", "message": serializer.errors},  # 返回驗證錯誤
                status=status.HTTP_400_BAD_REQUEST,
            )

    elif request.method == "DELETE":
        # 刪除記帳紀錄（將其標記為不可用）
        accounting = get_object_or_404(Accounting, pk=request.data.get("accountingId"))
        accounting.available = False  # 標記為不可用
        accounting.save()  # 保存更改
        user.calculate_net_and_total_assets()  # 更新用戶資產狀態
        return Response(
            {"status": "success", "message": "紀錄已被刪除"}, status=status.HTTP_200_OK
        )


# 管理員記帳紀錄列表 API
@api_view(["GET", "PUT", "DELETE"])  # 允許 GET、PUT 和 DELETE 方法
@permission_classes([IsAdminUser])  # 需要管理員權限
def accounting_list_for_admin(request):
    user = request.user  # 獲取當前認證用戶（管理員）
    if request.method == "GET":
        # 根據查詢參數獲取記帳紀錄
        create_id = request.query_params.get("createId")  # 獲取創建者 ID
        available = request.query_params.get("available")  # 獲取可用性標記
        sort_order = request.query_params.get(
            "sort", "createDate"
        )  # 默認按創建日期排序

        # 構建查詢
        query = Accounting.objects.all()  # 獲取所有記帳紀錄
        if create_id:  # 根據創建者 ID 篩選
            query = query.filter(createdId=create_id)
        query = query.filter(available=available)  # 根據可用性篩選
        query = query.order_by(sort_order)  # 排序查詢結果

        # 執行查詢
        if not query.exists():  # 若查詢結果為空，返回錯誤
            return Response(
                {"status": "error", "message": "紀錄不存在"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # 序列化查詢結果
        serializer = AccountingSerializer(query, many=True)
        return Response(
            {"status": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )
    elif request.method == "PUT":
        # 更新現有的記帳紀錄
        pk = request.GET.get("accountingId")  # 獲取記帳紀錄 ID
        accounting = Accounting.objects.get(accountingId=pk)
        serializer = AccountingSerializer(
            accounting, data=request.data, partial=True
        )  # 使用部分更新
        if serializer.is_valid():  # 驗證數據
            serializer.save()  # 保存更新
            user.calculate_net_and_total_assets()  # 更新用戶資產狀態
            return Response(
                {"status": "success", "message": "更新成功"}, status=status.HTTP_200_OK
            )
        return Response(
            {"status": "error", "message": serializer.errors},  # 返回驗證錯誤
            status=status.HTTP_400_BAD_REQUEST,
        )
    elif request.method == "DELETE":
        # 刪除記帳紀錄（將其標記為不可用）
        accounting = get_object_or_404(Accounting, pk=request.data.get("accountingId"))
        accounting.available = False  # 標記為不可用
        accounting.save()  # 保存更改
        user.calculate_net_and_total_assets()  # 更新用戶資產狀態
        return Response(
            {"status": "success", "message": "紀錄已被刪除"}, status=status.HTTP_200_OK
        )


# 消費類型操作 API
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])  # 需要認證
def consume_type_operations(request, id=None):
    if request.method == "GET":
        # 獲取消費類型
        user = request.user  # 獲取當前登入者
        if id is not None:
            # 根據主鍵獲取特定消費類型
            try:
                consume_type = ConsumeType.objects.get(id=id)  # 根據主鍵查找
                serializer = ConsumeTypeSerializer(consume_type)  # 序列化單個消費類型
            except ConsumeType.DoesNotExist:
                return Response(
                    {"status": "error", "message": "紀錄不存在"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # 獲取當前登入者或管理員的所有消費類型
            consume_types = ConsumeType.objects.filter(
                createdId__in=[user, "admin"], available=True
            )  # 根據主鍵查找並篩選 available 為 true
            serializer = ConsumeTypeSerializer(
                consume_types, many=True
            )  # 序列化多個消費類型
        return Response(
            {"status": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )

    elif request.method == "POST":
        # 創建新的消費類型
        serializer = ConsumeTypeSerializer(
            data=request.data, context={"request": request}
        )  # 使用傳入數據初始化序列化器
        if serializer.is_valid():  # 驗證數據
            serializer.save(createDate=timezone.now())  # 保存並設置創建者和創建日期
            return Response(
                {"status": "success", "message": "新增成功"},  # 返回成功信息
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"status": "error", "message": serializer.errors},  # 返回驗證錯誤
                status=status.HTTP_400_BAD_REQUEST,
            )

    elif request.method == "PUT":
        # 更新現有的消費類型
        id = request.GET.get("id")  # 從查詢參數獲取消費類型 ID
        try:
            consume_type = ConsumeType.objects.get(id=id)  # 根據消費類型 ID 查找
            serializer = ConsumeTypeSerializer(
                consume_type, data=request.data, partial=True  # 使用部分更新
            )
            if serializer.is_valid():  # 驗證數據
                serializer.save()  # 保存更新
                return Response(
                    {"status": "success", "message": "更新成功"},  # 返回成功信息
                    status=status.HTTP_200_OK,
                )
        except ConsumeType.DoesNotExist:
            return Response(
                {"status": "error", "message": "紀錄不存在"},  # 如果找不到，返回404
                status=status.HTTP_404_NOT_FOUND,
            )

    elif request.method == "DELETE":
        # 刪除消費類型（將其標記為不可用）
        id = request.GET.get("id")  # 從查詢參數獲取消費類型 ID

        # 檢查 id 是否在不允許的範圍內
        if id in map(str, range(1, 13)):  # id 為 1 到 12
            return Response(
                {"status": "error", "message": "紀錄不可刪除"},  # 返回錯誤信息
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            # 使用 .update() 對查詢集進行標記為不可用
            updated = ConsumeType.objects.filter(id=id).update(available=False)
            if updated:  # 如果更新成功
                return Response(
                    {"status": "success", "message": "紀錄已被刪除"},  # 返回成功信息
                    status=status.HTTP_200_OK,
                )
            else:
                # 如果沒有任何更新，則說明消費類型不存在
                return Response(
                    {"status": "error", "message": "紀錄不存在"},  # 返回404
                    status=status.HTTP_404_NOT_FOUND,
                )
        except ConsumeType.DoesNotExist:
            return Response(
                {"status": "error", "message": "紀錄不存在"},  # 如果找不到，返回404
                status=status.HTTP_404_NOT_FOUND,
            )


# 消費帳戶操作 API
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])  # 需要認證
def account_type_operations(request, id=None):
    if request.method == "GET":
        # 獲取消費帳戶
        user = request.user  # 獲取當前登入者
        if id is not None:
            # 根據主鍵獲取特定消費帳戶
            try:
                account_type = AccountType.objects.get(id=id)  # 根據主鍵查找
                serializer = AccountTypeSerializer(account_type)  # 序列化單個消費帳戶
            except AccountType.DoesNotExist:
                return Response(
                    {"status": "error", "message": "紀錄不存在"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # 獲取當前登入者的所有消費帳戶
            account_type = AccountType.objects.filter(
                username=user, available=True
            )  # 根據主鍵查找並篩選 available 為 true
            serializer = AccountTypeSerializer(
                account_type, many=True
            )  # 序列化多個消費帳戶
        return Response(
            {"status": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )

    elif request.method == "POST":
        # 創建新的消費帳戶
        serializer = AccountTypeSerializer(
            data=request.data, context={"request": request}
        )  # 使用傳入數據初始化序列化器
        if serializer.is_valid():  # 驗證數據
            serializer.save(createDate=timezone.now())  # 保存並設置創建者和創建日期
            return Response(
                {"status": "success", "message": "新增成功"},  # 返回成功信息
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"status": "error", "message": serializer.errors},  # 返回驗證錯誤
                status=status.HTTP_400_BAD_REQUEST,
            )

    elif request.method == "PUT":
        # 更新現有的消費帳戶
        id = request.GET.get("id")  # 從查詢參數獲取消費帳戶 ID
        try:
            account_type = AccountType.objects.get(id=id)  # 根據消費帳戶 ID 查找
            serializer = AccountTypeSerializer(
                account_type, data=request.data, partial=True  # 使用部分更新
            )
            if serializer.is_valid():  # 驗證數據
                serializer.save()  # 保存更新
                return Response(
                    {"status": "success", "message": "更新成功"},  # 返回成功信息
                    status=status.HTTP_200_OK,
                )
        except AccountType.DoesNotExist:
            return Response(
                {"status": "error", "message": "紀錄不存在"},  # 如果找不到，返回404
                status=status.HTTP_404_NOT_FOUND,
            )

    elif request.method == "DELETE":
        # 刪除消費帳戶（將其標記為不可用）
        id = request.GET.get("id")  # 從查詢參數獲取消費帳戶 ID
        try:
            # 使用 .update() 對查詢集進行標記為不可用
            updated = AccountType.objects.filter(id=id).update(available=False)
            if updated:  # 如果更新成功
                return Response(
                    {"status": "success", "message": "紀錄已被刪除"},  # 返回成功信息
                    status=status.HTTP_200_OK,
                )
            else:
                # 如果沒有任何更新，則說明消費帳戶不存在
                return Response(
                    {"status": "error", "message": "紀錄不存在"},  # 返回404
                    status=status.HTTP_404_NOT_FOUND,
                )
        except AccountType.DoesNotExist:
            return Response(
                {"status": "error", "message": "紀錄不存在"},  # 如果找不到，返回404
                status=status.HTTP_404_NOT_FOUND,
            )


# 取得資產和負債資訊的 API
@api_view(["GET"])  # 只允許 GET 方法
@permission_classes([IsAuthenticated])  # 需要身份驗證
def financial_summary(request, username):
    user = get_object_or_404(CustomUser, username=username)  # 根據用戶名查找用戶

    return Response(
        {
            "status": "success",
            "data": {
                "total_assets": str(user.total_assets),
                "net_assets": str(user.net_assets),
            },
        },  # 返回成功信息和資產總額
        status=status.HTTP_200_OK,
    )


# 用戶消費帳戶直條圖 API
@api_view(["GET"])  # 允許 GET 方法
@permission_classes([IsAuthenticated])  # 需要認證
def account_charts_user(request):
    user = request.user  # 獲取當前請求的用戶# 獲取過濾參數
    # 獲取當前登入者的所有消費帳戶
    account_type = AccountType.objects.filter(username=user, available=True).order_by(
        "-balance"
    )  # 根據主鍵查找並篩選 available 為 true
    serializer = AccountTypeSerializer(account_type, many=True)  # 序列化多個消費帳戶
    # 处理序列化后的数据，添加额外字段
    data = []
    for type_data in account_type:
        accounting_data = {
            "type": type_data.icon + " " + type_data.account_name,
            "value": type_data.balance,
        }
        data.append(accounting_data)
    return Response({"status": "success", "data": data}, status=status.HTTP_200_OK)


# 用戶消費類別圓餅圖 API
@api_view(["GET"])  # 允許 GET 方法
@permission_classes([IsAuthenticated])  # 需要認證
def consume_charts_user_All(request):
    user = request.user  # 獲取當前請求的用戶

    # 獲取當前登入者的所有消費帳戶
    accounting_datas = (
        Accounting.objects.filter(
            createdId=user, available=True  # 使用 User 物件而不是 username
        )
        .select_related("consumeType")  # 預加載相關的 consumeType
        .values(
            "consumeType__icon", "consumeType__name"
        )  # 獲取 consumeType 的 icon 和 name
        .annotate(
            total_amount=Sum(
                Case(
                    When(assetType=0, then=F("amount")),  # 收入
                    When(assetType=1, then=-F("amount")),  # 支出
                    output_field=models.DecimalField(),  # 指定返回類型為 DecimalField
                )
            )
        )  # 計算每組的金額總和，根據 assetType 判斷正負
        .order_by("consumeType")  # 按 consumeType 排序
    )

    # 輸出結果
    datas = []
    for data in accounting_datas:
        accounting_data = {
            "name": data["consumeType__icon"]
            + " "
            + data["consumeType__name"],  # 獲取 icon name
            "value": data["total_amount"],  # 獲取總金額
        }
        datas.append(accounting_data)
    return Response({"status": "success", "data": datas}, status=status.HTTP_200_OK)


# 用戶消費類別收入/支出圓餅圖 API
@api_view(["GET"])  # 允許 GET 方法
@permission_classes([IsAuthenticated])  # 需要認證
def consume_charts_user(request):
    user = request.user  # 獲取當前請求的用戶

    # 獲取當前登入者的所有消費帳戶
    accounting_datas = (
        Accounting.objects.filter(
            createdId=user, available=True  # 使用 User 物件而不是 username
        )
        .select_related("consumeType")  # 預加載相關的 consumeType
        .values(
            "consumeType__id", "consumeType__icon", "consumeType__name"
        )  # 獲取 consumeType 的 icon 和 name
        .annotate(
            income=Sum(
                Case(
                    When(assetType=0, then=F("amount")),  # 收入
                    default=0,
                    output_field=models.DecimalField(),  # 指定返回類型為 DecimalField
                )
            ),
            expense=Sum(
                Case(
                    When(assetType=1, then=F("amount")),  # 支出
                    default=0,
                    output_field=models.DecimalField(),  # 指定返回類型為 DecimalField
                )
            ),
        )  # 分別計算收入和支出的總金額
        .order_by("consumeType")  # 按 consumeType 排序
    )

    # 輸出結果
    income_datas = []
    expense_datas = []

    for data in accounting_datas:
        income_data = {
            "id": data["consumeType__id"],
            "name": data["consumeType__icon"]
            + " "
            + data["consumeType__name"],  # 獲取 icon name
            "value": data["income"],  # 獲取收入總金額
        }
        expense_data = {
            "id": data["consumeType__id"],
            "name": data["consumeType__icon"]
            + " "
            + data["consumeType__name"],  # 獲取 icon name
            "value": data["expense"],  # 獲取支出總金額
        }
        if data["income"] > 0:  # 只添加有收入的資料
            income_datas.append(income_data)
        if data["expense"] > 0:  # 只添加有支出的資料
            expense_datas.append(expense_data)

    return Response(
        {
            "status": "success",
            "data": {"income": income_datas, "expense": expense_datas},
        },
        status=status.HTTP_200_OK,
    )


# 儲蓄目標操作 API
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])  # 需要認證
def budget_operations(request, id=None):
    user = request.user  # 獲取當前登入者
    if request.method == "GET":
        # 獲取儲蓄目標
        if id is not None:
            # 根據主鍵獲取特定儲蓄目標
            try:
                budget = Budget.objects.get(id=id)  # 根據主鍵查找
                serializer = BudgetSerializer(budget)  # 序列化單個儲蓄目標

                return Response(
                    {"status": "success", "data": serializer.data},
                    status=status.HTTP_200_OK,
                )
            except Budget.DoesNotExist:
                return Response(
                    {"status": "error", "message": "紀錄不存在"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # 獲取當前登入者的所有儲蓄目標
            budget = Budget.objects.get(
                username=user, available=True
            )  # 根據主鍵查找並篩選 available 為 true
            # 將 budget 的屬性轉換為字典
            data = {
                "id": budget.id,
                "name": budget.name,
                "target": budget.target,
                "current": budget.current,
                "start_date": budget.start_date,
                "end_date": budget.end_date,
            }

            return Response(
                {"status": "success", "data": data}, status=status.HTTP_200_OK
            )

    elif request.method == "POST":
        data = request.data.copy()  # 複製請求數據，以便進行修改
        end_date = data.get("end_date")  # 獲取 end_date

        # 檢查是否存在未達成的目標
        if Budget.objects.filter(username=user, available=True).exists():
            return Response(
                {"status": "error", "message": "你有尚未達成的目標"},  # 返回錯誤信息
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 檢查 end_date 是否為 null
        if end_date is None:
            # 設置 end_date 為今天 + 30 天
            data["end_date"] = timezone.now() + timedelta(days=30)
        # 創建新的儲蓄目標
        serializer = BudgetSerializer(
            data=data, context={"request": request}
        )  # 使用傳入數據初始化序列化器
        if serializer.is_valid():  # 驗證數據
            serializer.save()  # 保存並設置創建者和創建日期
            return Response(
                {"status": "success", "message": "新增成功"},  # 返回成功信息
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"status": "error", "message": serializer.errors},  # 返回驗證錯誤
                status=status.HTTP_400_BAD_REQUEST,
            )

    elif request.method == "PUT":
        # 更新現有的儲蓄目標
        try:
            budget = Budget.objects.get(id=id)  # 根據儲蓄目標 ID 查找
            serializer = BudgetSerializer(
                budget, data=request.data, partial=True  # 使用部分更新
            )
            if serializer.is_valid():  # 驗證數據
                serializer.save()  # 保存更新
                return Response(
                    {"status": "success", "message": "更新成功"},  # 返回成功信息
                    status=status.HTTP_200_OK,
                )
        except Budget.DoesNotExist:
            return Response(
                {"status": "error", "message": "紀錄不存在"},  # 如果找不到，返回404
                status=status.HTTP_404_NOT_FOUND,
            )

    elif request.method == "DELETE":
        # 刪除儲蓄目標（將其標記為不可用）
        if not id:
            return Response(
                {"status": "error", "message": "缺少ID參數"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # 先嘗試取得該目標
            budget = Budget.objects.get(id=id)

            # 標記為不可用
            budget.available = False
            budget.save()

            return Response(
                {"status": "success", "message": "紀錄已被刪除"},
                status=status.HTTP_200_OK,
            )

        except Budget.DoesNotExist:
            return Response(
                {"status": "error", "message": "紀錄不存在"},
                status=status.HTTP_404_NOT_FOUND,
            )


from collections import defaultdict


@api_view(["GET"])
@permission_classes([IsAuthenticated])  # 需要認證
def assets_change_chart(request):
    user = request.user  # 獲取當前登入者

    # 獲取自訂起訖日期
    start_date_str = request.query_params.get("start_date")
    end_date_str = request.query_params.get("end_date")

    # 如果沒有提供起訖日期，則默認為今天到前七天（共七天）
    if not start_date_str and not end_date_str:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=6)  # 前七天
    else:
        # 如果提供了日期，則解析它們
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
        except ValueError:
            return Response(
                {"status": "error", "message": "Invalid date format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # 確保 end_date 是在 start_date 之後
    if end_date < start_date:
        return Response(
            {"status": "error", "message": "End date must be after start date."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 計算日期範圍
    date_difference = (end_date - start_date).days

    # 準備標籤和數據
    labels = []
    data = []

    # 根據不同的日期範圍選擇按日、月或年分組
    if date_difference <= 30 * 4:  # 30天 * 4 = 120天
        # 按日分組
        current_date = start_date
        daily_records = {}

        while current_date <= end_date:
            date_key = current_date.strftime("%Y-%m-%d")
            daily_records[date_key] = {
                "total_income": Decimal(0),
                "total_expense": Decimal(0),
            }
            current_date += timedelta(days=1)

        records = Accounting.objects.filter(
            createdId=user,
            available=True,
            transactionDate__gte=start_date,
            transactionDate__lte=end_date,
        )

        for record in records:
            date_key = record.transactionDate.strftime("%Y-%m-%d")

            if record.assetType == "0":  # 收入
                daily_records[date_key]["total_income"] += record.amount
            elif record.assetType == "1":  # 支出
                daily_records[date_key]["total_expense"] += record.amount

        labels = list(daily_records.keys())
        data = [
            {
                "date": label,
                "total_assets": daily_records[label]["total_income"],
                "net_assets": daily_records[label]["total_income"]
                - daily_records[label]["total_expense"],
            }
            for label in labels
        ]

    elif date_difference <= 30 * 23:  # 30天 * 23 = 690天
        # 按月分組
        monthly_records = defaultdict(
            lambda: {"total_income": Decimal(0), "total_expense": Decimal(0)}
        )

        records = Accounting.objects.filter(
            createdId=user,
            available=True,
            transactionDate__gte=start_date,
            transactionDate__lte=end_date,
        )

        for record in records:
            month_key = record.transactionDate.strftime("%Y-%m")
            if record.assetType == "0":  # 收入
                monthly_records[month_key]["total_income"] += record.amount
            elif record.assetType == "1":  # 支出
                monthly_records[month_key]["total_expense"] += record.amount

        labels = list(monthly_records.keys())
        data = [
            {
                "date": label,
                "total_assets": monthly_records[label]["total_income"],
                "net_assets": monthly_records[label]["total_income"]
                - monthly_records[label]["total_expense"],
            }
            for label in labels
        ]

    else:
        # 按年分組
        yearly_records = defaultdict(
            lambda: {"total_income": Decimal(0), "total_expense": Decimal(0)}
        )

        records = Accounting.objects.filter(
            createdId=user,
            available=True,
            transactionDate__gte=start_date,
            transactionDate__lte=end_date,
        )

        for record in records:
            year_key = record.transactionDate.strftime("%Y")
            if record.assetType == "0":  # 收入
                yearly_records[year_key]["total_income"] += record.amount
            elif record.assetType == "1":  # 支出
                yearly_records[year_key]["total_expense"] += record.amount

        labels = list(yearly_records.keys())
        data = [
            {
                "date": label,
                "total_assets": yearly_records[label]["total_income"],
                "net_assets": yearly_records[label]["total_income"]
                - yearly_records[label]["total_expense"],
            }
            for label in labels
        ]

    return Response(
        {
            "status": "success",
            "data": data,
        },
        status=status.HTTP_200_OK,
    )


class FinancialAnalysisView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # 獲取當前登入者

        # 獲取過濾參數
        account_type_filter = request.query_params.get("accountType")
        asset_type_filter = request.query_params.get("assetType")

        # 構建查詢集，按月分組
        accountings = (
            Accounting.objects.filter(createdId=user, available=True)
            .annotate(month=TruncMonth("transactionDate"))
            .order_by("month")
        )

        if account_type_filter:
            accountings = accountings.filter(accountType=account_type_filter)

        if asset_type_filter:
            accountings = accountings.filter(assetType=asset_type_filter)

        # 計算每月的總收入和總支出
        summary = accountings.values("month").annotate(
            total_income=Sum("amount", filter=Q(assetType="0")),
            total_expense=Sum("amount", filter=Q(assetType="1")),
        )

        # 生成建議
        advice = self.generate_financial_advice(summary)

        # 將建議合併到對應的月份資料中
        merged_data = []
        for month_data in summary:
            month_str = month_data["month"].strftime("%Y-%m")  # 格式化月份字符串
            month_advice = next(
                (adv["advice"] for adv in advice if adv["month"] == month_str), None
            )  # 尋找對應的建議

            # 合併資料
            merged_entry = {
                "date": month_data["month"],
                "total_assets": month_data["total_income"],
                "net_assets": month_data["total_income"] - month_data["total_expense"],
            }
            if month_advice:  # 如果有建議，將其添加到合併的資料中
                merged_entry["advice"] = month_advice

            merged_data.append(merged_entry)

        return Response({"status": "success", "data": merged_data})

    def generate_financial_advice(self, summary):
        openai.api_key = settings.OPENAI_API_KEY
        advice = []
        for month_data in summary:
            prompt = ""
            if month_data["total_expense"] > month_data["total_income"]:
                prompt = f"在 {month_data['month'].strftime('%Y年%m月')}，支出超過收入 {month_data['total_expense'] - month_data['total_income']:.2f} 元。請問有什麼方法可以減少支出或增加收入？"
            elif month_data["total_income"] > month_data["total_expense"]:
                prompt = f"在 {month_data['month'].strftime('%Y年%m月')}，收入超過支出 {month_data['total_income'] - month_data['total_expense']:.2f} 元。請問有什麼方法可以優化儲蓄或投資策略？"

            if prompt:  # 如果有生成提示問題
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",  # 使用 chat 模型
                    messages=[
                        {
                            "role": "system",
                            "content": "你是一個精通財務管理的專家，能夠給出適用於學生的理財及儲蓄建議。",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=600,
                    temperature=0.7,
                )
                advice_text = response["choices"][0]["message"]["content"].strip()
                advice.append(
                    {
                        "month": month_data["month"].strftime("%Y-%m"),
                        "advice": advice_text,
                    }
                )
        return advice
