const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ClassRoom = sequelize.define('ClassRoom', {
  roomId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  roomName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  building: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  roomType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['theory', 'practice', 'lab']]
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'available',
    validate: {
      isIn: [['available', 'maintenance', 'occupied']]
    }
  },
  notes: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'ClassRoom',
  timestamps: false
});

module.exports = ClassRoom;
