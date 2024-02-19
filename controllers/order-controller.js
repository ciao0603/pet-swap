const dayjs = require('dayjs')
const { Op } = require('sequelize')

const { Product, Order, OrderItem, Cart } = require('../models')
const Comment = require('../models/comment')

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
  },
  // 取得特定使用者的歷史訂單
  getUserOrders: async (req, res, next) => {
    try {
      const { userId } = req.params
      // 取得屬於該此用者的所有訂單
      const orders = await Order.findAll({ where: { userId }, raw: true })
      // 整理資料
      const data = await Promise.all(orders.map(async order => {
        // 取得每筆訂單的商品詳情
        let items = await OrderItem.findAll({
          where: { orderId: order.id },
          include: Product,
          nest: true,
          raw: true
        })
        // 若是商品已被評價，需加入該筆評價資料
        items = await Promise.all(items.map(async i => {
          if (i.Product.isCommented) {
            const comment = await Comment.findOne({ productId: i.productId }).lean()
            return {
              ...i.Product,
              userComment: comment
            }
          } else {
            return i.Product
          }
        }))
        return {
          ...order,
          createdAt: dayjs(order.createdAt).format('YYYY-MM-DD'),
          items
        }
      }))

      res.render('user-order', { orders: data })
    } catch (err) {
      next(err)
    }
  },
  // 取得特定商店的歷史訂單
  getShopOrders: async (req, res, next) => {
    try {
      const { shopId } = req.params
      // 取得該商店已售出的商品
      const productList = await Product.findAll({ where: { shopId, buyerUserId: { [Op.not]: null } }, raw: true })
      // 加上每個商品的寄送資訊
      const data = await Promise.all(productList.map(async p => {
        const orderInfo = await OrderItem.findOne({
          where: { productId: p.id },
          include: Order,
          nest: true,
          raw: true
        })
        // 取得該商品評價
        let comment = null
        if (p.isCommented) {
          comment = await Comment.findOne({ productId: p.id }).lean()
        }
        return {
          ...p,
          receiverName: orderInfo.Order.receiverName,
          receiverPhone: orderInfo.Order.receiverPhone,
          receiverAddress: orderInfo.Order.receiverAddress,
          userComment: comment
        }
      }))

      res.render('shop-order', { products: data })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = orderController
