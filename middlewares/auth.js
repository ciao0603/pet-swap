const { isAuthenticated, getUser } = require('../helpers/auth-helper')
const { Product } = require('../models')

// 普通帳號驗證
const userAuthenticated = (req, res, next) => {
  // req帳號驗證通過就往下一個路由
  if (isAuthenticated(req)) return next()
  // 未通過倒回登入頁面
  req.flash('error_msg', '請先登入才可使用!')
  res.redirect('/login')
}

// 管理員帳號驗證
const adminAuthenticated = (req, res, next) => {
  if (isAuthenticated(req)) {
    // 驗證通過且為管理員
    if (getUser(req).isAdmin) return next()
    // 未通過倒回首頁
    req.flash('error_msg', '此帳號無訪問權限!')
    res.redirect('/')
  } else {
    req.flash('error_msg', '請先登入才可使用!')
    res.redirect('/login')
  }
}

// 檢查是否有使用該路由的權限，以免使用者更動到別人的資料
const checkUserPermission = async (req, res, next) => {
  try {
    // '/users/*'，使用者相關路由
    if (req.params.userId && Number(req.params.userId) !== req.user.id) {
      req.flash('error_msg', '此帳號無訪問該路由的權限!')
      res.redirect('back')
    }
    // '/shops/*'，商店相關路由
    if (req.params.shopId && Number(req.params.shopId) !== req.user.shopId) {
      req.flash('error_msg', '此帳號無訪問該路由的權限!')
      res.redirect('back')
    }

    // '/products/*'，商品相關路由
    if (req.params.productId) {
      const { productId } = req.params
      const product = await Product.findByPk(productId)
      if (product.shopId !== req.user.shopId) {
        req.flash('error_msg', '此帳號無訪問該路由的權限!')
        res.redirect('back')
      }
    }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { userAuthenticated, adminAuthenticated, checkUserPermission }
