const { User, Shop } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helper')

const shopController = {
  shopCreatePage: (req, res, next) => {
    res.render('shop-create')
  },
  postShop: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { name, introduction } = req.body
      let image = req.file

      if (!(name && introduction && image)) throw new Error('所有欄位及頭像皆為必填!')
      image = await imgurFileHandler(image)
      // 確認資料後建立商店
      const shop = await Shop.create({
        name, introduction, image
      })
      // 將新商店的 id 紀錄至對應的 user
      const user = await User.findByPk(userId)
      await user.update({ shopId: shop.id })

      req.flash('success_msg', '商店建立成功!')
      res.redirect(`/shops/${shop.id}`)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = shopController
