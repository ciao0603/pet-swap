const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# User Model', () => {
  const { DataTypes } = Sequelize
  const MockUser = proxyquire('../../models/user', {
    sequelize: Sequelize
  })

  let User

  before(() => {
    User = MockUser(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(() => {
    User.init.resetHistory()
  })

  // 檢查model是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(User.init).to.have.been.calledWithMatch(
        {
          name: DataTypes.STRING,
          email: DataTypes.STRING,
          password: DataTypes.STRING,
          isAdmin: DataTypes.BOOLEAN
        }
      )
    })
    it('包含所有可選屬性欄位', () => {
      expect(User.init).to.have.been.calledWithMatch(
        {
          image: DataTypes.STRING,
          shopId: DataTypes.INTEGER
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const Product = 'Product'
    const Cart = 'Cart'
    const Order = 'Order'
    before(() => {
      User.associate({ Product })
      User.associate({ Cart })
      User.associate({ Order })
    })

    it('呼叫 Product model', (done) => {
      expect(User.hasMany).to.have.been.calledWith(Product)
      done()
    })
    it('呼叫 Cart model', (done) => {
      expect(User.hasMany).to.have.been.calledWith(Cart)
      done()
    })
    it('呼叫 Order model', (done) => {
      expect(User.hasMany).to.have.been.calledWith(Order)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', () => {
    let data = null

    it('create', async () => {
      const user = await db.User.create({})
      data = user
      expect(user).to.exist
    })
    it('read', async () => {
      const user = await db.User.findByPk(data.id)
      expect(data.id).to.be.equal(user.id)
    })
    it('update', async () => {
      await db.User.update({}, { where: { id: data.id } })
      const user = await db.User.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(user.updatedAt)
    })
    it('delete', async () => {
      await db.User.destroy({ where: { id: data.id } })
      const user = await db.User.findByPk(data.id)
      expect(user).to.be.equal(null)
    })
  })
})