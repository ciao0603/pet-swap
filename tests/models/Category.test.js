const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# Category Model', () => {
  const { DataTypes } = Sequelize
  const MockCategory = proxyquire('../../models/category', {
    sequelize: Sequelize
  })

  let Category

  before(() => {
    Category = MockCategory(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(() => {
    Category.init.resetHistory()
  })

  // 檢查model是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(Category.init).to.have.been.calledWithMatch(
        {
          name: DataTypes.STRING
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const SubCategory = 'SubCategory'
    before(() => {
      Category.associate({ SubCategory })
    })

    it('呼叫 SubCategory model', (done) => {
      expect(Category.hasMany).to.have.been.calledWith(SubCategory)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', async () => {
    let data = null

    it('create', async () => {
      const category = await db.Category.create({})
      data = category
      expect(category).to.exist
    })
    it('read', async () => {
      const category = await db.Category.findByPk(data.id)
      expect(data.id).to.be.equal(category.id)
    })
    it('update', async () => {
      await db.Category.update({}, { where: { id: data.id } })
      const category = await db.Category.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(category.updatedAt)
    })
    it('delete', async () => {
      await db.Category.destroy({ where: { id: data.id } })
      const category = await db.Category.findByPk(data.id)
      expect(category).to.be.equal(null)
    })
  })
})