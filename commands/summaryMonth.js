import { Op, fn, col } from "sequelize";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

const summaryCommand = async (ctx) => {
  try {
    await ctx.reply(
      "⏳ Sedang membuat ringkasan visual, mohon tunggu sebentar..."
    );

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
        return ctx.reply("Bulan tidak valid. Harap masukkan angka antara 1 dan 12.");
      }
      if (isNaN(yearInput)) {
        return ctx.reply("Tahun tidak valid. Harap masukkan angka.");
      }
      if (yearInput < 100) {
        yearInput += 2000;
      }
    } else {
      return ctx.reply("Format salah. Gunakan:\n/summary (untuk bulan ini)\n/summary [bulan] [tahun]");
    }

    const monthIndex = monthInput - 1;
    const startOfMonth = new Date(yearInput, monthIndex, 1);
    const endOfMonth = new Date(yearInput, monthIndex + 1, 0, 23, 59, 59, 999);
    
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthName = monthNames[monthIndex];

    const [budget, expensesByCategory] = await Promise.all([
      Budget.findOne({
        where: { userId: ctx.from.id, month: monthInput, year: yearInput },
      }),
      Expense.findAll({
        attributes: ["category", [fn("SUM", col("amount")), "total_amount"]],
        where: {
          userId: ctx.from.id,
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
        },
        group: ["category"],
        raw: true,
      }),
    ]);

    if (expensesByCategory.length === 0) {
      return ctx.reply(`Belum ada data pengeluaran di bulan ${monthName} ${yearInput} untuk dibuatkan ringkasan.`);
    }

    const labels = expensesByCategory.map((item) => item.category);
    const data = expensesByCategory.map((item) => item.total_amount);

    const configuration = {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pengeluaran per Kategori",
            data: data,
            backgroundColor: [
              "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
              "#FF9F40", "#C9CBCF", "#7CFFC4", "#F7464A", "#46BFBD",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `Distribusi Pengeluaran - ${monthName} ${yearInput}`,
            font: { size: 24 },
          },
          legend: {
            position: "top",
          },
        },
      },
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    const totalExpense = data.reduce(
      (sum, value) => sum + parseFloat(value),
      0
    );

    let caption = `Berikut adalah ringkasan visual pengeluaranmu untuk *${monthName} ${yearInput}*.\n\n`;
    caption += `*Total Pengeluaran: Rp${totalExpense.toLocaleString("id-ID")}*\n`;

    if (budget && budget.amount > 0) {
      const percentage = ((totalExpense / budget.amount) * 100).toFixed(1);
      const remaining = budget.amount - totalExpense;
      caption += `*Budget Bulan Ini: Rp${budget.amount.toLocaleString("id-ID")}*\n\n`;
      caption += `Kamu telah menggunakan *${percentage}%* dari budgetmu.\n`;
      caption += `Sisa budget: *Rp${remaining.toLocaleString("id-ID")}*`;
    }

    await ctx.replyWithPhoto(
      { source: imageBuffer },
      { caption: caption, parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Gagal membuat summary:", error);
    ctx.reply("Maaf, terjadi kesalahan saat membuat ringkasan visual.");
  }
};

export default summaryCommand;