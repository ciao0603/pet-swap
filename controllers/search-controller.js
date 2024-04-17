const searchService = require('../services/search-service')

const searchController = {
  // 根據類別或關鍵字搜尋商品
  searchProducts: (req, res, next) => {
    // 先確認是否有搜尋的必要
    const { subCategoryId, KEYWORD } = req.query
    if (!(subCategoryId || KEYWORD)) {
      res.redirect('/products')
    }
    searchService.searchProducts(req, (err, data) => err ? next(err) : res.render('index', data))
  }
}

module.exports = searchController
