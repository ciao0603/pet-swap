const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# Order Model', () => {
  const { DataTypes } = Sequelize
  const MockUser = proxyquire('../../models/user', {
    sequelize: Sequelize
  })
  const MockOrder = proxyquire('../../models/order', {
    sequelize: Sequelize
  })

  let User
  let Order

  before(() => {
    Order = MockOrder(sequelize, DataTypes)
    User = MockUser(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(async() => {
    await db.User.destroy({ where: {} })
    User.init.resetHistory()
    Order.init.resetHistory()
  })

  // 檢查model是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(Order.init).to.have.been.calledWithMatch(
        {
          userId: DataTypes.INTEGER
        }
      )
    })
    it('包含所有可選屬性欄位', () => {
      expect(Order.init).to.have.been.calledWithMatch(
        {
          receiverName: DataTypes.STRING,
          receiverPhone: DataTypes.STRING,
          receiverAddress: DataTypes.STRING,
          totalPrice: DataTypes.INTEGER
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const User = 'User'
    const OrderItem = 'OrderItem'
    before(() => {
      Order.associate({ User })
      Order.associate({ OrderItem })
    })

    it('呼叫 User model', (done) => {
      expect(Order.belongsTo).to.have.been.calledWith(User)
      done()
    })
    it('呼叫 OrderItem model', (done) => {
      expect(Order.hasMany).to.have.been.calledWith(OrderItem)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', async () => {
    let data = null

    it('create', async () => {
      const user = await db.User.create({})
      const order = await db.Order.create({ userId: user.id })
      data = order
      expect(order).to.exist
    })
    it('read', async () => {
      const order = await db.Order.findByPk(data.id)
      expect(data.id).to.be.equal(order.id)
    })
    it('update', async () => {
      await db.Order.update({}, { where: { id: data.id } })
      const order = await db.Order.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(order.updatedAt)
    })
    it('delete', async () => {
      await db.Order.destroy({ where: { id: data.id } })
      const order = await db.Order.findByPk(data.id)
      expect(order).to.be.equal(null)
    })
  })
})