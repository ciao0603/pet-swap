'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'status', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('Orders', 'trade_no', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('Orders', 'product_ids', {
      type: Sequelize.JSON
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'status')
    await queryInterface.removeColumn('Orders', 'trade_no')
    await queryInterface.removeColumn('Orders', 'productIds')
  }
}
