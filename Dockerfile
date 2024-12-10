# 使用 Nginx 或其他 Web 伺服器作為基底映像
FROM nginx:alpine

# 複製 SSL 憑證文件到容器內部目錄
# 用戶端憑證 (如果需要用戶端驗證)
COPY ./ssl/server-cert.pem /etc/ssl/certs/server-cert.pem
# 私密金鑰 (與原始伺服器憑證配對，給 Nginx 使用的密鑰)
COPY ./ssl/server-key.pem /etc/ssl/private/server-key.pem

# 複製 Nginx 配置檔案 (根據您的實際需求修改配置)
COPY nginx.conf /etc/nginx/nginx.conf

# 開放 443 端口 (HTTPS)
EXPOSE 443

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]