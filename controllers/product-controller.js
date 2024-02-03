const { Product, Category, SubCategory, ProductCategory } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helper')

const productController = {
  productCreatePage: async (req, res, next) => {
    try {
      const categories = await Category.findAll({
        raw: true
      })
      // 將取出的資料整理成方便渲染的格式
      const data = await Promise.all(categories.map(async category => {
        // 取出每個大類中的子類別
        const subCategories = await SubCategory.findAll({ where: { categoryId: category.id }, raw: true })
        return {
          name: category.name,
          subCategories: subCategories.map(subCategory => ({ id: subCategory.id, name: subCategory.name }))
        }
      }))

      res.render('product-create', { categories: data })
    } catch (err) {
      next(err)
    }
  },
  postProduct: async (req, res, next) => {
    try {
      const { shopId } = req.user
      const { name, status, price, description, categoryId } = req.body
      let image = req.file

      if (!(name && image && status && price && description)) throw new Error('尚有欄位未填!')
      image = await imgurFileHandler(image)
      // 新增商品
      const product = await Product.create({
        name, image, status, description, price, shopId
      })
      // 紀錄商品分類
      const categoryIdArray = Array.isArray(categoryId) ? categoryId : [categoryId]
      categoryIdArray.forEach(async cid => {
        await ProductCategory.create({
          productId: product.id,
          subCategoryId: cid
        })
      })

      req.flash('success_msg', '商品新增成功!')
      res.redirect(`/shops/${shopId}`)
    } catch (err) {
      next(err)
    }
  },
  getProduct: (req, res, next) => {

  }
}

module.exports = productController
