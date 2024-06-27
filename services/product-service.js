const { Shop, Product, Category, SubCategory, ProductCategory, Cart } = require('../models')
const fileHelper = require('../helpers/file-helper')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const productService = {
  // 渲染創建商品的頁面
  productCreatePage: async (req, cb) => {
    try {
      const categories = await Category.findAll({
        raw: true
      })
      // 將取出的商品類別整理成方便渲染的格式
      const categoriesData = await Promise.all(categories.map(async category => {
        // 取出每個大類中的子類別
        const subCategories = await SubCategory.findAll({ where: { categoryId: category.id }, raw: true })
        return {
          name: category.name,
          subCategories: subCategories.map(subCategory => ({ id: subCategory.id, name: subCategory.name }))
        }
      }))

      cb(null, { categories: categoriesData })
    } catch (err) {
      cb(err)
    }
  },
  // 渲染編輯商品的頁面
  productEditPage: async (req, cb) => {
    try {
      // 取得商品資料
      const { productId } = req.params
      const product = await Product.findByPk(productId, { raw: true })
      // 整理要渲染的category資料格式
      const categories = await Category.findAll({
        raw: true
      })
      const categoriesData = await Promise.all(categories.map(async category => {
        const subCategories = await SubCategory.findAll({ where: { categoryId: category.id }, raw: true })
        return {
          name: category.name,
          subCategories: subCategories.map(subCategory => ({ id: subCategory.id, name: subCategory.name }))
        }
      }))
      // 確認商品的類別
      let checkedCategories = await ProductCategory.findAll({ where: { productId }, raw: true })
      checkedCategories = checkedCategories.map(category => { return category.subCategoryId })

      cb(null, { product, categories: categoriesData, checkedCategories })
    } catch (err) {
      cb(err)
    }
  },
  // 首頁
  getProducts: async (req, cb) => {
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

      cb(null, { categories, products: productList, pagination: getPagination(limit, page, total) })
    } catch (err) {
      cb(err)
    }
  },
  // 商品資訊頁面
  getProduct: async (req, cb) => {
    try {
      const { productId } = req.params

      // 取得商品
      const product = await Product.findByPk(productId, { raw: true })
      // 取得商店
      const shop = await Shop.findByPk(product.shopId, { raw: true })

      cb(null, { product, shop })
    } catch (err) {
      cb(err)
    }
  },
  // 創建商品
  postProduct: async (req, cb) => {
    try {
      const { shopId } = req.user
      const { name, status, price, description, categoryId } = req.body
      let image = req.file

      if (!(name && image && status && price && description)) throw new Error('尚有欄位未填!')
      image = await fileHelper.imgurFileHandler(image)
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

      cb(null, { shopId })
    } catch (err) {
      cb(err)
    }
  },
  // 編輯商品
  putProduct: async (req, cb) => {
    try {
      const { productId } = req.params
      const { name, status, price, description, categoryId } = req.body

      // 更新商品資料
      const product = await Product.findByPk(productId)
      const image = req.file ? await fileHelper.imgurFileHandler(req.file) : product.image
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

      cb(null, { shopId: product.shopId })
    } catch (err) {
      cb(err)
    }
  },
  // 刪除商品
  deleteProduct: async (req, cb) => {
    try {
      const { productId } = req.params
      const product = await Product.findByPk(productId)

      // 已售出的商品不可刪除
      if (product.buyerUserId) throw new Error('商品已售出!')
      // 需一併刪除購物車和商品分類表中的相關紀錄
      await Cart.destroy({ where: { productId } })
      await ProductCategory.destroy({ where: { productId } })
      await Product.destroy({ where: { id: productId } })

      cb(null, { shopId: product.shopId })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = productService
