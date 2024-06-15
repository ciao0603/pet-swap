const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# Product Model', () => {
  const { DataTypes } = Sequelize
  const MockProduct = proxyquire('../../models/product', {
    sequelize: Sequelize
  })
  const MockShop= proxyquire('../../models/shop', {
    sequelize: Sequelize
  })

  let Product
  let Shop

  before(() => {
    Product = MockProduct(sequelize, DataTypes)
    Shop = MockShop(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(async() => {
    await db.Shop.destroy({ where: {} })
    Product.init.resetHistory()
    Shop.init.resetHistory()
  })

  // 檢查model是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(Product.init).to.have.been.calledWithMatch(
        {
          name: DataTypes.STRING,
          price: DataTypes.INTEGER,
          isCommented: DataTypes.BOOLEAN,
          shopId: DataTypes.INTEGER
        }
      )
    })
    it('包含所有可選屬性欄位', () => {
      expect(Product.init).to.have.been.calledWithMatch(
        {
          image: DataTypes.STRING,
          status: DataTypes.STRING,
          description: DataTypes.TEXT,
          buyerUserId: DataTypes.INTEGER
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const User = 'User'
    const Shop = 'Shop'
    const ProductCategory = 'ProductCategory'
    const Cart = 'Cart'
    const OrderItem = 'OrderItem'
    before(() => {
      Product.associate({ User })
      Product.associate({ Shop })
      Product.associate({ ProductCategory })
      Product.associate({ Cart })
      Product.associate({ OrderItem })
    })

    it('呼叫 User model', (done) => {
      expect(Product.belongsTo).to.have.been.calledWith(User)
      done()
    })
    it('呼叫 Shop model', (done) => {
      expect(Product.belongsTo).to.have.been.calledWith(Shop)
      done()
    })
    it('呼叫 ProductCategory model', (done) => {
      expect(Product.hasMany).to.have.been.calledWith(ProductCategory)
      done()
    })
    it('呼叫 Cart model', (done) => {
      expect(Product.hasMany).to.have.been.calledWith(Cart)
      done()
    })
    it('呼叫 OrderItem model', (done) => {
      expect(Product.hasMany).to.have.been.calledWith(OrderItem)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', async () => {
    let data = null
    // const shop = await db.Shop.create({})

    it('create', async () => {
      const shop = await db.Shop.create({})
      const product = await db.Product.create({ shopId: shop.id })
      data = product
      expect(product).to.exist
    })
    it('read', async () => {
      const product = await db.Product.findByPk(data.id)
      expect(data.id).to.be.equal(product.id)
    })
    it('update', async () => {
      await db.Product.update({}, { where: { id: data.id } })
      const product = await db.Product.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(product.updatedAt)
    })
    it('delete', async () => {
      await db.Product.destroy({ where: { id: data.id } })
      const product = await db.Product.findByPk(data.id)
      expect(product).to.be.equal(null)
    })
  })
})