'use strict'
const categoryData = require('./seedData/categories.json')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      for (const category of categoryData) {
        // * 建立主類別
        const createdCategory = await queryInterface.bulkInsert('Categories', [{
          name: category.name,
          created_at: new Date(),
          updated_at: new Date()
        }], {})

        // * 建立子類別
        const subCategoryData = category.SubCategory.map(sc => ({
          name: sc,
          category_id: createdCategory,
          created_at: new Date(),
          updated_at: new Date()
        }))
        await queryInterface.bulkInsert('Sub_categories', subCategoryData, {})
      }
    } catch (err) {
      console.log('Category-seed-file Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Sub_categories', {})
    await queryInterface.bulkDelete('Categories', {})
  }
}
