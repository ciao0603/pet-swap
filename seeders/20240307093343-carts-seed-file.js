'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 取得 user2 的 id
    const [user2] = await queryInterface.sequelize.query("SELECT id FROM Users WHERE email = 'user2@example.com'", { type: queryInterface.sequelize.QueryTypes.SELECT })
    // 取得所有商品 id
    const products = await queryInterface.sequelize.query('SELECT id FROM Products WHERE buyer_user_id IS Null', { type: queryInterface.sequelize.QueryTypes.SELECT })
    // 隨機取得4個商品 id
    const productList = []
    for (let i = 0; i < 4; i++) {
      const randomProductId = products[Math.floor(Math.random() * products.length)].id
      if (productList.includes(randomProductId)) {
        i--
      } else {
        productList.push(randomProductId)
      }
    }
    // 新增購物車紀錄
    for (const productId of productList) {
      const [product] = await queryInterface.sequelize.query(`SELECT * FROM Products WHERE id = ${productId}`, { type: queryInterface.sequelize.QueryTypes.SELECT })
      await queryInterface.bulkInsert('Carts', [{
        product_id: product.id,
        user_id: user2.id,
        product_name: product.name,
        product_image: product.image,
        price: product.price,
        created_at: new Date(),
        updated_at: new Date()
      }])
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Carts', {})
  }
}
