'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 1. CHARGER LES MODÈLES D'ABORD
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 2. ÉTABLIR LES ASSOCIATIONS
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 3. SYNCHRONISER LA BD (Uniquement pour créer les tables manquantes si besoin)
// On n'utilise plus { force: true } pour éviter de supprimer les données et les erreurs de clés étrangères.
sequelize.sync().then(() => {
  console.log("Base de données synchronisée (tables manquantes créées).");
}).catch(err => {
  console.error("Erreur de synchronisation :", err);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;