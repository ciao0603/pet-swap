const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')

const { User } = require('../models')

// 本地登入
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, email, password, cb) => {
    try {
      // 確認user存在
      const user = await User.findOne({ where: { email } })
      if (!user) return cb(null, false, req.flash('error_msg', '帳號或密碼輸入錯誤!'))
      // 確認密碼正確
      const correctPassword = await bcrypt.compare(password, user.password)
      if (!correctPassword) return cb(null, false, req.flash('error_msg', '帳號或密碼輸入錯誤!'))
      // 確認無誤
      cb(null, user)
    } catch (err) {
      cb(err, false)
    }
  }))

// 序列化與反序列化
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser(async (id, cb) => {
  let user = await User.findByPk(id)
  user = user.toJSON()
  if (user) return cb(null, user)
})

module.exports = passport
