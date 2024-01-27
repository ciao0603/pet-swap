const express = require('express')
const router = express.Router()

router.use('/', (req, res) => {
  res.send('App opened successfully !')
})

module.exports = router
