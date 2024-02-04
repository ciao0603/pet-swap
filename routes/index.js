const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')
const shopController = require('../controllers/shop-controller')
const productController = require('../controllers/product-controller')
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
// 使用者資料
router.route('/users/:userId')
  .all(userAuthenticated)
  .get(userController.getUser)
  .put(upload.single('image'), userController.putUser)
// 首頁
router.get('/products', userAuthenticated, (req, res) => {
  res.render('index')
})

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
// 新增商品
router.post('/products', userAuthenticated, upload.single('image'), productController.postProduct)
// 商品資料
router.route('/products/:productId')
  .all(userAuthenticated)
  .put(upload.single('image'), productController.putProduct)
  .delete(productController.deleteProduct)

router.use('/', (req, res) => {
  res.redirect('/products')
})
router.use('/', errorHandler)

module.exports = router
