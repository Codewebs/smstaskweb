'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contenuSMS: {
        type: Sequelize.STRING
      },
      dateBilan: {
        type: Sequelize.DATE
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
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sms');
  }
};