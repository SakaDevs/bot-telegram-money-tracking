import { Markup } from "telegraf";
import { Op } from "sequelize";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

const categoryCommand = async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const categoryName =
    parts.length > 1 ? parts.slice(1).join(" ").toLowerCase() : null;

  if (categoryName) {
    return showCategoryOptions(ctx, categoryName);
  } else {
    return showAllCategories(ctx);
  }
};

async function showAllCategories(ctx) {
  try {
    const incomeCats = await Income.findAll({
      where: { userId: ctx.from.id },
      attributes: ["category"],
      group: ["category"],
    });
    const expenseCats = await Expense.findAll({
      where: { userId: ctx.from.id },
      attributes: ["category"],
      group: ["category"],
    });

    const allCatNames = new Set([
      ...incomeCats.map((i) => i.category),
      ...expenseCats.map((e) => e.category),
    ]);

    if (allCatNames.size === 0) {
      return ctx.reply(
        "kamu belum memiliki transaksi dengan kategori apa pun."
      );
    }

    const sortedCategories = Array.from(allCatNames).sort();
    const buttons = sortedCategories.map((cat) => [
      Markup.button.callback(cat, `show_options_for_category_${cat}`),
    ]);

    await ctx.reply(
      "Pilih kategori yang ingin kamu lihat:",
      Markup.inlineKeyboard(buttons)
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Gagal mengambil daftar kategori.");
  }
}

async function showCategoryOptions(ctx, categoryName) {
  await ctx.reply(`Pilih jenis transaksi untuk kategori "*${categoryName}*":`, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Pemasukan 📈",
            callback_data: `paginate_income_${categoryName}_1`,
          },
          {
            text: "Pengeluaran 📉",
            callback_data: `paginate_expense_${categoryName}_1`,
          },
        ],
      ],
    },
  });
}

export default categoryCommand;
