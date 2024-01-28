const bcrypt = require('bcryptjs')

const { User } = require('../models')
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
  }
}
module.exports = userController
