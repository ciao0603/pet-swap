const cartService = require('../services/cart-service')

const cartController = {
  // 購物車頁面
  getCart: (req, res, next) => {
    cartService.getCart(req, (err, data) => err ? next(err) : res.render('cart', data))
  },
  // 將商品加入購物車
  postCart: (req, res, next) => {
    cartService.postCart(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '已加入購物車!')
      res.redirect('back')
    })
  },
  // 刪除購物車中的商品
  deleteCart: (req, res, next) => {
    cartService.deleteCart(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '商品已從購物車中移除!')
      res.redirect('back')
    })
  }
}

module.exports = cartController
