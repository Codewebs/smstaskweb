'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CampagneDestinataire extends Model {}
  CampagneDestinataire.init({
    idCampagne: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    idContact: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    estEnvoye: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'CampagneDestinataire',
    tableName: 'campagne_destinataires',
    timestamps: false
  });
  return CampagneDestinataire;
};
