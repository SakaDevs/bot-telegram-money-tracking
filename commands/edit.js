// commands/edit.js
import { Markup } from "telegraf";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

const editCommand = async (ctx) => {
  try {
    const lastIncomes = await Income.findAll({
      where: { userId: ctx.from.id },
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    const lastExpenses = await Expense.findAll({
      where: { userId: ctx.from.id },
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    const allTransactions = [...lastIncomes, ...lastExpenses]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    if (allTransactions.length === 0) {
      return ctx.reply("Kamu belum punya transaksi untuk diedit.");
    }

    const buttons = allTransactions.map((t) => {
      const isIncome = t.constructor.name === "Income";
      const sign = isIncome ? "+" : "-";
      const type = isIncome ? "income" : "expense";
      const text = `${sign} ${t.category}: Rp${t.amount.toLocaleString(
        "id-ID"
      )}`;
      const callback_data = `edit_${type}_${t.id}`;
      return [Markup.button.callback(text, callback_data)];
    });

    buttons.push([Markup.button.callback("❌ Batal", "edit_cancel_initial")]);

    await ctx.reply(
      "Pilih transaksi yang ingin kamu edit:",
      Markup.inlineKeyboard(buttons)
    );
  } catch (error) {
    console.error("Gagal command /edit:", error);
    ctx.reply("Maaf, terjadi kesalahan.");
  }
};

export default editCommand;
