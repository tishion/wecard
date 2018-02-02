'use strict';

var Fs = require('fs');
var Path = require('path');
var Sequelize = require('sequelize');
var Config = require('../config/config.js');

var db = {};
var options = Config.database.options;
options.operatorsAliases = false;
options.define = {
  paranoid: true,
  defaultScope: {
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'deletedAt', 'version']
    }
  },
  getterMethods: {
    prune() {
      var obj = this.dataValues;
      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.deletedAt;
      delete obj.version;
      return obj;
    }
  }
};
var sequelize = new Sequelize(options);

var entityFolderName = Path.join(__dirname, 'entity');
Fs
  .readdirSync(entityFolderName)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](Path.join(entityFolderName, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;