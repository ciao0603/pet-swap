const { User, Shop, Product } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helper')

const shopController = {
  shopCreatePage: (req, res, next) => {
    res.render('shop-create')
  },
  shopEditPage: async (req, res, next) => {
    try {
      const { shopId } = req.params
      const shop = await Shop.findByPk(shopId, { raw: true })
      res.render('shop-edit', { shop })
    } catch (err) {
      next(err)
    }
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
  },
  getShop: async (req, res, next) => {
    try {
      const { shopId } = req.params
      // 取得商店資料
      const shop = await Shop.findByPk(shopId, { raw: true })
      // 取得該商店尚未售出的商品資料
      const productList = await Product.findAll({
        where: { shopId, buyerUserId: null },
        raw: true
      })
      const data = productList.map(p => ({
        ...p,
        description: p.description.substring(0, 15) + '...'
      }))

      res.render('shop', { shop, products: data })
    } catch (err) {
      next(err)
    }
  },
  putShop: async (req, res, next) => {
    try {
      const { shopId } = req.params
      const { name, introduction } = req.body

      const shop = await Shop.findByPk(shopId)
      // 若有上傳新的圖片就交給imgFileHandler處理，否則就使用shop原本的圖片
      const image = req.file ? await imgurFileHandler(req.file) : shop.image
      // 更新資料
      await shop.update({ name, introduction, image })

      req.flash('success_msg', '商店修改成功!')
      res.redirect(`/shops/${shopId}`)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = shopController
