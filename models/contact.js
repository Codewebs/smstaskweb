'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      Contact.belongsTo(models.Groupe, { foreignKey: 'idGroupe' });
    }
  }
  Contact.init({
    idContact: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nom: DataTypes.STRING,
    telephone: DataTypes.STRING,
    idGroupe: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
    timestamps: false
  });
  return Contact;
};
