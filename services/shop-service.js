const { User, Shop, Product } = require('../models')
const fileHelper = require('../helpers/file-helper')

const shopService = {
  // 渲染編輯商店的頁面
  shopEditPage: async (req, cb) => {
    try {
      const { shopId } = req.params
      const shop = await Shop.findByPk(shopId, { raw: true })

      cb(null, { shop })
    } catch (err) {
      cb(err)
    }
  },
  // 創建商店
  postShop: async (req, cb) => {
    try {
      const userId = req.user.id
      const { name, introduction } = req.body
      let image = req.file

      if (!(name && introduction && image)) throw new Error('所有欄位及頭像皆為必填!')

      image = await fileHelper.imgurFileHandler(image)

      // 確認資料後建立商店
      const shop = await Shop.create({
        name, introduction, image
      })
      // 將新商店的 id 紀錄至對應的 user
      const user = await User.findByPk(userId)
      await user.update({ shopId: shop.id })

      cb(null, { shop })
    } catch (err) {
      cb(err)
    }
  },
  // 商店資訊頁面
  getShop: async (req, cb) => {
    try {
      const { shopId } = req.params

      // 取得商店資料
      const shop = await Shop.findByPk(shopId, { raw: true })
      // 取得該商店尚未售出的商品資料
      const productList = await Product.findAll({
        where: { shopId, buyerUserId: null },
        raw: true
      })
      const productData = productList.map(p => ({
        ...p,
        description: p.description.substring(0, 15) + '...'
      }))

      cb(null, { shop, products: productData })
    } catch (err) {
      cb(err)
    }
  },
  // 編輯商店
  putShop: async (req, cb) => {
    try {
      const { shopId } = req.params
      const { name, introduction } = req.body

      const shop = await Shop.findByPk(shopId)
      // 若有上傳新的圖片就交給imgFileHandler處理，否則就使用shop原本的圖片
      const image = req.file ? await fileHelper.imgurFileHandler(req.file) : shop.image
      // 更新資料
      await shop.update({ name, introduction, image })

      cb(null, { shopId })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = shopService
