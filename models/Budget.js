
import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Budget = sequelize.define('Budget', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'month', 'year']
    }
  ]
});

export default Budget;