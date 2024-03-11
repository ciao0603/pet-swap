'use strict'
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // * 成立新訂單
    const [user2] = await queryInterface.sequelize.query("SELECT id FROM Users WHERE email = 'user2@example.com'", { type: queryInterface.sequelize.QueryTypes.SELECT })
    const order = await queryInterface.bulkInsert('Orders', [{
      user_id: user2.id,
      receiver_name: faker.name.findName(),
      receiver_phone: faker.phone.phoneNumber(),
      receiver_address: faker.address.streetAddress(),
      total_price: 0,
      created_at: new Date(),
      updated_at: new Date()
    }], {})

    // * 紀錄訂單詳情
    let totalPrice = 0
    // 取得所有商品 id
    const products = await queryInterface.sequelize.query('SELECT id FROM Products', { type: queryInterface.sequelize.QueryTypes.SELECT })
    // 隨機取得四個商品
    for (let i = 0; i < 4; i++) {
      const randomProductId = products[Math.floor(Math.random() * products.length)].id
      const [product] = await queryInterface.sequelize.query(`SELECT * FROM Products WHERE id = ${randomProductId}`, { type: queryInterface.sequelize.QueryTypes.SELECT })
      // 若商品已售出就重新選擇
      if (product.buyer_user_id !== null) {
        i--
      } else {
        // 新增一筆 orderItem
        await queryInterface.bulkInsert('Order_items', [{
          order_id: order,
          product_id: randomProductId,
          created_at: new Date(),
          updated_at: new Date()
        }])
        // 累積訂單金額
        totalPrice += product.price
        // 將該商品標為已售出
        await queryInterface.sequelize.query(`UPDATE Products SET buyer_user_id = ${user2.id} WHERE id = ${randomProductId}`)
      }
    }
    // 更新訂單總價
    await queryInterface.sequelize.query(`UPDATE Orders SET total_price = ${totalPrice} WHERE id = ${order}`)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Order_items', {})
    await queryInterface.bulkDelete('Orders', {})
    await queryInterface.sequelize.query('UPDATE Products SET buyer_user_id = NULL WHERE buyer_user_id IS NOT NULL')
  }
}
