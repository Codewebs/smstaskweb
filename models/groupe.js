'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Groupe extends Model {
    static associate(models) {
      Groupe.hasMany(models.Contact, { foreignKey: 'idGroupe' });
    }
  }
  Groupe.init({
    idGroupe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nomGroupe: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Groupe',
    tableName: 'groupes',
    timestamps: false
  });
  return Groupe;
};
