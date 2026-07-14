'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CampagneVague extends Model {
    static associate(models) {
      CampagneVague.belongsTo(models.Campagne, { foreignKey: 'idCampagne' });
    }
  }
  CampagneVague.init({
    idVague: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    idCampagne: DataTypes.BIGINT,
    datePrevue: DataTypes.DATEONLY,
    heurePrevue: DataTypes.TIME,
    quota: DataTypes.INTEGER,
    statut: DataTypes.STRING // EN_ATTENTE, TERMINE
  }, {
    sequelize,
    modelName: 'CampagneVague',
    tableName: 'campagne_vagues',
    timestamps: false
  });
  return CampagneVague;
};
