'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Albums', [{
      album: 'Nature',
      name: 'dove-2516641_1280.jpg',
      path: '/albums/Nature/dove-2516641_1280.jpg',
      raw: 'http://localhost:8888/photos/nature/dove-2516641_1280.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    }])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     */
    await queryInterface.bulkDelete('Albums', null, {})
  }
}
