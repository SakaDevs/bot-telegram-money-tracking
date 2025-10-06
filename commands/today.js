import { Op } from "sequelize";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

const todayCommand = async (ctx) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [budget, incomes, expenses] = await Promise.all([
      Budget.findOne({
        where: { userId: ctx.from.id, month: currentMonth, year: currentYear },
      }),
      Income.findAll({
        where: {
          userId: ctx.from.id,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
        order: [["createdAt", "ASC"]],
      }),
      Expense.findAll({
        where: {
          userId: ctx.from.id,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
        order: [["createdAt", "ASC"]],
      }),
    ]);

    if (incomes.length === 0 && expenses.length === 0) {
      return ctx.reply("Belum ada transaksi yang tercatat hari ini.");
    }

    let message = `*Laporan Transaksi Hari Ini*\n_(${startOfDay.toLocaleDateString(
      "id-ID",
      { dateStyle: "full" }
    )})_\n\n`;
    let totalIncome = 0;
    let totalExpense = 0;

    if (incomes.length > 0) {
      message += "*Pemasukan:*\n";
      incomes.forEach((income) => {
        const timestamp = income.createdAt.toLocaleString("id-ID");
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
        const timestamp = expense.createdAt.toLocaleString("id-ID");
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

    if (budget && budget.amount > 0) {
      const totalExpenseMonth = await Expense.sum("amount", {
        where: {
          userId: ctx.from.id,
          createdAt: {
            [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
            [Op.lt]: new Date(currentYear, currentMonth, 1),
          },
        },
      });

      const percentage = ((totalExpenseMonth / budget.amount) * 100).toFixed(1);
      message += `*Progres Budget Bulan Ini:*\n`;
      message += `Rp${(totalExpenseMonth || 0).toLocaleString(
        "id-ID"
      )} / Rp${budget.amount.toLocaleString("id-ID")} (${percentage}%)\n\n`;
    }

    const netChange = totalIncome - totalExpense;
    const sign = netChange >= 0 ? "+" : "-";
    message += `*Perubahan Uang Hari Ini: ${sign}Rp${Math.abs(
      netChange
    ).toLocaleString("id-ID")}*`;

    ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error("Gagal mengambil laporan harian:", error);
    ctx.reply("Maaf, terjadi kesalahan saat mengambil laporan.");
  }
};

export default todayCommand;
