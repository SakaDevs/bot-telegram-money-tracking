import { Markup } from "telegraf";
import { Op } from "sequelize";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

function getJakartaTime() {
  const now = new Date();
  const WIB_OFFSET = 7 * 60;
  const serverOffset = now.getTimezoneOffset();
  return new Date(now.getTime() + (WIB_OFFSET + serverOffset) * 60 * 1000);
}

const deleteCommand = async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const subCommand = parts[1];

  if (subCommand === "today") {
    return askDeleteConfirmation(ctx, "today");
  }
  if (subCommand === "yesterday") {
    return askDeleteConfirmation(ctx, "yesterday");
  }
  if (subCommand === "all") {
    return askDeleteConfirmation(ctx, "all");
  }

  return showInteractiveDeleteMenu(ctx);
};

async function askDeleteConfirmation(ctx, period) {
  let warningText = "";
  let callbackData = "";

  if (period === "today") {
    warningText = "Anda yakin ingin menghapus semua transaksi hari ini?";
    callbackData = "confirm_delete_today";
  } else if (period === "yesterday") {
    warningText = "Anda yakin ingin menghapus semua transaksi kemarin?";
    callbackData = "confirm_delete_yesterday";
  } else if (period === "all") {
    warningText =
      "🚨 *PERINGATAN KERAS* 🚨\n\nAnda yakin ingin menghapus **SEMUA** data transaksi Anda? Aksi ini **TIDAK BISA DIBATALKAN**.";
    callbackData = "confirm_delete_all";
  }

  await ctx.reply(warningText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ Ya, Saya Yakin", callback_data: callbackData }],
        [{ text: "❌ Tidak, Batalkan", callback_data: "delete_cancel" }],
      ],
    },
  });
}

async function showInteractiveDeleteMenu(ctx) {
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
      return ctx.reply("Kamu belum punya transaksi untuk dihapus.");
    }

    const buttons = allTransactions.map((t) => {
      const isIncome = t.constructor.name === "Income";
      const sign = isIncome ? "+" : "-";
      const type = isIncome ? "income" : "expense";
      const text = `${sign} ${t.category}: Rp${t.amount.toLocaleString(
        "id-ID"
      )}`;
      const callback_data = `delete_${type}_${t.id}`;
      return [Markup.button.callback(text, callback_data)];
    });
    buttons.push([Markup.button.callback("❌ Batal", "delete_cancel")]);

    await ctx.reply(
      "Pilih transaksi yang ingin kamu hapus (mode interaktif):",
      Markup.inlineKeyboard(buttons)
    );
  } catch (error) {
    console.error("Gagal command /delete interaktif:", error);
    ctx.reply("Maaf, terjadi kesalahan.");
  }
}

export default deleteCommand;
