const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')
const { errorHandler } = require('../middlewares/error-handler')

router.get('/register', userController.RegisterPage)
router.post('/register', userController.Register)

router.use('/', errorHandler)

module.exports = router
