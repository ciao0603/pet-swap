const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')

router.get('/register', userController.RegisterPage)
router.post('/register', userController.Register)

module.exports = router
