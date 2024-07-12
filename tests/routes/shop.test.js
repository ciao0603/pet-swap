const chai = require('chai')
const { expect } = chai
const should = chai.should()
const request = require('supertest')
const bcrypt = require('bcryptjs')
const sinon = require('sinon')

const app = require('../../app')
const db = require('../../models')
const fileHelper = require('../../helpers/file-helper')

//* 商店相關路由測試
//   1.可以瀏覽建立商店的頁面
//   2.可以建立商店
//   3.可以瀏覽商店資料
//   4.不可以瀏覽他人商店資料
//   5.可以瀏覽編輯商店的頁面
//   6.可以編輯商店資料
//   7.可以瀏覽商店歷史訂單

describe('# shop 相關路由', () => {

  let agent = request.agent(app)
  let fakeImage

  before(async () => {
    await db.sequelize.sync({ force: true })
    await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10) })
    await agent.post('/login').send('email=user1@example.com&password=password')
    // 模擬上傳圖片
    fakeImage = sinon.stub(fileHelper, 'imgurFileHandler').resolves('http://fake.com/fakeImage.jpg')
  })

  describe('# GET /shops/create', () => {
    it('可以瀏覽建立商店的頁面', async () => {
      await agent
        .get('/shops/create')
        .expect(200)
    })
  })

  describe('# POST /shops', () => {
    it('可以建立商店', async () => {
      await agent
        .post('/shops')
        .field('name', 'shop1')
        .field('introduction', 'intro')
        .attach('image', Buffer.from('fake image data'), 'fakeImage.jpg')
        .expect(302)
        .expect('Location', '/shops/1')
      const user = await db.User.findByPk(1)
      const shop = await db.Shop.findOne({ where: { name: 'shop1' } })
      user.shopId.should.equal(shop.id)
    })
  })

  describe('# GET /shops/1', () => {

    before(async () => {
      await db.Shop.create({})
      await db.Product.create({ name: 'product1', description: '', shopId: 1 })
      await db.Product.create({ name: 'product2', description: '', shopId: 2 })
    })

    it('可以瀏覽商店資料', async () => {
      const res = await agent
        .get('/shops/1')
        .expect(200)
      res.text.should.include('product1')
      res.text.should.not.include('product2')
    })
    it('不可以瀏覽他人商店資料', async () => {
      await agent
        .get('/shops/2')
        .expect(302)
        .expect('Location', '/')
    })
  })

  describe('# GET /shops/1/edit', () => {
    it('可以瀏覽編輯商店的頁面', async () => {
      const res = await agent
        .get('/shops/1/edit')
        .expect(200)
      res.text.should.include('shop1')
    })
  })

  describe('# PUT /shops/1', () => {
    it('可以編輯商店資料', async () => {
      await agent
        .put('/shops/1')
        .send('name=shop111&introduction= ')
        .expect(302)
        .expect('Location', `/shops/1`)
      const shop = await db.Shop.findByPk(1)
      shop.name.should.equal('shop111')
    })
  })

  describe('# GET /shops/1/orders', () => {

    before(async () => {
      await db.Product.create({ name: 'product3', buyerUserId: 1, shopId: 1 })
      await db.Order.create({ receiverName: 'receiver1' })
      await db.OrderItem.create({ orderId: 1, productId: 3 })
    })

    it('可以瀏覽商店歷史訂單', async () => {
      const res = await agent
        .get('/shops/1/orders')
        .expect(200)
      res.text.should.include('product3')
      res.text.should.include('receiver1')
    })
  })


  after(async () => {
    fakeImage.restore()
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await db.User.destroy({ where: {}, truncate: true, force: true })
    await db.Shop.destroy({ where: {}, truncate: true, force: true })
    await db.Product.destroy({ where: {}, truncate: true, force: true })
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})