const { Product, Order, OrderItem, Cart } = require('../models')

const orderController = {
  // 結帳 > 創建訂單
  postOrder: async (req, res, next) => {
    try {
      const { userId } = req.params
      const { receiverName, receiverPhone, receiverAddress, productId, totalPrice } = req.body
      if (!(receiverName && receiverPhone && receiverAddress)) throw new Error('請填寫完整寄送資訊!')
      // 建立訂單
      const order = await Order.create({ userId, receiverName, receiverPhone, receiverAddress, totalPrice })
      // 紀錄訂單詳情
      const productIdArray = Array.isArray(productId) ? productId : [productId]
      productIdArray.forEach(async pid => {
        await OrderItem.create({
          orderId: order.id,
          productId: pid
        })
        // 將商品紀錄為已售出
        const product = await Product.findByPk(pid)
        await product.update({ buyerUserId: userId })
        // 刪除購物車紀錄
        await Cart.destroy({ where: { productId: pid } })
      })

      req.flash('success_msg', '下單成功!')
      res.redirect('/products')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = orderController
