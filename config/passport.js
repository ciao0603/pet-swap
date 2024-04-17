const passport = require('passport')
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20')
const FacebookStrategy = require('passport-facebook')
const bcrypt = require('bcryptjs')

const { User } = require('../models')

// * 本地登入
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

// * google登入
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CLIENT_CALLBACK,
  profileFields: ['email', 'displayName'],
  passReqToCallback: true
}, async (accessToken, refreshToken, req, profile, cb) => {
  try {
    const { name, email, picture } = profile._json
    const user = await User.findOne({ where: { email } })
    // 已註冊過就直接登入
    if (user) return cb(null, user)
    // 未註冊則產生隨機密碼後 create
    const randomPassword = Math.random().toString(36).slice(-8)
    const hash = await bcrypt.hash(randomPassword, 10)
    const newUser = await User.create({ name, email, password: hash, image: picture })

    return cb(null, newUser)
  } catch (err) {
    cb(err, false)
  }
}))

// * facebook登入
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_APP_CALLBACK,
  profileFields: ['email', 'displayName', 'photos']
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const { name, email, picture } = profile._json
    const image = picture.data.url
    const user = await User.findOne({ where: { email } })
    // 已註冊過就直接登入
    if (user) return cb(null, user)
    // 未註冊則產生隨機密碼後 create
    const randomPassword = Math.random().toString(36).slice(-8)
    const hash = await bcrypt.hash(randomPassword, 10)
    const newUser = await User.create({ name, email, password: hash, image })

    return cb(null, newUser)
  } catch (err) {
    cb(err, false)
  }
}))

// * 序列化與反序列化
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser(async (id, cb) => {
  let user = await User.findByPk(id)
  user = user.toJSON()
  if (user) return cb(null, user)
})

module.exports = passport
