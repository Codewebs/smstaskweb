'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contacts', 'fonction', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('contacts', 'isEphemeral', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contacts', 'isEphemeral');
    await queryInterface.removeColumn('contacts', 'fonction');
  }
};
