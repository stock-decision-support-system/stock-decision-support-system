# 使用 Python 基本映像檔
FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 安裝必要套件
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 複製專案程式碼
COPY . .

# 啟動命令
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
