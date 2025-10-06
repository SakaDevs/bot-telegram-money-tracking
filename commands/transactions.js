import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import stringSimilarity from "string-similarity";
import { formatDate } from "../utils/formatter.js";
const validIncomeCategories = ["gaji", "bonus", "hadiah", "lainnya"];
const validExpenseCategories = [
  "makan",
  "transport",
  "belanja",
  "hiburan",
  "tagihan",
  "lainnya",
];

const transactionHandler = async (ctx) => {
  if (!ctx.message.text) return;
  const text = ctx.message.text;

  if (text.startsWith("/")) return;

  const regex = /^([+-])\s*(\w+)\s+([\d.,]+)\s*(.*)/;
  const match = text.match(regex);

  if (match) {
    const sign = match[1];
    const categoryInput = match[2].toLowerCase();
    const amountStr = match[3].replace(/,/g, "");
    const amount = parseFloat(amountStr);
    const description = match[4] || null;

    if (isNaN(amount)) {
      return ctx.reply("Harga tidak valid!");
    }

    const validCategories =
      sign === "+" ? validIncomeCategories : validExpenseCategories;
    if (!validCategories.includes(categoryInput)) {
      const matches = stringSimilarity.findBestMatch(
        categoryInput,
        validCategories
      );
      const bestMatch = matches.bestMatch;

      if (bestMatch.rating > 0.6) {
        return ctx.reply(
          `❌ Kategori '${match[2]}' tidak ditemukan.\n\n` +
            `Mungkin maksud Anda '${bestMatch.target}'? Coba ulangi perintah dengan kategori yang benar.`
        );
      } else {
        return ctx.reply(
          `❌ Kategori '${match[2]}' tidak valid.\n\n` +
            `Gunakan salah satu dari: ${validCategories.join(", ")}`
        );
      }
    }
    // --- AKHIR LOGIKA VALIDASI ---

    try {
      const now = new Date();
      const timestamp = now.toLocaleString("id-ID", {timeZone: 'Asia/Jakarta'});

      if (sign === "-") {
        await Expense.create({
          userId: ctx.from.id,
          category: categoryInput,
          amount: amount,
          description: description,
        });

        return ctx.reply(
          `✅ Pengeluaran dicatat: ${categoryInput} sebesar Rp${amount.toLocaleString(
            "id-ID"
          )}\n` + `Dicatat pada: ${timestamp}`
        );
      } else if (sign === "+") {
        await Income.create({
          userId: ctx.from.id,
          category: categoryInput,
          amount: amount,
          description: description,
        });

        return ctx.reply(
          `✅ Pemasukan dicatat: ${categoryInput} sebesar Rp${amount.toLocaleString(
            "id-ID"
          )}\n` + `Dicatat pada: ${timestamp}`
        );
      }
    } catch (error) {
      console.error("Gagal menyimpan via message:", error);
      return ctx.reply("Terjadi kesalahan saat menyimpan data.");
    }
  }
};

export default transactionHandler;
