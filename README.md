# Pet Swap 寵物用品二手交易平台 (後端專案)

歡迎來到 Pet Swap，這是一個專為寵物飼主打造的二手用品交易平台。我們使用 Node.js 和 Express 框架開發，讓使用者可以輕鬆進行寵物用品的買賣。

## 目錄

- [功能](#功能)
- [環境](#環境)
- [安裝](#安裝)
- [測試帳號](#測試帳號)

## 功能

- **使用者註冊/登入：** 使用者需登入或註冊帳號，可使用郵箱進行註冊。

- **瀏覽/搜尋商品：** 提供首頁展示所有商品，支援類別和關鍵字搜尋，點擊商品可查看詳細資訊和商店資訊。

- **購物車系統：** 買家可隨時查看、管理購物車中的商品，包括刪除和結帳，系統將自動清理已售出商品。

- **個人中心：** 買家可自行修改個人資料，查看歷史訂單以及對購買商品進行評價。

- **商店中心：** 賣家可提交賣家申請，管理商品和商店資訊，並查看已售商品及相關評價。

- **評價商品：** 買家可對購買的商品進行評價，賣家則可查看。

- **後台管理：** 僅限擁有管理員權限的帳號，可查看使用者和商店清單，進行商品類別的管理。

## 環境
請先確保已安裝 Node.js 和 npm 。

## 安裝

1. 將專案clone到本地:
```
git clone https://github.com/ciao0603/pet-swap.git
```
2. 在本地開啟專案:
```
cd pet-swap
```
3. 下載相關套件:
```
npm i
```
4. 參考 .env 範例設定環境變數:
```
PORT=3000
MONGODB_URI=YOUR_MONGODB_URI
SESSION_SECRET=secret
IMGUR_CLIENT_ID=YOUR_IMGUR_CLIENT_ID
```
5. 設定資料庫 (或根據個人需求調整):
```
// config/config.json
"development": {
    "username": "root",
    "password": "password",
    "database": "capstone",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
```
6. 建立資料模型:
```
npm run migrate
```
7. 載入種子資料:
```
npm run seed
```
8. 啟動專案:
```
npm run start

// 使用 nodemon 則輸入下行
npm run dev
```
9. 如果看到這行字代表啟動成功，輸入網址即可進入應用程式:
```
App is running on localhost:3000
```
10. 如需停止請輸入
```
ctrl+C
```

## 測試帳號
可使用以下三個帳號進行各種身分的測試
- 管理者
  帳號: root@example.com  
  密碼: 12345678
- user1
  身分: 商店
  帳號: user1@example.com  
  密碼: 12345678
- user2
  身分: 買家
  帳號: user2@example.com  
  密碼: 12345678