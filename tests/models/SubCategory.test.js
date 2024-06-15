const chai = require('chai')
const proxyquire = require('proxyquire');
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  Sequelize
} = require('sequelize-test-helpers')

const db = require('../../models')

describe('# SubCategory Model', () => {
  const { DataTypes } = Sequelize
  const MockCategory = proxyquire('../../models/category', {
    sequelize: Sequelize
  })
  const MockSubCategory = proxyquire('../../models/sub_category', {
    sequelize: Sequelize
  })

  let SubCategory

  before(() => {
    Category = MockCategory(sequelize, DataTypes)
    SubCategory = MockSubCategory(sequelize, DataTypes)
  })

  // 清除測試用的資料
  after(async() => {
    await db.Category.destroy({ where: {} })
    Category.init.resetHistory()
    SubCategory.init.resetHistory()
  })

  // 檢查model是否正確初始化
  context('# 屬性', () => {
    it('包含所有必要屬性欄位', () => {
      expect(SubCategory.init).to.have.been.calledWithMatch(
        {
          name: DataTypes.STRING,
          categoryId: DataTypes.INTEGER
        }
      )
    })
  })

  // 檢查模型間是否正確關聯
  context('# 關聯', () => {
    const Category = 'Category'
    before(() => {
      SubCategory.associate({ Category })
    })

    it('呼叫 Category model', (done) => {
      expect(SubCategory.belongsTo).to.have.been.calledWith(Category)
      done()
    })
  })

  // 檢查 model 的 CRUD
  context('# CRUD', async () => {
    let data = null

    it('create', async () => {
      const category = await db.Category.create({})
      const subCategory = await db.SubCategory.create({categoryId: category.id})
      data = subCategory
      expect(subCategory).to.exist
    })
    it('read', async () => {
      const subCategory = await db.SubCategory.findByPk(data.id)
      expect(data.id).to.be.equal(subCategory.id)
    })
    it('update', async () => {
      await db.SubCategory.update({}, { where: { id: data.id } })
      const subCategory = await db.SubCategory.findByPk(data.id)
      // 檢查最後一次更新時間已確認 data 確實被update
      expect(data.updatedAt).to.be.not.equal(subCategory.updatedAt)
    })
    it('delete', async () => {
      await db.SubCategory.destroy({ where: { id: data.id } })
      const subCategory = await db.SubCategory.findByPk(data.id)
      expect(subCategory).to.be.equal(null)
    })
  })
})