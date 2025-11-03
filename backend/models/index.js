'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

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

// Importar modelos TypeScript desde src/models
const LoyaltyPoint = require('../src/models/LoyaltyPoint')(sequelize, Sequelize.DataTypes);
const Badge = require('../src/models/Badge')(sequelize, Sequelize.DataTypes);
const UserBadge = require('../src/models/UserBadge')(sequelize, Sequelize.DataTypes);

// Importar modelos CMS
const StaticPage = require('./staticpage')(sequelize, Sequelize.DataTypes);
const Term = require('./term')(sequelize, Sequelize.DataTypes);
const Policy = require('./policy')(sequelize, Sequelize.DataTypes);
const Faq = require('./faq')(sequelize, Sequelize.DataTypes);

// Importar nuevos modelos avanzados
const PermissionGroup = require('../src/models/PermissionGroup')(sequelize, Sequelize.DataTypes);
const PermissionContext = require('../src/models/PermissionContext')(sequelize, Sequelize.DataTypes);
const PermissionPolicy = require('../src/models/PermissionPolicy')(sequelize, Sequelize.DataTypes);
const Quest = require('../src/models/Quest')(sequelize, Sequelize.DataTypes);
const Achievement = require('../src/models/Achievement')(sequelize, Sequelize.DataTypes);
const Level = require('../src/models/Level')(sequelize, Sequelize.DataTypes);
const Reward = require('../src/models/Reward')(sequelize, Sequelize.DataTypes);

db.LoyaltyPoint = LoyaltyPoint;
db.Badge = Badge;
db.UserBadge = UserBadge;

// Agregar modelos CMS al objeto db
db.StaticPage = StaticPage;
db.Term = Term;
db.Policy = Policy;
db.Faq = Faq;

// Agregar nuevos modelos al objeto db
db.PermissionGroup = PermissionGroup;
db.PermissionContext = PermissionContext;
db.PermissionPolicy = PermissionPolicy;
db.Quest = Quest;
db.Achievement = Achievement;
db.Level = Level;
db.Reward = Reward;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
