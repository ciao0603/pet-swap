const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const path = require('path')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const port = process.env.PORT
const routes = require('./routes')
const passport = require('./config/passport')
const { getUser } = require('./helpers/auth-helper')
const hbsHelper = require('./helpers/hbs-helper')

// 確認資料庫連線狀態
require('./config/mongoose')
require('./models')

// 設定模板引擎
app.engine('hbs', exphbs({ extname: '.hbs', helpers: hbsHelper }))
app.set('view engine', 'hbs')

// 中間件
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.user = getUser(req)
  next()
})

// 套用路由
app.use(routes)

app.listen(port, () => {
  console.log(`App is running on localhost:${port}`)
})
