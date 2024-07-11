const chai = require('chai')
const { expect } = chai
const should = chai.should()
const request = require('supertest')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')

const app = require('../../app')
const db = require('../../models')

//* 後台相關路由測試
//   #後台權限
//     1.非管理員帳號不可進入
//   #使用者管理
//     1.可以看到所有使用者列表
//   #商店管理
//     1.可以看到所有商店列表
//   #商品評論
//     1.可以取得所有商品類別
//     2.可以新增主類別
//     3.可以編輯主類別
//     4.可以刪除主類別
//     5.可以新增子類別
//     6.可以編輯子類別
//     7.可以刪除子類別

describe('# admin 相關路由', () => {
  let agent = request.agent(app)

  before(async () => {
    await db.sequelize.sync({ force: true })
  })

  describe('# 後台權限', () => {

    before(async () => {
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10), isAdmin: false })
      await agent.post('/login').send('email=user1@example.com&password=password')
    })

    it('非管理員帳號不可進入', async () => {
      await agent
        .get('/admin/users')
        .expect(302)
        .expect('Location', '/')
    })

    after(async () => {
      await db.sequelize.sync({ force: true })
    })
  })

  describe('# 使用者管理', () => {

    before(async () => {
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10), isAdmin: true })
      await db.User.create({ name: 'user2', isAdmin: false })
      await agent.post('/login').send('email=user1@example.com&password=password')
    })

    describe('# GET /admin/users', () => {
      it('可以看到所有使用者列表', async () => {
        const res = await agent
          .get('/admin/users')
          .expect(200)
        res.text.should.not.include('user1')
        res.text.should.include('user2')
      })
    })

    after(async () => {
      await db.sequelize.sync({ force: true })
    })
  })

  describe('# 商店管理', () => {

    before(async () => {
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10), isAdmin: true })
      await agent.post('/login').send('email=user1@example.com&password=password')
      await db.Shop.create({ name: 'shop1' })
      for (let i = 0; i < 10; i++) {
        await db.Product.create({ shopId: 1 })
      }
    })

    describe('# GET /admin/shops', () => {
      it('可以看到所有商店列表及其商品數量', async () => {
        const res = await agent
          .get('/admin/shops')
          .expect(200)
        res.text.should.include('shop1')
        res.text.should.include('<td class="text-info fw-bold">10</td>')
      })
    })

    after(async () => {
      await db.sequelize.sync({ force: true })
    })
  })

  describe('# 商品類別管理', () => {

    before(async () => {
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10), isAdmin: true })
      await agent.post('/login').send('email=user1@example.com&password=password')
      await db.Shop.create({})
      await db.Product.create({ shopId: 1 })
      await db.Category.create({ name: 'category1' })
      await db.SubCategory.create({ name: 'subCategory1', categoryId: 1 })
      await db.ProductCategory.create({ productId: 1, subCategoryId: 1 })
    })

    describe('# GET /admin/categories', () => {
      it('可以取得所有商品類別', async () => {
        const res = await agent
          .get('/admin/categories')
          .expect(200)
        res.text.should.include('category1')
        res.text.should.include('subCategory1')
      })
    })

    describe('# POST /admin/categories', () => {
      it('可以新增主類別', async () => {
        await agent
          .post('/admin/categories')
          .send('categoryName=category2&subCategoryName=subCategory2')
          .expect(302)
          .expect('Location', '/')
        const category2 = await db.Category.findOne({ where: { name: 'category2' } })
        const subCategory2 = await db.SubCategory.findOne({ where: { name: 'subCategory2' } })
        expect(category2).to.exist
        expect(subCategory2).to.exist
      })
    })

    describe('# PUT /admin/categories/:CategoryId', () => {
      it('可以編輯主類別', async () => {
        await agent
          .put('/admin/categories/2')
          .send('categoryName=category222')
          .expect(302)
          .expect('Location', '/')
        const updatedCategory = await db.Category.findByPk(2)
        updatedCategory.name.should.equal('category222')
      })
    })

    describe('# DELETE /admin/categories/:CategoryId', () => {

      before(async () => {
        await db.ProductCategory.create({ productId: 1, subCategoryId: 2 })
      })

      it('可以刪除主類別', async () => {
        await agent
          .delete('/admin/categories/2')
          .expect(302)
          .expect('Location', '/')
        const deletedCategory = await db.Category.findByPk(2)
        const deletedSubCategory = await db.SubCategory.findByPk(2)
        const deletedProductCategories = await db.ProductCategory.findAll({ where: { subCategoryId: 2 } })
        expect(deletedCategory).to.not.exist
        expect(deletedSubCategory).to.not.exist
        expect(deletedProductCategories.length).to.equal(0)
      })
    })

    describe('# POST /admin/subCategories', () => {
      it('可以新增子類別', async () => {
        await agent
          .post('/admin/subCategories')
          .send('categoryId=1&subCategoryName=subCategory3')
          .expect(302)
          .expect('Location', '/')
        const createdSubCategory = await db.SubCategory.findOne({ where: { name: 'subCategory3' } })
        expect(createdSubCategory).to.exist
        expect(createdSubCategory.categoryId).to.be.equal(1)
      })
    })

    describe('# PUT /admin/subCategories/:subCategoryId', () => {
      it('可以編輯子類別', async () => {
        await agent
          .put('/admin/subCategories/3')
          .send('subCategoryName=subCategory333')
          .expect(302)
          .expect('Location', '/')
        const updatedSubCategory = await db.SubCategory.findByPk(3)
        updatedSubCategory.name.should.equal('subCategory333')
      })
    })

    describe('# DELETE /admin/subCategories/:subCategoryId', () => {

      before(async () => {
        // 刪除前面新增的子類別，使 category1 底下只剩 Subcategory1 以增加測試覆蓋率
        await db.SubCategory.destroy({ where: { id: { [Op.ne]: 1 }, categoryId: 1 } })
      })

      it('可以刪除子類別', async () => {
        await agent
          .delete('/admin/subCategories/1')
          .send('categoryId=1')
          .expect(302)
          .expect('Location', '/')
        const deletedCategory = await db.Category.findByPk(1)
        const deletedSubCategory = await db.SubCategory.findByPk(1)
        const deletedProductCategories = await db.ProductCategory.findAll({ where: { subCategoryId: 1 } })
        expect(deletedCategory).to.not.exist
        expect(deletedSubCategory).to.not.exist
        expect(deletedProductCategories.length).to.equal(0)
      })
    })

    after(async () => {
      await db.sequelize.sync({ force: true })
    })
  })
})