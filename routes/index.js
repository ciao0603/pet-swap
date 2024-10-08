const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const oauth = require('./modules/oauth')
const Ecpay = require('./modules/Ecpay')
const userController = require('../controllers/user-controller')
const shopController = require('../controllers/shop-controller')
const productController = require('../controllers/product-controller')
const searchController = require('../controllers/search-controller')
const cartController = require('../controllers/cart-controller')
const orderController = require('../controllers/order-controller')
const commentController = require('../controllers/comment-controller')
const passport = require('../config/passport')
const { errorHandler } = require('../middlewares/error-handler')
const { userAuthenticated, adminAuthenticated, checkUserPermission } = require('../middlewares/auth')
const upload = require('../middlewares/multer')

// * 後臺管理
router.use('/admin', adminAuthenticated, admin)

// * 第三方登入
router.use('/oauth', oauth)
// * 第三方支付
router.use('/Ecpay', Ecpay)

// * 登入系統
// 註冊
router.route('/register')
  .get(userController.registerPage)
  .post(userController.register)
// 登入
router.route('/login')
  .get(userController.loginPage)
  .post(passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userController.login)
// 登出
router.get('/logout', userController.logout)

// * 使用者基本功能
// 頁面渲染
router.get('/users/:userId/edit', userAuthenticated, checkUserPermission, userController.userEditPage)
// 購物車功能
// 刪除購物車中的特定商品
router.delete('/users/:userId/carts/:cartId', userAuthenticated, checkUserPermission, cartController.deleteCart)
router.route('/users/:userId/carts')
  .all(userAuthenticated, checkUserPermission)
  .get(cartController.getCart) // 取得特定使用者購物車
  .post(cartController.postCart) // 將商品添加至購物車
// 訂單
router.route('/users/:userId/orders')
  .all(userAuthenticated, checkUserPermission)
  .get(orderController.getUserOrders) // 取得特定使用者的歷史訂單
  .post(orderController.postOrder) // 結帳 > 創建訂單
// 使用者資料
router.route('/users/:userId')
  .all(userAuthenticated, checkUserPermission)
  .get(userController.getUser)
  .put(upload.single('image'), userController.putUser)

// * 商店功能
// 頁面渲染
router.get('/shops/create', userAuthenticated, shopController.shopCreatePage)
router.get('/shops/:shopId/edit', userAuthenticated, checkUserPermission, shopController.shopEditPage)
// 創建商店
router.post('/shops', userAuthenticated, upload.single('image'), shopController.postShop)
// 取得特定商店的歷史訂單
router.get('/shops/:shopId/orders', userAuthenticated, checkUserPermission, orderController.getShopOrders)
// 商店資料
router.route('/shops/:shopId')
  .all(userAuthenticated, checkUserPermission)
  .get(shopController.getShop)
  .put(upload.single('image'), shopController.putShop)

// * 商品功能
// 頁面渲染
router.get('/products/create', userAuthenticated, productController.productCreatePage)
router.get('/products/:productId/edit', userAuthenticated, checkUserPermission, productController.productEditPage)
// 搜尋商品
router.get('/products/search', userAuthenticated, searchController.searchProducts)
// 發布商品評價
router.post('/products/:productId/comments', userAuthenticated, commentController.postComment)
// 商品資料
router.route('/products/:productId')
  .all(userAuthenticated)
  .get(productController.getProduct)
  .put(checkUserPermission, upload.single('image'), productController.putProduct)
  .delete(productController.deleteProduct)
// 首頁 & 新增商品
router.route('/products')
  .all(userAuthenticated)
  .get(productController.getProducts)
  .post(userAuthenticated, upload.single('image'), productController.postProduct)

router.use('/', (req, res) => {
  res.redirect('/products')
})
router.use('/', errorHandler)

module.exports = router
