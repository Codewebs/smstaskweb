'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sms extends Model {
    static associate(models) {
      // associations if needed
    }
  }

  Sms.init({
    idSms: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    contenuSMS: DataTypes.STRING,
    dateBilan: DataTypes.DATE,
    dateEnregistrementSms: DataTypes.DATE,
    dateEnvoiSms: DataTypes.DATE,
    heureEnregistrementSms: DataTypes.TIME,
    heureEnvoiSms: DataTypes.TIME,
    numeroDestinataire: DataTypes.STRING,
    numeroExpediteur: DataTypes.STRING,
    statut: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sms',
    tableName: 'sms',   // IMPORTANT sinon Sequelize met "Sms"
    timestamps: false   // IMPORTANT sinon Sequelize cherche createdAt/updatedAt
  });

  return Sms;
};
