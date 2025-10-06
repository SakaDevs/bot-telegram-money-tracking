import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const RecurringTransaction = sequelize.define("RecurringTransaction", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("income", "expense"),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dayOfMonth: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastExecuted: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default RecurringTransaction;
