const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const port = process.env.PORT
const routes = require('./routes')

// 確認資料庫連線狀態
require('./config/mongoose')
require('./models')

// 設定模板引擎
app.engine('hbs', exphbs({ extname: '.hbs' }))
app.set('view engine', 'hbs')

// 中間件
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// 套用路由
app.use(routes)

app.listen(port, () => {
  console.log(`App is running on localhost:${port}`)
})
