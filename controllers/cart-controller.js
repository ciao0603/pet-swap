const { Product, Cart } = require('../models')

const cartController = {
  getCart: async (req, res, next) => {
    try {
      const { userId } = req.params
      let totalPrice = 0
      // 取得購物車資料
      const carts = await Cart.findAll({ where: { userId }, raw: true })
      // 計算總價
      carts.forEach(item => {
        totalPrice += item.price
      })
      console.log(totalPrice)

      res.render('cart', { carts, totalPrice })
    } catch (err) {
      next(err)
    }
  },
  postCart: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { productId } = req.body
      const product = await Product.findByPk(productId)
      // 將商品加入使用者的購物車
      await Cart.create({
        productId,
        userId,
        productName: product.name,
        productImage: product.image,
        price: product.price
      })

      req.flash('success_msg', '已加入購物車!')
      res.redirect('back')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = cartController
