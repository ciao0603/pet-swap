const { isAuthenticated, getUser } = require('../helpers/auth-helper')

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

module.exports = { userAuthenticated, adminAuthenticated }
