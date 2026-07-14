'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Campagne extends Model {
    static associate(models) {
      Campagne.hasMany(models.CampagneVague, { foreignKey: 'idCampagne' });
    }
  }
  Campagne.init({
    idCampagne: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nomCampagne: DataTypes.STRING,
    messageTemplate: DataTypes.TEXT,
    statut: DataTypes.STRING // BROUILLON, PROGRAMMÉ, EN_COURS, TERMINÉ
  }, {
    sequelize,
    modelName: 'Campagne',
    tableName: 'campagnes',
    timestamps: true
  });
  return Campagne;
};
