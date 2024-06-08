const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# OrderItem Model', () => {
  const { DataTypes } = Sequelize
  const MockProduct = proxyquire('../../models/product', {
    sequelize: Sequelize
  })
  const MockShop = proxyquire('../../models/shop', {
    sequelize: Sequelize
  })

  const MockUser = proxyquire('../../models/user', {
    sequelize: Sequelize
  })
  const MockOrder = proxyquire('../../models/order', {
    sequelize: Sequelize
  })
  const MockOrderItem = proxyquire('../../models/order_item', {
    sequelize: Sequelize
  })

  let Shop
  let Product
  let User
  let Order
  let OrderItem

  before(() => {
    Shop = MockShop(sequelize, DataTypes)
    Product = MockProduct(sequelize, DataTypes)
    User = MockUser(sequelize, DataTypes)
    Order = MockOrder(sequelize, DataTypes)
    OrderItem = MockOrderItem(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(async () => {
    await db.Order.destroy({ where: {} })
    await db.Product.destroy({ where: {} })
    await db.Shop.destroy({ where: {} })
    await db.User.destroy({ where: {} })
    Shop.init.resetHistory()
    Product.init.resetHistory()
    User.init.resetHistory()
    Order.init.resetHistory()
    OrderItem.init.resetHistory()
  })

  // 檢查model是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(OrderItem.init).to.have.been.calledWithMatch(
        {
          orderId: DataTypes.INTEGER,
          productId: DataTypes.INTEGER
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const Product = 'Product'
    const Order = 'Order'
    before(() => {
      OrderItem.associate({ Product })
      OrderItem.associate({ Order })
    })

    it('呼叫 Product model', (done) => {
      expect(OrderItem.belongsTo).to.have.been.calledWith(Product)
      done()
    })
    it('呼叫 Order model', (done) => {
      expect(OrderItem.belongsTo).to.have.been.calledWith(Order)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', async () => {
    let data = null

    it('create', async () => {
      const shop = await db.Shop.create({})
      const product = await db.Product.create({ shopId: shop.id })
      const user = await db.User.create({})
      const order = await db.Order.create({ userId:user.id })
      const orderItem = await db.OrderItem.create({ productId: product.id, orderId: order.id })
      data = orderItem
      expect(orderItem).to.exist
    })
    it('read', async () => {
      const orderItem = await db.OrderItem.findByPk(data.id)
      expect(data.id).to.be.equal(orderItem.id)
    })
    it('update', async () => {
      await db.OrderItem.update({}, { where: { id: data.id } })
      const orderItem = await db.OrderItem.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(orderItem.updatedAt)
    })
    it('delete', async () => {
      await db.OrderItem.destroy({ where: { id: data.id } })
      const orderItem = await db.OrderItem.findByPk(data.id)
      expect(orderItem).to.be.equal(null)
    })
  })
})