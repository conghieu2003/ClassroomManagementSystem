const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Class = sequelize.define('Class', {
  classId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  classCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  className: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  studentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'cancelled', 'completed']]
    }
  }
}, {
  tableName: 'Class',
  timestamps: false
});

module.exports = Class; 