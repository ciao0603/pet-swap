const { Shop, Product, Category, SubCategory, ProductCategory, Cart } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helper')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

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
  productEditPage: async (req, res, next) => {
    try {
      // 取得商品資料
      const { productId } = req.params
      const product = await Product.findByPk(productId, { raw: true })
      // 整理要渲染的category資料格式
      const categories = await Category.findAll({
        raw: true
      })
      const data = await Promise.all(categories.map(async category => {
        const subCategories = await SubCategory.findAll({ where: { categoryId: category.id }, raw: true })
        return {
          name: category.name,
          subCategories: subCategories.map(subCategory => ({ id: subCategory.id, name: subCategory.name }))
        }
      }))
      // 確認商品的類別
      let checkedCategories = await ProductCategory.findAll({ where: { productId }, raw: true })
      checkedCategories = checkedCategories.map(category => { return category.subCategoryId })

      res.render('product-edit', { product, categories: data, checkedCategories })
    } catch (err) {
      next(err)
    }
  },
  getProducts: async (req, res, next) => {
    try {
      const PRODUCTS_LIMIT = 12
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || PRODUCTS_LIMIT
      const offset = getOffset(limit, page)

      // * 取得商品分類
      let categories = await Category.findAll({
        raw: true
      })
      categories = await Promise.all(categories.map(async category => {
        const subCategories = await SubCategory.findAll({ where: { categoryId: category.id }, raw: true })
        return {
          name: category.name,
          subCategories: subCategories.map(subCategory => ({ id: subCategory.id, name: subCategory.name }))
        }
      }))
      // * 取得所有未售出商品資料
      const products = await Product.findAndCountAll({
        where: { buyerUserId: null },
        limit,
        offset,
        raw: true
      })
      // 製作分頁器
      let productList = products.rows
      const total = products.count
      // 修改資料格式
      productList = productList.map(p => ({
        ...p,
        description: p.description.substring(0, 15) + '...'
      }))

      res.render('index', { categories, products: productList, pagination: getPagination(limit, page, total) })
    } catch (err) {
      next(err)
    }
  },
  getProduct: async (req, res, next) => {
    try {
      const { productId } = req.params
      // 取得商品
      const product = await Product.findByPk(productId, { raw: true })
      // 取得商店
      const shop = await Shop.findByPk(product.shopId, { raw: true })
      res.render('product', { product, shop })
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
  putProduct: async (req, res, next) => {
    try {
      console.log('start')
      const { productId } = req.params
      const { name, status, price, description, categoryId } = req.body
      // 更新商品資料
      const product = await Product.findByPk(productId)
      const image = req.file ? await imgurFileHandler(req.file) : product.image
      await product.update({ name, image, status, price, description })
      // 刪除原本的商品分類後重新新增
      await ProductCategory.destroy({ where: { productId } })
      const categoryIdArray = Array.isArray(categoryId) ? categoryId : [categoryId]
      categoryIdArray.forEach(async cid => {
        await ProductCategory.create({
          productId: product.id,
          subCategoryId: cid
        })
      })

      req.flash('success_msg', '商品修改成功!')
      res.redirect(`/shops/${product.shopId}`)
    } catch (err) {
      next(err)
    }
  },
  deleteProduct: async (req, res, next) => {
    try {
      const { productId } = req.params

      const product = await Product.findByPk(productId)
      // 已售出的商品不可刪除
      if (product.buyerUserId) throw new Error('商品已售出!')
      // 需一併刪除購物車和商品分類表中的相關紀錄
      await Cart.destroy({ where: { productId } })
      await ProductCategory.destroy({ where: { productId } })
      await Product.destroy({ where: { id: productId } })
      req.flash('success_msg', '商品已刪除!')
      res.redirect(`/shops/${product.shopId}`)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = productController
