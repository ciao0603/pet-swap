const bcrypt = require('bcryptjs')

// 使用者的默認頭像
const userDefaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
const { User, Product } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helper')

const userService = {
  // 註冊user
  register: async (req, cb) => {
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

      cb(null)
    } catch (err) {
      cb(err)
    }
  },
  // 個人資料頁面
  getUser: async (req, cb) => {
    try {
      const { userId } = req.params

      // 找出user已購買但尚未評價的商品
      const purchasedProducts = await Product.findAll({
        where: { buyerUserId: userId, isCommented: false },
        raw: true
      })

      cb(null, { products: purchasedProducts })
    } catch (err) {
      cb(err)
    }
  },
  // 資料修改
  putUser: async (req, cb) => {
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

      cb(null, { userId })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = userService
