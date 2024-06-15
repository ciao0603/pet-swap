const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# Cart Model', () => {
  const { DataTypes } = Sequelize
  const MockShop = proxyquire('../../models/shop', {
    sequelize: Sequelize
  })
  const MockProduct = proxyquire('../../models/product', {
    sequelize: Sequelize
  })
  const MockUser = proxyquire('../../models/user', {
    sequelize: Sequelize
  })
  const MockCart = proxyquire('../../models/cart', {
    sequelize: Sequelize
  })

  let Shop
  let Product
  let User
  let Cart

  before(() => {
    Cart = MockCart(sequelize, DataTypes)
    Shop = MockShop(sequelize, DataTypes)
    Product = MockProduct(sequelize, DataTypes)
    User = MockUser(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(async() => {
    await db.Product.destroy({ where: {} })
    await db.Shop.destroy({ where: {} })
    await db.User.destroy({ where: {} })
    User.init.resetHistory()
    Product.init.resetHistory()
    Shop.init.resetHistory()
    Cart.init.resetHistory()
  })

  // 檢查model是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(Cart.init).to.have.been.calledWithMatch(
        {
          productId: DataTypes.INTEGER,
          userId: DataTypes.INTEGER
        }
      )
    })
    it('包含所有可選屬性欄位', () => {
      expect(Cart.init).to.have.been.calledWithMatch(
        {
          productName: DataTypes.STRING,
          productImage: DataTypes.STRING,
          price: DataTypes.INTEGER
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const User = 'User'
    const Product = 'Product'
    before(() => {
      Cart.associate({ Product })
      Cart.associate({ User })
    })

    it('呼叫 User model', (done) => {
      expect(Cart.belongsTo).to.have.been.calledWith(User)
      done()
    })
    it('呼叫 Product model', (done) => {
      expect(Cart.belongsTo).to.have.been.calledWith(Product)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', async () => {
    let data = null

    it('create', async () => {
      const shop = await db.Shop.create({})
      const product = await db.Product.create({shopId: shop.id})
      const user = await db.User.create({})
      const cart = await db.Cart.create({ userId: user.id, productId: product.id })
      data = cart
      expect(cart).to.exist
    })
    it('read', async () => {
      const cart = await db.Cart.findByPk(data.id)
      expect(data.id).to.be.equal(cart.id)
    })
    it('update', async () => {
      await db.Cart.update({}, { where: { id: data.id } })
      const cart = await db.Cart.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(cart.updatedAt)
    })
    it('delete', async () => {
      await db.Cart.destroy({ where: { id: data.id } })
      const cart = await db.Cart.findByPk(data.id)
      expect(cart).to.be.equal(null)
    })
  })
})