import { Op } from "sequelize";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import { formatDate } from "../utils/formatter.js";

const yesterdayCommand = async (ctx) => {
  try {
    const now = new Date();
    const WIB_OFFSET = 7 * 60;
    const serverOffset = now.getTimezoneOffset();
    const nowInJakarta = new Date(
      now.getTime() + (WIB_OFFSET + serverOffset) * 60 * 1000
    );

    const yesterdayInJakarta = new Date(nowInJakarta);
    yesterdayInJakarta.setDate(yesterdayInJakarta.getDate() - 1);

    const startOfYesterday = new Date(yesterdayInJakarta);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterdayInJakarta);
    endOfYesterday.setHours(23, 59, 59, 999);

    const [incomes, expenses] = await Promise.all([
      Income.findAll({
        where: {
          userId: ctx.from.id,
          createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] },
        },
        order: [["createdAt", "ASC"]],
      }),
      Expense.findAll({
        where: {
          userId: ctx.from.id,
          createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] },
        },
        order: [["createdAt", "ASC"]],
      }),
    ]);

    if (incomes.length === 0 && expenses.length === 0) {
      return ctx.reply("Tidak ada transaksi yang tercatat kemarin.");
    }

    let message = `*Laporan Transaksi Kemarin*\n_(${yesterdayInJakarta.toLocaleDateString(
      "id-ID",
      { dateStyle: "full", timeZone: "Asia/Jakarta" }
    )})_\n\n`;
    let totalIncome = 0;
    let totalExpense = 0;

    if (incomes.length > 0) {
      message += "*Pemasukan:*\n";
      incomes.forEach((income) => {
        const timestamp = formatDate(income.createdAt);
        const descriptionText = income.description
          ? `\n    └ _${income.description}_`
          : "";
        message += `  ${timestamp} | + ${
          income.category
        }: Rp${income.amount.toLocaleString("id-ID")}${descriptionText}\n`;
        totalIncome += income.amount;
      });
      message += `*Total Pemasukan: Rp${totalIncome.toLocaleString(
        "id-ID"
      )}*\n\n`;
    }

    if (expenses.length > 0) {
      message += "*Pengeluaran:*\n";
      expenses.forEach((expense) => {
        const timestamp = formatDate(expense.createdAt);
        const descriptionText = expense.description
          ? `\n    └ _${expense.description}_`
          : "";
        message += `  ${timestamp} | - ${
          expense.category
        }: Rp${expense.amount.toLocaleString("id-ID")}${descriptionText}\n`;
        totalExpense += expense.amount;
      });
      message += `*Total Pengeluaran: Rp${totalExpense.toLocaleString(
        "id-ID"
      )}*\n\n`;
    }

    const netChange = totalIncome - totalExpense;
    const sign = netChange >= 0 ? "+" : "-";
    message += `*Perubahan Uang Kemarin: ${sign}Rp${Math.abs(
      netChange
    ).toLocaleString("id-ID")}*`;

    ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error("Gagal mengambil laporan kemarin:", error);
    ctx.reply("Maaf, terjadi kesalahan saat mengambil laporan.");
  }
};

export default yesterdayCommand;
