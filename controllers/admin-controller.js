const { User, Shop, Product } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const adminController = {
  getUsers: async (req, res, next) => {
    try {
      const USERS_LIMIT = 10
      const limit = Number(req.query.limit) || USERS_LIMIT
      const page = Number(req.query.page) || 1
      const offset = getOffset(limit, page)
      // 取得使用者資訊並分頁
      const users = await User.findAndCountAll({
        where: { isAdmin: false },
        limit,
        offset,
        raw: true
      })
      const userList = users.rows
      const total = users.count

      res.render('admin/users', { users: userList, pagination: getPagination(limit, offset, total) })
    } catch (err) {
      next(err)
    }
  },
  getShops: async (req, res, next) => {
    try {
      let shops = await Shop.findAll({ raw: true })

      // 取得每個商店的總商品數
      shops = await Promise.all(shops.map(async shop => {
        const productCount = await Product.count({ where: { shopId: shop.id } })

        return {
          ...shop,
          productCount
        }
      }))

      res.render('admin/shops', { shops })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = adminController
