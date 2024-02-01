const bcrypt = require('bcryptjs')

const { User } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helper')
// 使用者的默認頭像
const userDefaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

const userController = {
  // 渲染註冊畫面
  RegisterPage: (req, res, next) => {
    res.render('register')
  },
  // 註冊user
  Register: async (req, res, next) => {
    try {
      const { name, email, password, passwordCheck } = req.body

      // 確認填寫資料正確完整
      if (!(name && email && password)) throw new Error('尚有欄位未填寫!')
      if (password !== passwordCheck) throw new Error('密碼與確認密碼不符!')
      // 確認是否已經註冊過
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) throw new Error('該帳號已存在，請直接登入!')
      // 皆確認後即可新增 user
      const hash = await bcrypt.hash(password, 10)
      await User.create({ name, email, password: hash, image: userDefaultImage })

      res.redirect('/')
    } catch (err) {
      next(err)
    }
  },
  // 渲染登入頁面
  loginPage: (req, res, next) => {
    res.render('login')
  },
  // 驗證user資料後登入
  login: (req, res, next) => {
    req.flash('success_msg', '登入成功!')
    res.redirect('/products')
  },
  // 登出
  logout: (req, res, next) => {
    req.logout(err => {
      if (err) return next(err)
    })
    req.flash('success_msg', '登出成功!')
    res.redirect('/login')
  },
  // 個人資料頁面
  getUser: (req, res, next) => {
    res.render('user')
  },
  // 資料修改頁面
  userEditPage: (req, res, next) => {
    res.render('user-edit')
  },
  // 資料修改
  putUser: async (req, res, next) => {
    try {
      const originalData = req.user
      const userId = originalData.id
      const image = req.file || ''
      const { name, email, password, passwordCheck } = req.body || ''
      const newData = { image, name, email, password }
      // 錯誤排除
      if (password !== passwordCheck) throw new Error('密碼與確認密碼不符!')
      // 若 newData 不為空值且資料有改變，就更新原始資料
      for (const key in newData) {
        if (newData[key] !== '' && newData[key] !== originalData[key]) {
          // 如果改到email，要先查詢此帳號是否已經存在
          if (key === 'email') {
            if (await User.findOne({ where: { email } })) throw new Error('此信箱已註冊過，請換一個信箱!')
          }
          // 如果改到 password，要加密再儲存
          if (key === 'password') {
            newData.password = await bcrypt.hash(password, 10)
          }
          // 如果改到image，需要用imgur處理
          if (key === 'image') {
            newData.image = await imgurFileHandler(image)
          }
          originalData[key] = newData[key]
        }
      }
      // 更新資料庫
      const user = await User.findByPk(userId)
      await user.update(originalData)
      // 返回個人頁面
      req.flash('success_msg', '修改成功!')
      res.redirect(`/users/${userId}`)
    } catch (err) {
      next(err)
    }
  }
}
module.exports = userController
