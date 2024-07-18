const express = require('express')
const router = express.Router()
const EcpayController = require('../../controllers/Ecpay/Ecpay-controller')

router.get('/pay/:orderId', EcpayController.payOrder)

router.post('/return', EcpayController.paymentReturn)

module.exports = router
