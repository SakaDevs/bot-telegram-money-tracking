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
      "Sedang membuat ringkasan visual, mohon tunggu sebentar..."
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [budget, expensesByCategory] = await Promise.all([
      Budget.findOne({
        where: { userId: ctx.from.id, month: currentMonth, year: currentYear },
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
      return ctx.reply(
        "Belum ada data pengeluaran bulan ini untuk dibuatkan ringkasan."
      );
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
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#C9CBCF",
              "#7CFFC4",
              "#F7464A",
              "#46BFBD",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `Distribusi Pengeluaran Bulan Ini`,
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

    let caption = `Berikut adalah ringkasan visual pengeluaranmu bulan ini.\n\n`;
    caption += `*Total Pengeluaran: Rp${totalExpense.toLocaleString(
      "id-ID"
    )}*\n`;

    if (budget && budget.amount > 0) {
      const percentage = ((totalExpense / budget.amount) * 100).toFixed(1);
      const remaining = budget.amount - totalExpense;
      caption += `*Budget Bulan Ini: Rp${budget.amount.toLocaleString(
        "id-ID"
      )}*\n\n`;
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
