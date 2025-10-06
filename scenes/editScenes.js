import { Scenes, Markup } from "telegraf";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

const editScene = new Scenes.WizardScene(
  "editWizard",
  async (ctx) => {
    const { type, transactionId } = ctx.scene.state;
    const model = type === "income" ? Income : Expense;
    const transaction = await model.findByPk(transactionId);

    if (!transaction) {
      await ctx.reply("Transaksi tidak ditemukan.");
      return ctx.scene.leave();
    }

    ctx.scene.state.transaction = transaction;

    await ctx.reply(
      `Mengedit: ${type === "income" ? "+" : "-"} ${
        transaction.category
      } - Rp${transaction.amount.toLocaleString(
        "id-ID"
      )}\n\nApa yang ingin Anda ubah?`,
      Markup.inlineKeyboard([
        [Markup.button.callback("Kategori", "edit_category")],
        [Markup.button.callback("Jumlah", "edit_amount")],
        [Markup.button.callback("Deskripsi", "edit_description")],
        [Markup.button.callback("❌ Batal", "cancel_edit")],
      ])
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery) return;

    ctx.answerCbQuery();
    const choice = ctx.callbackQuery.data;

    if (choice === "cancel_edit") {
      await ctx.editMessageText("Pengeditan dibatalkan.");
      return ctx.scene.leave();
    }

    const fieldMap = {
      edit_category: "kategori",
      edit_amount: "jumlah",
      edit_description: "deskripsi",
    };

    const fieldToEdit = fieldMap[choice];
    ctx.scene.state.fieldToEdit = choice.split("_")[1];

    await ctx.editMessageText(
      `Baik, silakan masukkan ${fieldToEdit} yang baru:`
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) return;

    const newValue = ctx.message.text;
    const { transaction, fieldToEdit } = ctx.scene.state;

    if (fieldToEdit === "amount" && isNaN(parseFloat(newValue))) {
      await ctx.reply(
        "Jumlah tidak valid. Harap masukkan angka. Proses edit dibatalkan."
      );
      return ctx.scene.leave();
    }

    try {
      const updateData = {};
      updateData[fieldToEdit] =
        fieldToEdit === "amount" ? parseFloat(newValue) : newValue;

      await transaction.update(updateData);
      await ctx.reply("✅ Data berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal update:", error);
      await ctx.reply("Terjadi kesalahan saat memperbarui data.");
    }

    return ctx.scene.leave();
  }
);

export default editScene;
