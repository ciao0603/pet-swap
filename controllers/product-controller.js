const productService = require('../services/product-service')

const productController = {
  // 渲染創建商品的頁面
  productCreatePage: (req, res, next) => {
    productService.productCreatePage(req, (err, data) => err ? next(err) : res.render('product-create', data))
  },
  // 渲染編輯商品的頁面
  productEditPage: (req, res, next) => {
    productService.productEditPage(req, (err, data) => err ? next(err) : res.render('product-edit', data))
  },
  // 首頁
  getProducts: (req, res, next) => {
    productService.getProducts(req, (err, data) => err ? next(err) : res.render('index', data))
  },
  // 商品資訊頁面
  getProduct: (req, res, next) => {
    productService.getProduct(req, (err, data) => err ? next(err) : res.render('product', data))
  },
  // 創建商品
  postProduct: (req, res, next) => {
    productService.postProduct(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '商品新增成功!')
      res.redirect(`/shops/${data.shopId}`)
    })
  },
  // 編輯商品
  putProduct: (req, res, next) => {
    productService.putProduct(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '商品修改成功!')
      res.redirect(`/shops/${data.shopId}`)
    })
  },
  // 刪除商品
  deleteProduct: (req, res, next) => {
    productService.deleteProduct(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '商品已刪除!')
      res.redirect(`/shops/${data.shopId}`)
    })
  }
}

module.exports = productController
