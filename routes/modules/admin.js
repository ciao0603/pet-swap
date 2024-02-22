const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

router.get('/users', adminController.getUsers)
router.get('/shops', adminController.getShops)

router.use('/', (req, res) => {
  res.redirect('/admin/users')
})

module.exports = router
