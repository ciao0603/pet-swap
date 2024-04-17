const userService = require('../services/user-service')

const userController = {
  // 渲染註冊畫面
  registerPage: (req, res, next) => {
    res.render('register')
  },
  // 註冊user
  register: (req, res, next) => {
    userService.register(req, (err, data) => err ? next(err) : res.redirect('/'))
  },
  // 渲染登入頁面
  loginPage: (req, res, next) => {
    res.render('login')
  },
  // 驗證user資料後登入
  login: (req, res, next) => {
    req.flash('success_msg', '登入成功!')
    res.redirect('/products')
  },
  // 登出
  logout: (req, res, next) => {
    req.logout(err => {
      if (err) return next(err)
    })
    req.flash('success_msg', '登出成功!')
    res.redirect('/login')
  },
  // 個人資料頁面
  getUser: (req, res, next) => {
    userService.getUser(req, (err, data) => err ? next(err) : res.render('user', data))
  },
  // 資料修改頁面
  userEditPage: (req, res, next) => {
    res.render('user-edit')
  },
  // 資料修改
  putUser: (req, res, next) => {
    userService.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '修改成功!')
      res.redirect(`/users/${data.userId}`)
    })
  }
}
module.exports = userController
