const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Subject = sequelize.define('Subject', {
  subjectId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subjectCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  subjectName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  requiredRoomType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'Subject',
  timestamps: false
});

module.exports = Subject; 