const { User, Shop, Product } = require('../models')

const adminController = {
  getUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({ where: { isAdmin: false }, raw: true })

      res.render('admin/users', { users })
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
