import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Expense = sequelize.define("Expense", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Kolom untuk kategori pengeluaran (makan, transport, dll)
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Kolom untuk jumlah pengeluaran
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // Kolom untuk deskripsi (tidak wajib diisi)
  description: {
    type: DataTypes.STRING,
    allowNull: true, // Boleh kosong
  },
});

export default Expense
