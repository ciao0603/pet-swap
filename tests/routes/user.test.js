const chai = require('chai')
const { expect } = chai
const sinon = require('sinon')
const request = require('supertest')

const app = require('../../app')
const db = require('../../models')
const authHelper = require('../../helpers/auth-helper')

describe('# 登入相關路由', () => {

  before(async () => {
    // !! 已設置 isAuthenticated 為 true，但console 結果仍為 false
    // 模擬登入資訊
    this.isAuthenticated = sinon.stub(
      authHelper, 'isAuthenticated'
    ).returns(true)
    this.getUser = sinon.stub(authHelper, 'getUser').returns({ id: 1, name: 'user1', isAdmin: false })
    // 清空資料夾
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await db.User.destroy({ where: {}, truncate: true, force: true })
    await db.Shop.destroy({ where: {}, truncate: true, force: true })
    await db.Product.destroy({ where: {}, truncate: true, force: true })
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    // 新增資料
    await db.User.create({ name: 'user1' })
    await db.User.create({ name: 'user2', shopId: 1 })
    await db.Shop.create({})
    await db.Product.create({ buyerUserId: 1, isCommented: false, shopId: 1 })
  })

  describe('# 操作 user 資料', () => {

    context('# 使用者本人操作', () => {
      // GET /users/1
      it('可以瀏覽個人資料頁面', async () => {
        try {
          await request(app)
            .get('/users/1')
            .expect(200)
          // !! 錯誤: expected 200 "OK", got 302 "Found"
        } catch (err) {
          throw err
        }
      })
    })


  })

  after(async () => {
    this.isAuthenticated.restore()
    this.getUser.restore()
  })

})