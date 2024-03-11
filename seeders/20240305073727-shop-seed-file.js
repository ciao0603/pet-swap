'use strict'
const shopData = require('./seedData/shop.json')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // * 建立商店
      const newShop = await queryInterface.bulkInsert('Shops', [{
        name: shopData[0].name,
        image: shopData[0].image,
        introduction: shopData[0].introduction,
        created_at: new Date(),
        updated_at: new Date()
      }], {})

      // * 更新 user 的 shopId
      const [user] = await queryInterface.sequelize.query("SELECT id FROM Users WHERE email = 'user1@example.com'", { type: queryInterface.sequelize.QueryTypes.SELECT })
      await queryInterface.sequelize.query(`UPDATE Users SET shop_id = ${newShop} WHERE id = ${user.id}`)
    } catch (err) {
      console.log('Shop-seed-file Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Shops', {})
    await queryInterface.sequelize.query("UPDATE Users SET shop_id = NULL WHERE email = 'user1@example.com'")
  }
}
