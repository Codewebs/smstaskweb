'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Groupes
    await queryInterface.createTable('groupes', {
      idGroupe: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nomGroupe: { type: Sequelize.STRING },
      description: { type: Sequelize.STRING }
    });

    // 2. Contacts
    await queryInterface.createTable('contacts', {
      idContact: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      nom: { type: Sequelize.STRING },
      telephone: { type: Sequelize.STRING },
      idGroupe: { type: Sequelize.INTEGER, references: { model: 'groupes', key: 'idGroupe' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' }
    });

    // 3. Campagnes
    await queryInterface.createTable('campagnes', {
      idCampagne: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      nomCampagne: { type: Sequelize.STRING },
      messageTemplate: { type: Sequelize.TEXT },
      statut: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // 4. Campagne Vagues
    await queryInterface.createTable('campagne_vagues', {
      idVague: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      idCampagne: { type: Sequelize.BIGINT, references: { model: 'campagnes', key: 'idCampagne' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      datePrevue: { type: Sequelize.DATEONLY },
      heurePrevue: { type: Sequelize.TIME },
      quota: { type: Sequelize.INTEGER },
      statut: { type: Sequelize.STRING }
    });

    // 5. Campagne Destinataires (Table de liaison)
    await queryInterface.createTable('campagne_destinataires', {
      idCampagne: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'campagnes', key: 'idCampagne' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      idContact: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'contacts', key: 'idContact' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      estEnvoye: { type: Sequelize.BOOLEAN, defaultValue: false }
    });

    // 6. Mise à jour de la table SMS existante
    await queryInterface.addColumn('sms', 'idCampagne', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: { model: 'campagnes', key: 'idCampagne' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sms', 'idCampagne');
    await queryInterface.dropTable('campagne_destinataires');
    await queryInterface.dropTable('campagne_vagues');
    await queryInterface.dropTable('campagnes');
    await queryInterface.dropTable('contacts');
    await queryInterface.dropTable('groupes');
  }
};
