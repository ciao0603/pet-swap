const { Product, Cart } = require('../models')

const cartService = {
  // 購物車頁面
  getCart: async (req, cb) => {
    try {
      const { userId } = req.params
      let totalPrice = 0

      // 取得購物車資料
      const carts = await Cart.findAll({ where: { userId }, raw: true })
      // 計算總價
      carts.forEach(item => {
        totalPrice += item.price
      })

      cb(null, { carts, totalPrice })
    } catch (err) {
      cb(err)
    }
  },
  // 將商品加入購物車
  postCart: async (req, cb) => {
    try {
      const userId = req.user.id
      const { productId } = req.body

      // 先確認購物車中是否已存在該商品
      const existedCart = await Cart.findOne({ where: { userId, productId } })
      if (existedCart) throw new Error('此商品已存在您的購物車中!')

      const product = await Product.findByPk(productId)
      // 將商品加入使用者的購物車
      await Cart.create({
        productId,
        userId,
        productName: product.name,
        productImage: product.image,
        price: product.price
      })

      cb(null)
    } catch (err) {
      cb(err)
    }
  },
  // 刪除購物車中的商品
  deleteCart: async (req, cb) => {
    try {
      const { userId, cartId } = req.params

      // 刪除購物車中的紀錄(需確認為該使用者的紀錄才可刪除)
      const deletedCart = await Cart.destroy({ where: { id: cartId, userId } })
      if (!deletedCart) throw new Error('刪除失敗!')

      cb(null)
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = cartService
