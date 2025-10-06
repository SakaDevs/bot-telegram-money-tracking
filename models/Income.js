// models/Income.js
import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Income = sequelize.define("Income", {
  userId: {
    type: DataTypes.INTEGER,
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
});

export default Income;
