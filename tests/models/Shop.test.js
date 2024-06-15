const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# Shop Model', () => {
  const { DataTypes } = Sequelize
  const MockShop = proxyquire('../../models/shop', {
    sequelize: Sequelize
  })

  let Shop

  before(() => {
    Shop = MockShop(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(() => {
    Shop.init.resetHistory()
  })

  // 檢查 model 是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(Shop.init).to.have.been.calledWithMatch(
        {
          name: DataTypes.STRING
        }
      )
    })
    it('包含所有可選屬性欄位', () => {
      expect(Shop.init).to.have.been.calledWithMatch(
        {
          image: DataTypes.STRING,
          introduction: DataTypes.TEXT
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const Product = 'Product'
    before(() => {
      Shop.associate({ Product })
    })

    it('呼叫 Product model', (done) => {
      expect(Shop.hasMany).to.have.been.calledWith(Product)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', () => {
    let data = null

    it('create', async () => {
      const shop = await db.Shop.create({})
      data = shop
      expect(shop).to.exist
    })
    it('read', async () => {
      const shop = await db.Shop.findByPk(data.id)
      expect(data.id).to.be.equal(shop.id)
    })
    it('update', async () => {
      await db.Shop.update({}, { where: { id: data.id } })
      const shop = await db.Shop.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(shop.updatedAt)
    })
    it('delete', async () => {
      await db.Shop.destroy({ where: { id: data.id } })
      const shop = await db.Shop.findByPk(data.id)
      expect(shop).to.be.equal(null)
    })
  })
})