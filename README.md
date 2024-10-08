# Pet Swap 寵物用品二手交易平台 (全端專案)
[![Build Status](https://app.travis-ci.com/ciao0603/pet-swap.svg?token=AXb5iHNAu9cajZLyAQwy&branch=main)](https://travis-ci.com/ciao0603/pet-swap)

獨立開發專案，協助寵物飼主進行寵物二手用品的買賣。  
- 使用 **Node.js + Express.js**，並以 MVC 架構進行開發
- 使用雙資料庫進行儲存: **AWS RDS(MySQL) + MongoDB**
- 使用 **Travis CI** 單元測試並自動佈署至 **Render**
- 串接金流 - 使用 **綠界科技SDK** 進行第三方支付
#### [專案紀錄blog](https://medium.com/@jocelyn94032.0/%E7%95%A2%E6%A5%AD%E4%BA%86-%E7%84%B6%E5%BE%8C%E5%91%A2-8c7ffd91f35b)
#### [專案網址](https://pet-swap.onrender.com) (專案開啟可能須等待1分鐘，可使用下面提供的測試帳號直接登入)
## 目錄

- [功能](#功能)
- [環境](#環境)
- [安裝](#安裝)
- [網站測試帳號](#網站測試帳號)

## 功能

- **會員系統：** 使用者可用信箱或 Google 帳號進行註冊與登入。

- **商品瀏覽頁：** 首頁可以看到所有商品、根據類別或關鍵字進行搜尋，進入商品頁可看到該商品詳細介紹和商店資訊。

- **買家中心：** 買家可自行修改個人資料、查看歷史訂單以及對購買商品進行評價。

- **賣家中心：** 賣家可提交商店申請、管理商品和商店資訊，並查看已售商品及相關評價。

- **購物車系統：** 買家可隨時查看、刪除購物車中的商品; 可進行結帳，系統將自動清理已售出商品。

- **後台管理：** 僅限擁有管理員權限的帳號，可查看使用者和商店清單，並進行商品類別的管理。

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
MONGODB_URI_TEST=YOUR_MONGODB_URI_TEST
SESSION_SECRET=secret
IMGUR_CLIENT_ID=YOUR_IMGUR_CLIENT_ID
// 第三方登入設定(需至相關平台申請)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_CALLBACK=YOUR_GOOGLE_CLIENT_CALLBACK
// 綠界金流(需至相關平台申請)
MERCHANTID=YOUR_ECPAY_MERCHANTID
HASHKEY=YOUR_ECPAY_HASHKEY
HASHIV=YOUR_ECPAY_HASHIV
HOST=佈署平台網址
```
5. 設定資料庫 (或根據個人需求調整):
```
// config/config.json
"development": {
    "username": "",
    "password": "",
    "database": "pet-swap",
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
11. 測試專案:
```
npm run test
```

## 網站測試帳號
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
