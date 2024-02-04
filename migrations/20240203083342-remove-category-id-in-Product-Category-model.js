'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Product_Categories', 'category_id')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Product_Categories', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    })
  }
}
