import { Op } from "sequelize";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

const monthCommand = async (ctx) => {
  try {
    const parts = ctx.message.text.split(" ");
    let monthInput, yearInput;

    if (parts.length === 1) {
      const now = new Date();
      monthInput = now.getMonth() + 1;
      yearInput = now.getFullYear();
    } else if (parts.length >= 3) {
      monthInput = parseInt(parts[1], 10);
      yearInput = parseInt(parts[2], 10);

      if (isNaN(monthInput) || monthInput < 1 || monthInput > 12) {
        return ctx.reply(
          "Bulan tidak valid. Harap masukkan angka antara 1 dan 12."
        );
      }
      if (isNaN(yearInput)) {
        return ctx.reply("Tahun tidak valid. Harap masukkan angka.");
      }
      if (yearInput < 100) {
        yearInput += 2000;
      }
    } else {
      return ctx.reply(
        "Format salah. Gunakan:\n/month (untuk bulan ini)\n/month [bulan] [tahun] (untuk bulan spesifik)"
      );
    }

    const monthIndex = monthInput - 1;
    const startOfMonth = new Date(yearInput, monthIndex, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(yearInput, monthIndex + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const monthName = monthNames[monthIndex];

    const [budget, incomes, expenses] = await Promise.all([
      Budget.findOne({
        where: { userId: ctx.from.id, month: monthInput, year: yearInput },
      }),
      Income.findAll({
        where: {
          userId: ctx.from.id,
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
        },
        order: [["createdAt", "ASC"]],
      }),
      Expense.findAll({
        where: {
          userId: ctx.from.id,
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
        },
        order: [["createdAt", "ASC"]],
      }),
    ]);

    if (incomes.length === 0 && expenses.length === 0) {
      return ctx.reply(
        `Belum ada transaksi yang tercatat di bulan ${monthName} ${yearInput}.`
      );
    }

    let message = `*Laporan Transaksi Bulan ${monthName} ${yearInput}*\n\n`;
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
      const percentage = ((totalExpense / budget.amount) * 100).toFixed(1);
      message += `*Progres Budget Bulanan:*\n`;
      message += `Rp${totalExpense.toLocaleString(
        "id-ID"
      )} / Rp${budget.amount.toLocaleString("id-ID")} (${percentage}%)\n\n`;
    }

    const netChange = totalIncome - totalExpense;
    const sign = netChange >= 0 ? "+" : "-";
    message += `*Perubahan Uang Bulan Ini: ${sign}Rp${Math.abs(
      netChange
    ).toLocaleString("id-ID")}*`;

    ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error("Gagal mengambil laporan bulanan:", error);
    ctx.reply("Maaf, terjadi kesalahan saat mengambil laporan.");
  }
};

export default monthCommand;
