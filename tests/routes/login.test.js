const chai = require('chai')
const { expect } = chai
const request = require('supertest')
const bcrypt = require('bcryptjs')

const app = require('../../app')
const db = require('../../models')

describe('# 登入相關路由', () => {

  before(async () => {
    await db.sequelize.sync({ force: true })
    await db.User.create({
      name: 'Existing User',
      email: 'exist@example.com',
      password: await bcrypt.hash('passwd', 10)
    })
  })

  context('# 註冊', () => {

    describe('# GET /register', () => {
      it('可以瀏覽註冊頁面', async () => {
        await request(app)
          .get('/register')
          .expect(200)
      })
    })

    describe('# POST /register', () => {
      it('註冊成功', async () => {
        const newUser = {
          name: 'New User',
          email: 'new@example.com',
          password: 'passwd',
          passwordCheck: 'passwd'
        }
        // 註冊成功 > 重新導向
        await request(app)
          .post('/register')
          .send(newUser)
          .expect(302)
          .expect('Location', '/')
      })
      it('資料不完整 > 註冊失敗', async () => {
        const incompleteUser = {
          name: 'Incomplete User',
          password: 'passwd',
          passwordCheck: 'passwd'
        }
        // 註冊失敗 > 重新導向
        await request(app)
          .post('/register')
          .send(incompleteUser)
          .expect(302)
          .expect('Location', '/')
        // 確認資料沒有被創建
        const user = await db.User.findOne({ where: { name: 'Incomplete User' } })
        expect(user).to.be.null
      })
      it('確認密碼錯誤 > 註冊失敗', async () => {
        const wrongPasswdUser = {
          name: 'Wrong Passwd User',
          email: 'wrongPasswd@example.com',
          password: 'passwd',
          passwordCheck: ''
        }
        // 註冊失敗 > 重新導向
        await request(app)
          .post('/register')
          .send(wrongPasswdUser)
          .expect(302)
          .expect('Location', '/')
        // 確認資料沒有被創建
        const user = await db.User.findOne({ where: { name: 'Wrong Passwd User' } })
        expect(user).to.be.null
      })
      it('user 已存在 > 註冊失敗', async () => {
        const existingUser = {
          name: 'Existing User',
          email: 'exist@example.com',
          password: 'passwd',
          passwordCheck: 'passwd'
        }
        // 註冊失敗 > 重新導向
        await request(app)
          .post('/register')
          .send(existingUser)
          .expect(302)
          .expect('Location', '/')
        // 確認沒有兩筆重複的資料
        const user = await db.User.findAll({ where: { name: 'Existing User' } })
        expect(user.length).to.be.equal(1)
      })
    })
  })

  context('# 登入', () => {

    describe('# GET /login', () => {
      it('可以瀏覽登入頁面', async () => {
        await request(app)
          .get('/login')
          .expect(200)
      })
    })

    describe('# POST /login', () => {
      it('登入成功', async () => {
        await request(app)
          .post('/login')
          .send('email=exist@example.com&password=passwd')
          .expect(302)
          .expect('Location', '/products')
      })
      it('user 不存在 > 登入失敗', async () => {
        await request(app)
          .post('/login')
          .send('email=nonexist@example.com&password=passwd')
          .expect(302)
          .expect('Location', '/login')
      })
      it('密碼錯誤 > 登入失敗', async () => {
        await request(app)
          .post('/login')
          .send('email=exist@example.com&password=wrongPasswd')
          .expect(302)
          .expect('Location', '/login')
      })
    })
  })

  context('# 登出', () => {
    describe('# GET /logout', () => {
      it('登出成功', async () => {
          await request(app)
            .get('/logout')
            .expect(302)
            .expect('Location', '/login')
      })
    })
  })

  after(async () => {
    await db.User.destroy({ where: {} })
  })

})
