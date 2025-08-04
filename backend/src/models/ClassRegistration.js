const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ClassRegistration = sequelize.define('ClassRegistration', {
  registrationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  registrationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'cancelled', 'completed']]
    }
  }
}, {
  tableName: 'ClassRegistration',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['classId', 'studentId']
    }
  ]
});

module.exports = ClassRegistration;