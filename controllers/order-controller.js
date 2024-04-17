const orderService = require('../services/order-service')

const orderController = {
  // 結帳 > 創建訂單
  postOrder: (req, res, next) => {
    orderService.postOrder(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '下單成功!')
      res.redirect('/products')
    })
  },
  // 取得特定使用者的歷史訂單
  getUserOrders: (req, res, next) => {
    orderService.getUserOrders(req, (err, data) => err ? next(err) : res.render('user-order', data))
  },
  // 取得特定商店的歷史訂單
  getShopOrders: (req, res, next) => {
    orderService.getShopOrders(req, (err, data) => err ? next(err) : res.render('shop-order', data))
  }
}

module.exports = orderController
