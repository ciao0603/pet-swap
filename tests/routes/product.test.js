const chai = require('chai')
const { expect } = chai
const should = chai.should()
const request = require('supertest')
const bcrypt = require('bcryptjs')
const sinon = require('sinon')
const mongoose = require('mongoose')

const app = require('../../app')
const db = require('../../models')
const Comment = require('../../models/comment')
const fileHelper = require('../../helpers/file-helper')

//* 商品相關路由測試
//   #首頁
//     1.可以瀏覽所有商品且分頁成功
//     2.可以根據商品關鍵字搜尋
//     3.可以根據商品類別搜尋
//   #商品CRUD
//     1.可以瀏覽商品新增頁面
//     2.新增商品
//     3.可以瀏覽單一商品資料
//     4.可以瀏覽商品編輯頁面
//     5.修改商品資料
//     6.不可修改他人商店的商品資料
//     7.刪除商品
//   #商品評論
//     1.可以發布商品評論

describe('# product 相關路由', () => {

  before(async () => {
    mongoose.connect(process.env.MONGODB_URI_TEST)
    await db.sequelize.sync({ force: true })
  })

  describe('# 首頁', () => {
    let agent = request.agent(app)
    const PRODUCTS_LIMIT = 12
    const PRODUCTS_TOTAL = PRODUCTS_LIMIT + 2

    before(async () => {
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10) })
      await agent.post('/login').send('email=user1@example.com&password=password')
      await db.Shop.create({})
      await db.Category.create({})
      for (let i = 0; i < 2; i++) {
        await db.SubCategory.create({ categoryId: 1 })
      }
      for (let i = 1; i < PRODUCTS_TOTAL; i++) {
        const product = await db.Product.create({ name: `product${i}`, description: '', shopId: 1 })
        await db.ProductCategory.create({ productId: product.id, subCategoryId: Math.floor(Math.random() * 2) + 1 })
      }
      await db.Product.create({ name: `product${PRODUCTS_TOTAL}`, description: '', shopId: 1, buyerUserId: 1 })
      await db.ProductCategory.create({ productId: PRODUCTS_TOTAL, subCategoryId: 1 })
    })

    describe('# GET /products', () => {
      it('可以瀏覽所有商品且分頁成功', async () => {
        const res = await agent
          .get('/products')
          .expect(200)
        res.text.should.include('product1')
        res.text.should.not.include(`product${PRODUCTS_LIMIT + 1}`)
        res.text.should.not.include(`product${PRODUCTS_TOTAL}`)
      })
    })

    describe('# GET /products/search', () => {
      it('可以根據商品關鍵字搜尋', async () => {
        const res = await agent
          .get(`/products/search?KEYWORD=product${PRODUCTS_LIMIT + 1}`)
          .expect(200)
        res.text.should.include(`product${PRODUCTS_LIMIT + 1}`)
      })
      it('可以根據商品類別搜尋', async () => {
        const res = await agent
          .get(`/products/search?subCategoryId=1`)
          .expect(200)
        const foundProduct = await db.ProductCategory.findOne({ where: { subCategoryId: 1 }, include: [db.Product], nest: true, raw: true })
        res.text.should.include(foundProduct.Product.name)
      })
    })

    after(async () => {
      await db.sequelize.sync({ force: true })
    })
  })

  describe('# 商品 CRUD', () => {
    let agent = request.agent(app)
    let fakeImage

    before(async () => {
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10), shopId: 1 })
      await agent.post('/login').send('email=user1@example.com&password=password')
      fakeImage = sinon.stub(fileHelper, 'imgurFileHandler').resolves('http://fake.com/fakeImage.jpg')
      await db.Shop.create({ name: 'shop1' })
      await db.Category.create({})
      for (let i = 0; i < 2; i++) {
        await db.SubCategory.create({ categoryId: 1 })
      }
    })

    describe('# GET /products/create', () => {
      it('可以瀏覽商品新增頁面', async () => {
        await agent
          .get('/products/create')
          .expect(200)
      })
    })

    describe('# POST /products', () => {
      it('新增商品', async () => {
        await agent
          .post('/products')
          .field('name', 'product1')
          .field('status', ' ')
          .field('price', '100')
          .field('description', ' ')
          .field('categoryId', ['1', '2'])
          .attach('image', Buffer.from('fake image data'), 'fakeImage.jpg')
          .expect(302)
          .expect('Location', '/shops/1')
        const product = await db.Product.findOne({ where: { name: 'product1' } })
        expect(product).to.exist
      })
    })

    describe('# GET /product/1', () => {
      it('可以瀏覽單一商品資料', async () => {
        const res = await agent
          .get('/products/1')
          .expect(200)
        res.text.should.include('product1')
        res.text.should.include('shop1')
      })
    })

    describe('# GET /products/1/edit', () => {
      it('可以瀏覽商品編輯頁面', async () => {
        const res = await agent
          .get('/products/1/edit')
          .expect(200)
        res.text.should.include('product1')
      })
    })

    describe('# PUT /products/1', () => {
      it('修改商品資料', async () => {
        await agent
          .put('/products/1')
          .send('name=product111&status= &price=100&description= &categoryId[]=1&categoryId[]=2')
          .expect(302)
          .expect('Location', '/shops/1')
        const product = await db.Product.findByPk(1)
        product.name.should.equal('product111')
      })
      it('不可修改他人商店的商品資料', async () => {
        await db.Shop.create({ id: 2 })
        await db.Product.create({ id: 2, shopId: 2 })
        await agent
          .put('/products/2')
          .expect(302)
          .expect('Location', '/')
      })
    })

    describe('# DELETE /products/1', () => {
      it('刪除商品', async () => {
        await agent
          .delete('/products/1')
          .expect(302)
          .expect('Location', '/shops/1')
        const product = await db.Product.findByPk(1)
        const productCategory = await db.ProductCategory.findAll({ where: { productId: 1 } })
        expect(product).to.not.exist
        expect(productCategory.length).to.be.equal(0)
      })
    })

    after(async () => {
      fakeImage.restore()
      await db.sequelize.sync({ force: true })
    })
  })

  describe('# 商品評論', () => {
    let agent = request.agent(app)

    before(async () => {
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10), shopId: 1 })
      await agent.post('/login').send('email=user1@example.com&password=password')
      await db.Shop.create({})
      await db.Product.create({ shopId: 1, buyerUserId: 1, isCommented: false })
    })

    describe('# POST /products/1/comments', () => {
      it('可以發布商品評論', async () => {
        await agent
          .post('/products/1/comments')
          .send('score=5&comment= ')
          .expect(302)
          .expect('Location', '/')
        const comment = await Comment.findOne({ productId: 1 }).lean()
        const updatedProduct = await db.Product.findByPk(1)
        expect(comment.productId).to.be.equal(1)
        expect(comment.userId).to.be.equal(1)
        expect(comment.score).to.be.equal(5)
        expect(updatedProduct.isCommented).to.be.true
      })

    })

    after(async () => {
      await Comment.deleteMany({})
      await db.sequelize.sync({ force: true })
    })
  })

  after(() => {
    mongoose.connection.close()
  })
})