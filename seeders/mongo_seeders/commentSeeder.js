const mongoose = require('mongoose')
const faker = require('faker')

const { User, Product, OrderItem } = require('../../models')
const Comment = require('../../models/comment')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection

db.once('open', async () => {
  try {
    // 取得所有 orderItem
    const orderItems = await OrderItem.findAll({ raw: true })
    // 為前兩筆新增 comment
    for (let i = 0; i < 2; i++) {
      const orderItem = orderItems[i]
      const product = await Product.findByPk(orderItem.productId, {
        include: [User],
        nest: true
      })
      const productData = product.dataValues
      await Comment.create({
        productId: productData.id,
        userId: productData.buyerUserId,
        shopId: productData.shopId,
        userName: productData.User.dataValues.name,
        score: Math.round(Math.random() * 5 * 10) / 10,
        comment: faker.lorem.sentence(),
        created_at: new Date()
      })
      await product.update({ isCommented: true })
    }
    process.exit()
  } catch (err) {
    console.error('mondoDB comment seeder error:', err)
  }
})
