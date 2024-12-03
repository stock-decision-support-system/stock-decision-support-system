# 使用 Node.js 基本映像檔
FROM node:16

# 設定工作目錄
WORKDIR /app

# 複製專案程式碼
COPY package.json ./
COPY package-lock.json ./

# 安裝必要套件
RUN npm install

# 複製其餘程式碼
COPY . .

# 啟動命令
CMD ["npm", "start"]
