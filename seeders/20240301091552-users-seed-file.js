'use strict'
const bcrypt = require('bcryptjs')

const userData = require('./seedData/users.json')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const userList = await Promise.all(userData.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
        image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        created_at: new Date(),
        updated_at: new Date()
      })))

      await queryInterface.bulkInsert('Users', userList, {})
    } catch (err) {
      console.log('User-seed-file Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {})
  }
}
