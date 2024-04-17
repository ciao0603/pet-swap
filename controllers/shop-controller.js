const shopService = require('../services/shop-service')

const shopController = {
  // 渲染創建商店的頁面
  shopCreatePage: (req, res, next) => {
    res.render('shop-create')
  },
  // 渲染編輯商店的頁面
  shopEditPage: (req, res, next) => {
    shopService.shopEditPage(req, (err, data) => err ? next(err) : res.render('shop-edit', data))
  },
  // 創建商店
  postShop: (req, res, next) => {
    shopService.postShop(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '商店建立成功!')
      res.redirect(`/shops/${data.shop.id}`)
    })
  },
  // 商店資訊頁面
  getShop: (req, res, next) => {
    shopService.getShop(req, (err, data) => err ? next(err) : res.render('shop', data))
  },
  // 編輯商店
  putShop: (req, res, next) => {
    shopService.putShop(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '商店修改成功!')
      res.redirect(`/shops/${data.shopId}`)
    })
  }
}

module.exports = shopController
