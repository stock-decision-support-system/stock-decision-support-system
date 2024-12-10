# 使用更輕量的 Node.js 基本映像檔
FROM node:16-slim

# 設定工作目錄
WORKDIR /app

# 複製依賴檔案
COPY package.json package-lock.json ./

# 安裝必要套件（使用 --production 參數可僅安裝生產依賴）
RUN npm install --production --legacy-peer-deps

# 複製其餘程式碼
COPY . .

# 設置環境變數（可選）
ENV NODE_ENV=production

# 開啟服務
CMD ["npm", "start"]