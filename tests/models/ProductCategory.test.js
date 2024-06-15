const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# ProductCategory Model', () => {
  const { DataTypes } = Sequelize
  const MockProduct = proxyquire('../../models/product', {
    sequelize: Sequelize
  })
  const MockShop = proxyquire('../../models/shop', {
    sequelize: Sequelize
  })

  const MockCategory = proxyquire('../../models/category', {
    sequelize: Sequelize
  })
  const MockSubCategory = proxyquire('../../models/sub_category', {
    sequelize: Sequelize
  })
  const MockProductCategory = proxyquire('../../models/product_categories', {
    sequelize: Sequelize
  })

  let Shop
  let Product
  let Category
  let SubCategory
  let ProductCategory

  before(() => {
    Shop = MockShop(sequelize, DataTypes)
    Product = MockProduct(sequelize, DataTypes)
    Category = MockCategory(sequelize, DataTypes)
    SubCategory = MockSubCategory(sequelize, DataTypes)
    ProductCategory = MockProductCategory(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(async () => {
    await db.Product.destroy({ where: {} })
    await db.SubCategory.destroy({ where: {} })
    await db.Shop.destroy({ where: {} })
    await db.Category.destroy({ where: {} })
    Shop.init.resetHistory()
    Product.init.resetHistory()
    Category.init.resetHistory()
    SubCategory.init.resetHistory()
    ProductCategory.init.resetHistory()
  })

  // 檢查model是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(ProductCategory.init).to.have.been.calledWithMatch(
        {
          productId: DataTypes.INTEGER,
          subCategoryId: DataTypes.INTEGER
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const Product = 'Product'
    const SubCategory = 'SubCategory'
    before(() => {
      ProductCategory.associate({ Product })
      ProductCategory.associate({ SubCategory })
    })

    it('呼叫 Product model', (done) => {
      expect(ProductCategory.belongsTo).to.have.been.calledWith(Product)
      done()
    })
    it('呼叫 SubCategory model', (done) => {
      expect(ProductCategory.belongsTo).to.have.been.calledWith(SubCategory)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', async () => {
    let data = null

    it('create', async () => {
      const shop = await db.Shop.create({})
      const product = await db.Product.create({ shopId: shop.id })
      const category = await db.Category.create({})
      const subCategory = await db.SubCategory.create({ categoryId: category.id })
      const productCategory = await db.ProductCategory.create({ productId: product.id, subCategoryId: subCategory.id })
      data = productCategory
      expect(productCategory).to.exist
    })
    it('read', async () => {
      const productCategory = await db.ProductCategory.findByPk(data.id)
      expect(data.id).to.be.equal(productCategory.id)
    })
    it('update', async () => {
      await db.ProductCategory.update({}, { where: { id: data.id } })
      const productCategory = await db.ProductCategory.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(productCategory.updatedAt)
    })
    it('delete', async () => {
      await db.ProductCategory.destroy({ where: { id: data.id } })
      const productCategory = await db.ProductCategory.findByPk(data.id)
      expect(productCategory).to.be.equal(null)
    })
  })
})