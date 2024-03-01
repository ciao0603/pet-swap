const { Product, ProductCategory, sequelize } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { Op } = require('sequelize')

const searchController = {
  searchProducts: async (req, res, next) => {
    try {
      const { subCategoryId, KEYWORD } = req.query
      const PRODUCTS_LIMIT = 12
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || PRODUCTS_LIMIT
      const offset = getOffset(limit, page)
      // 設定搜尋的條件(初始條件: 尚未售出)
      const whereCondition = { buyerUserId: null }

      if (!(subCategoryId || KEYWORD)) {
        res.redirect('/products')
      }

      // * 根據分類設定條件
      if (subCategoryId) {
        // 取得所有屬於該類別的商品id
        const productCategories = await ProductCategory.findAll({ where: { subCategoryId } })
        const productIds = productCategories.map(pc => pc.productId)
        // 加入搜尋條件: id = [productIds]
        whereCondition.id = { [Op.in]: productIds }
      }

      // * 根據關鍵字設定條件
      if (KEYWORD && KEYWORD.length > 0) {
        const keyword = KEYWORD.toLowerCase()
        // 加入搜尋條件: 欄位'name'或'description'包含keyword
        whereCondition[Op.or] = [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', `%${keyword}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), 'LIKE', `%${keyword}%`)
        ]
      }

      // * 利用搜尋條件尋找商品並分頁
      const products = await Product.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        raw: true
      })
      const productList = products.rows
      const total = products.count
      // 修改資料格式
      const formattedProducts = productList.map(p => ({
        ...p,
        description: p.description.substring(0, 15) + '...'
      }))

      res.render('index', { products: formattedProducts, pagination: getPagination(limit, page, total) })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = searchController
