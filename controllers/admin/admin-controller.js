const { User, Shop, Product } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

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
      const SHOPS_LIMIT = 10
      const limit = Number(req.query.limit) || SHOPS_LIMIT
      const page = Number(req.query.page) || 1
      const offset = getOffset(limit, page)
      // 取得商店資訊並分頁
      const shops = await Shop.findAndCountAll({ limit, offset, raw: true })
      let shopList = shops.rows
      const total = shops.count

      // 取得每個商店的總商品數
      shopList = await Promise.all(shopList.map(async shop => {
        const productCount = await Product.count({ where: { shopId: shop.id } })

        return {
          ...shop,
          productCount
        }
      }))

      res.render('admin/shops', { shops: shopList, pagination: getPagination(limit, offset, total) })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = adminController
