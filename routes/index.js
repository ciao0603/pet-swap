const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')
const { errorHandler } = require('../middlewares/error-handler')

// 註冊
router.route('/register')
  .get(userController.RegisterPage)
  .post(userController.Register)
// 登入
router.route('/login')
  .get(userController.loginPage)

router.use('/', errorHandler)

module.exports = router
