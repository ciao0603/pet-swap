const { isAuthenticated } = require('../helpers/auth-helper')

const userAuthenticated = (req, res, next) => {
  // req帳號驗證通過就往下一個路由
  if (isAuthenticated(req)) return next()
  // 未通過倒回登入頁面
  req.flash('error_msg', '請先登入才可使用!')
  res.redirect('/login')
}

module.exports = { userAuthenticated }
