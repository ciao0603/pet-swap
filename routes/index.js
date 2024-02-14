const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')
const shopController = require('../controllers/shop-controller')
const productController = require('../controllers/product-controller')
const searchController = require('../controllers/search-controller')
const cartController = require('../controllers/cart-controller')
const orderController = require('../controllers/order-controller')
const passport = require('../config/passport')
const { errorHandler } = require('../middlewares/error-handler')
const { userAuthenticated } = require('../middlewares/auth')
const upload = require('../middlewares/multer')

// * 登入系統
// 註冊
router.route('/register')
  .get(userController.RegisterPage)
  .post(userController.Register)
// 登入
router.route('/login')
  .get(userController.loginPage)
  .post(passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userController.login)
// 登出
router.get('/logout', userController.logout)

// * 使用者基本功能
// 頁面渲染
router.get('/users/:userId/edit', userAuthenticated, userController.userEditPage)
// 購物車功能
// 刪除購物車中的特定商品
router.delete('/users/:userId/carts/:cartId', userAuthenticated, cartController.deleteCart)
router.route('/users/:userId/carts')
  .all(userAuthenticated)
  .get(cartController.getCart) // 取得特定使用者購物車
  .post(cartController.postCart) // 將商品添加至購物車
// 訂單
router.route('/users/:userId/orders')
  .all(userAuthenticated)
  .post(orderController.postOrder) // 結帳 > 創建訂單
// 使用者資料
router.route('/users/:userId')
  .all(userAuthenticated)
  .get(userController.getUser)
  .put(upload.single('image'), userController.putUser)

// * 商店功能
// 頁面渲染
router.get('/shops/create', userAuthenticated, shopController.shopCreatePage)
router.get('/shops/:shopId/edit', userAuthenticated, shopController.shopEditPage)
// 創建商店
router.post('/shops', userAuthenticated, upload.single('image'), shopController.postShop)
// 商店資料
router.route('/shops/:shopId')
  .all(userAuthenticated)
  .get(shopController.getShop)
  .put(upload.single('image'), shopController.putShop)

// * 商品功能
// 頁面渲染
router.get('/products/create', userAuthenticated, productController.productCreatePage)
router.get('/products/:productId/edit', userAuthenticated, productController.productEditPage)
// 搜尋商品
router.get('/products/search', userAuthenticated, searchController.searchProducts)
// 商品資料
router.route('/products/:productId')
  .all(userAuthenticated)
  .get(productController.getProduct)
  .put(upload.single('image'), productController.putProduct)
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
