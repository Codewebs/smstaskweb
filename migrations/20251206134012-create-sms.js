'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sms', {
      idSms: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      contenuSMS: {
        type: Sequelize.STRING
      },
      dateEnregistrementSms: {
        type: Sequelize.DATE
      },
      dateEnvoiSms: {
        type: Sequelize.DATE
      },
      heureEnregistrementSms: {
        type: Sequelize.TIME
      },
      heureEnvoiSms: {
        type: Sequelize.TIME
      },
      numeroDestinataire: {
        type: Sequelize.STRING
      },
      numeroExpediteur: {
        type: Sequelize.STRING
      },
      statut: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sms');
  }
};
