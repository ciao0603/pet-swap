const chai = require('chai')
const { expect } = chai
const should = chai.should()
const request = require('supertest')
const bcrypt = require('bcryptjs')

const app = require('../../app')
const db = require('../../models')

//* 使用者相關路由測試
//   #操作 user 資料
//     1.可以瀏覽個人資料頁面
//     2.不可以瀏覽別人的資料頁面
//     3.可以瀏覽資料編輯頁面
//     4.資料編輯成功
//   #購物車
//     1.瀏覽購物車頁面
//     2.將商品加入購物車
//     3.刪除購物車中的商品
//   #訂單
//     1.建立訂單
//     2.瀏覽歷史訂單

describe('# user 相關路由', () => {

  let agent = request.agent(app)

  before(async() => {
    // 確認資料庫淨空
    await db.sequelize.sync({ force: true })
  })

  describe('# 操作 user 資料', () => {

    before(async () => {
      // 建立資料
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10) })
      await db.User.create({ name: 'user2', shopId: 1 })
      await db.Shop.create({})
      await db.Product.create({ name: 'product1', shopId: 1, buyerUserId: 1, isCommented: false })
      // 保持登入狀態
      await agent.post('/login').send('email=user1@example.com&password=password')
    })

    // GET /users/1
    it('可以瀏覽個人資料頁面', async () => {
      const res = await agent
        .get('/users/1')
        .expect(200)
      res.text.should.include('user1')
      res.text.should.include('product1')
    })
    // GET /users/2
    it('不可以瀏覽別人的資料頁面', async () => {
      await agent
        .get('/users/2')
        .expect(302)
        .expect('Location', '/')
    })
    // GET /users/1/edit
    it('可以瀏覽資料編輯頁面', async () => {
      const res = await agent
        .get('/users/1/edit')
        .expect(200)
    })
    // GET /users/1/edit
    it('資料編輯成功', async () => {
      await agent
        .put('/users/1')
        .send("name=user111&email=&password=&passwordCheck=")
        .expect(302)
        .expect('Location', '/users/1')

      const user = await db.User.findByPk(1)
      user.name.should.equal('user111')
    })

    after(async () => {
      // 清空資料庫
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
      await db.User.destroy({ where: {}, truncate: true, force: true })
      await db.Product.destroy({ where: {}, truncate: true, force: true })
      await db.Shop.destroy({ where: {}, truncate: true, force: true })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    })
  })

  describe('# 購物車', () => {

    before(async () => {
      // 建立資料
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10) })
      await db.User.create({ name: 'user2', shopId: 1 })
      await db.Shop.create({})
      await db.Product.create({ shopId: 1 })
      await db.Product.create({ shopId: 1 })
      await db.Product.create({ shopId: 1 })
      await db.Cart.create({ userId: 1, productId: 1, price: 50 })
      await db.Cart.create({ userId: 1, productId: 2, price: 50 })
      await db.Cart.create({ userId: 2, productId: 1, price: 50 })
      // 保持登入狀態
      await agent.post('/login').send('email=user1@example.com&password=password')
    })

    // GET /users/1/carts
    it('瀏覽購物車頁面', async () => {
      const res = await agent
        .get('/users/1/carts')
        .expect(200)
      res.text.should.include('user1的購物車')
      res.text.should.include('商品共計100元')
    })
    // POST /users/1/carts
    it('將商品加入購物車', async () => {
      await agent
        .post('/users/1/carts')
        .send('productId=3')
        .expect(302)
        .expect('Location', '/')
      const cart = await db.Cart.findOne({ where: { userId: 1, productId: 3 } })
      expect(cart).to.exist
    })
    // DELETE /users/1/carts/1
    it('刪除購物車中的商品', async () => {
      await agent
        .delete('/users/1/carts/1')
        .expect(302)
        .expect('Location', '/')
      const cart = await db.Cart.findOne({ where: { userId: 1, productId: 1 } })
      expect(cart).to.not.exist
    })

    after(async () => {
      // 清空資料庫
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
      await db.User.destroy({ where: {}, truncate: true, force: true })
      await db.Product.destroy({ where: {}, truncate: true, force: true })
      await db.Shop.destroy({ where: {}, truncate: true, force: true })
      await db.Cart.destroy({ where: {}, truncate: true, force: true })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    })
  })

  describe('# 訂單', () => {

    before(async () => {
      // 建立資料
      await db.User.create({ name: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password', 10) })
      await db.User.create({ name: 'user2', shopId: 1 })
      await db.Shop.create({})
      await db.Product.create({ shopId: 1 })
      await db.Product.create({ shopId: 1 })
      // 保持登入狀態
      await agent.post('/login').send('email=user1@example.com&password=password')
    })

    // POST /users/1/orders
    it('建立訂單', async () => {
      await agent
        .post('/users/1/orders')
        .send("receiverName= &receiverPhone= &receiverAddress= &productId%5B%5D=1&productId%5B%5D=2&totalPrice=100")
        .expect(302)
        .expect('Location', '/products')
      const order = await db.Order.findOne({ where: { totalPrice: 100 } })
      const orderItems = await db.OrderItem.findAll({ where: { orderId: order.id } })
      const product = await db.Product.findByPk(1)
      const cart = await db.Cart.findOne({ where: { userId: 1, productId: 1 } })
      expect(order).to.exist
      expect(orderItems.length).to.be.equal(2)
      expect(product.buyerUserId).to.be.equal(1)
      expect(cart).to.not.exist
    })
    // GET /users/1/orders
    it('瀏覽歷史訂單', async () => {
      const res = await agent
        .get('/users/1/orders')
        .expect(200)
      const order = await db.Order.findOne({ where: { userId: 1 } })
      res.text.should.include(`訂單編號: ${order.id}`)
    })


    after(async () => {
      // 清空資料庫
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
      await db.User.destroy({ where: {}, truncate: true, force: true })
      await db.Product.destroy({ where: {}, truncate: true, force: true })
      await db.Shop.destroy({ where: {}, truncate: true, force: true })
      await db.Order.destroy({ where: {}, truncate: true, force: true })
      await db.OrderItem.destroy({ where: {}, truncate: true, force: true })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    })
  })
})