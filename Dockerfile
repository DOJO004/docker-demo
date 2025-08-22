# 使用精簡版 Node.js
FROM node:18-alpine

# 建立工作目錄
WORKDIR /app

# 先安裝依賴
COPY package*.json ./
RUN npm install

# 複製程式碼
COPY . .

# 準備資料儲存目錄（在容器內）
RUN mkdir -p /data
ENV DB_PATH=/data/app.db

# 對外埠口
EXPOSE 3000

# 啟動指令
CMD ["npm", "start"]
