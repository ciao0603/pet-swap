const dayjs = require('dayjs')
const { Op } = require('sequelize')

const { Product, Order, OrderItem, Cart } = require('../models')
const Comment = require('../models/comment')

const orderService = {
  // 結帳 > 創建訂單
  postOrder: async (req, cb) => {
    try {
      const { userId } = req.params
      const { receiverName, receiverPhone, receiverAddress, productId, totalPrice } = req.body

      if (!(receiverName && receiverPhone && receiverAddress)) throw new Error('請填寫完整寄送資訊!')

      // 建立訂單
      const productIdArray = Array.isArray(productId) ? productId : [productId]
      const order = await Order.create({ userId, receiverName, receiverPhone, receiverAddress, totalPrice, status: 'unpaid', productIds: productIdArray })
      // 刪除 user 購物車紀錄
      await Promise.all(productIdArray.map(async pid => {
        await Cart.destroy({ where: { productId: pid, userId } })
      }))

      cb(null, { orderId: order.id })
    } catch (err) {
      cb(err)
    }
  },
  updateOrderStatus: async (orderId, status, next) => {
    try {
      console.log(`開始更新status，orderId:${orderId}, status: ${status}`)
      const order = await Order.findByPk(orderId)
      const orderValue = order.dataValues
      console.log('更新前order:', orderValue)
      const { productIds } = orderValue
      console.log('productIds:', productIds)
      // 紀錄訂單詳情
      await Promise.all(productIds.map(async pid => {
        await OrderItem.create({ orderId: orderValue.id, productId: pid })
        // 將商品紀錄為已售出
        const product = await Product.findByPk(pid)
        await product.update({ buyerUserId: orderValue.userId })
        // 刪除相關購物車紀錄
        await Cart.destroy({ where: { productId: pid } })
      }))
      // 更新付款狀態
      await order.update({ status })
      console.log('更新後order:', order.dataValues)
    } catch (err) {
      next(err)
    }
  },
  // 取得特定使用者的歷史訂單
  getUserOrders: async (req, cb) => {
    try {
      const { userId } = req.params

      // 取得屬於該使用者的所有訂單
      const orders = await Order.findAll({ where: { userId }, raw: true })
      // 整理資料
      const ordersData = await Promise.all(orders.map(async order => {
        // 取得每筆訂單的商品詳情
        let items = await OrderItem.findAll({
          where: { orderId: order.id },
          include: Product,
          nest: true,
          raw: true
        })
        items = await Promise.all(items.map(async i => {
          // 若是商品已被評價，需加入該筆評價資料
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

      cb(null, { orders: ordersData })
    } catch (err) {
      cb(err)
    }
  },
  // 取得特定商店的歷史訂單
  getShopOrders: async (req, cb) => {
    try {
      const { shopId } = req.params

      // 取得該商店已售出的商品
      const productList = await Product.findAll({ where: { shopId, buyerUserId: { [Op.not]: null } }, raw: true })
      // 整理資料
      const productsData = await Promise.all(productList.map(async p => {
        // 加上每個商品的寄送資訊
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

      cb(null, { products: productsData })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = orderService
