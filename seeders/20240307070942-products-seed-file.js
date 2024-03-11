'use strict'
const productsData = require('./seedData/products.json')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // 取得 user1 的 shop_id
      const [user1] = await queryInterface.sequelize.query("SELECT shop_id FROM Users WHERE email = 'user1@example.com'", { type: queryInterface.sequelize.QueryTypes.SELECT })

      // * 新增商品
      for (const product of productsData) {
        const createdProduct = await queryInterface.bulkInsert('Products', [{
          name: product.name,
          image: product.image,
          status: product.status,
          description: product.description,
          price: product.price,
          is_commented: product.is_commented,
          shop_id: user1.shop_id,
          created_at: new Date(),
          updated_at: new Date()
        }], {})

        // * 紀錄該商品的所屬類別
        for (const subCategory of product.SubCategory) {
          // 取得該類別 id
          const [currentSubCategory] = await queryInterface.sequelize.query(`SELECT id FROM Sub_categories WHERE name = '${subCategory}'`, { type: queryInterface.sequelize.QueryTypes.SELECT })
          await queryInterface.bulkInsert('Product_Categories', [{
            product_id: createdProduct,
            sub_category_id: currentSubCategory.id,
            created_at: new Date(),
            updated_at: new Date()
          }])
        }
      }
    } catch (err) {
      console.log('Products-seed-file Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Product_Categories', {})
    await queryInterface.bulkDelete('Products', {})
  }
}
