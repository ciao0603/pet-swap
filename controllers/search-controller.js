const { Product, ProductCategory } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const searchController = {
  searchProducts: async (req, res, next) => {
    try {
      const { subCategoryId, KEYWORD } = req.query
      const PRODUCTS_LIMIT = 12
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || PRODUCTS_LIMIT
      const offset = getOffset(limit, page)
      let productList = []
      // * 根據分類尋找商品
      if (subCategoryId) {
        let data = await ProductCategory.findAll({
          where: { subCategoryId },
          include: Product,
          nest: true,
          raw: true
        })
        // 找出尚未售出的商品
        data = data.filter(p => p.Product.buyerUserId === null)
        // 整理資料
        data = data.map(d => d.Product)
        productList = data
      }
      // * 根據關鍵字尋找商品
      if (KEYWORD && KEYWORD.length !== 0) {
        const keyword = KEYWORD.toLowerCase()
        // 取得未售出的商品
        let data = await Product.findAll({ where: { buyerUserId: null }, raw: true })
        // 篩選出包含關鍵字的資料
        data = data.filter(d => d.name.toLowerCase().includes(keyword) || d.description.toLowerCase().includes(keyword))
        productList = data
      } else if (KEYWORD) {
        res.redirect('back')
      }
      // * 製作分頁器
      const total = productList.length
      // 切割資料
      productList = productList.slice(offset, offset + limit)
      // 修改資料格式
      productList = productList.map(p => ({
        ...p,
        description: p.description.substring(0, 15) + '...'
      }))

      res.render('index', { products: productList, pagination: getPagination(limit, page, total) })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = searchController
