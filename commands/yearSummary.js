import { Op, fn, col } from "sequelize";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

const yearCommand = async (ctx) => {
  try {
    const parts = ctx.message.text.split(" ");
    let yearInput;

    if (parts.length === 1) {
      yearInput = new Date().getFullYear();
    } else {
      yearInput = parseInt(parts[1], 10);
      if (isNaN(yearInput)) {
        return ctx.reply("Tahun tidak valid. Gunakan: /year [tahun]");
      }
      if (yearInput < 100) {
        yearInput += 2000;
      }
    }

    await ctx.reply(
      `Sedang membuat laporan tahunan untuk ${yearInput}, mohon tunggu...`
    );

    const startOfYear = new Date(yearInput, 0, 1);
    const endOfYear = new Date(yearInput, 11, 31, 23, 59, 59, 999);

    const getMonthlyData = (model) => {
      return model.findAll({
        attributes: [
          [fn("strftime", "%m", col("createdAt")), "month"],
          [fn("SUM", col("amount")), "total_amount"],
        ],
        where: {
          userId: ctx.from.id,
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        group: ["month"],
        raw: true,
      });
    };

    const [incomesByMonth, expensesByMonth] = await Promise.all([
      getMonthlyData(Income),
      getMonthlyData(Expense),
    ]);

    const incomeMap = new Map(
      incomesByMonth.map((i) => [
        parseInt(i.month, 10),
        parseFloat(i.total_amount),
      ])
    );
    const expenseMap = new Map(
      expensesByMonth.map((e) => [
        parseInt(e.month, 10),
        parseFloat(e.total_amount),
      ])
    );

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    let message = `*Laporan Keuangan Tahunan ${yearInput}*\n\n`;
    let grandTotalIncome = 0;
    let grandTotalExpense = 0;

    for (let i = 0; i < 12; i++) {
      const monthNum = i + 1;
      const income = incomeMap.get(monthNum) || 0;
      const expense = expenseMap.get(monthNum) || 0;

      grandTotalIncome += income;
      grandTotalExpense += expense;

      if (income > 0 || expense > 0) {
        message += `*${monthNames[i]}*: \`+${income.toLocaleString(
          "id-ID"
        )} | -${expense.toLocaleString("id-ID")}\`\n`;
      }
    }

    message += `\n-----------------------------------\n`;
    message += `*Total Pemasukan Tahunan:*\n\`Rp${grandTotalIncome.toLocaleString(
      "id-ID"
    )}\`\n`;
    message += `*Total Pengeluaran Tahunan:*\n\`Rp${grandTotalExpense.toLocaleString(
      "id-ID"
    )}\`\n\n`;

    const netTotal = grandTotalIncome - grandTotalExpense;
    const sign = netTotal >= 0 ? "+" : "-";
    message += `*Pemasukan Bersih Tahun ${yearInput}:*\n*\`${sign}Rp${Math.abs(
      netTotal
    ).toLocaleString("id-ID")}\`*`;

    await ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error("Gagal membuat laporan tahunan:", error);
    ctx.reply("Maaf, terjadi kesalahan saat membuat laporan tahunan.");
  }
};

export default yearCommand;
