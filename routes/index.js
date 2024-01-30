const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')
const passport = require('../config/passport')
const { errorHandler } = require('../middlewares/error-handler')

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

router.get('/products', (req, res) => {
  res.render('index')
})
router.get('/', (req, res) => {
  res.redirect('/products')
})

router.use('/', errorHandler)

module.exports = router
