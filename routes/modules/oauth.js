const express = require('express')
const router = express.Router()

const passport = require('passport')

// google登入
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/products',
  failureRedirect: '/login'
}))

module.exports = router
