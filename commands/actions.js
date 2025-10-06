import { Markup } from "telegraf";
import { Op } from "sequelize";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import menuCommand from "./menu.js";
import categoryCommand from "./category.js";
import { formatDate } from "../utils/formatter.js";

const ITEMS_PER_PAGE = 5;

const sendPaginatedReport = async (ctx, type, category, page) => {
  await ctx.answerCbQuery();
  const pageNumber = parseInt(page, 10);
  const offset = (pageNumber - 1) * ITEMS_PER_PAGE;
  const model = type === "income" ? Income : Expense;
  const title = type === "income" ? "Pemasukan" : "Pengeluaran";
  const whereClause = { userId: ctx.from.id };
  if (category) {
    whereClause.category = category;
  }
  try {
    await ctx.deleteMessage();
    const { count, rows } = await model.findAndCountAll({
      where: whereClause,
      limit: ITEMS_PER_PAGE,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });
    if (count === 0) {
      const catText = category ? ` dengan kategori "${category}"` : "";
      return await ctx.reply(
        `Anda belum memiliki data ${title.toLowerCase()}${catText}.`,
        Markup.inlineKeyboard([
          [{ text: "⬅️ Kembali", callback_data: "show_report_from_text" }],
        ])
      );
    }
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    const catText = category ? ` (Kategori: *${category}*)` : "";
    let message = `*Laporan Semua ${title}*${catText}\n(Halaman ${pageNumber}/${totalPages})\n\n`;
    rows.forEach((item) => {
      const timestamp = formatDate(item.createdAt);
      const sign = type === "income" ? "+" : "-";
      const descriptionText = item.description
        ? `\n    └ _${item.description}_`
        : "";
      message += `  ${timestamp} | ${sign} ${
        item.category
      }: Rp${item.amount.toLocaleString("id-ID")}${descriptionText}\n`;
    });
    const paginationButtons = [];
    const baseCallback = `paginate_${type}_${category || "all"}`;
    if (pageNumber > 1) {
      paginationButtons.push(
        Markup.button.callback(
          "⬅️ Sebelumnya",
          `${baseCallback}_${pageNumber - 1}`
        )
      );
    }
    if (pageNumber < totalPages) {
      paginationButtons.push(
        Markup.button.callback(
          "Selanjutnya ➡️",
          `${baseCallback}_${pageNumber + 1}`
        )
      );
    }
    await ctx.replyWithMarkdown(message, {
      reply_markup: {
        inline_keyboard: [
          paginationButtons,
          [
            {
              text: "⬅️ Kembali ke Menu Laporan",
              callback_data: "show_report_from_text",
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error(error);
    await ctx.reply(`Gagal mengambil data ${title.toLowerCase()}.`);
  }
};

export const showReportAction = async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption(
    "Pilih jenis laporan yang ingin Anda lihat (semua kategori):",
    Markup.inlineKeyboard([
      [
        { text: "Pengeluaran 📉", callback_data: "paginate_expense_all_1" },
        { text: "Pemasukan 📈", callback_data: "paginate_income_all_1" },
      ],
      [
        {
          text: "⬅️ Kembali ke Menu Utama",
          callback_data: "back_to_main_menu",
        },
      ],
    ])
  );
};

export const showReportFromTextAction = async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  await ctx.reply(
    "Pilih jenis laporan yang ingin Anda lihat (semua kategori):",
    Markup.inlineKeyboard([
      [
        { text: "Pengeluaran 📉", callback_data: "paginate_expense_all_1" },
        { text: "Pemasukan 📈", callback_data: "paginate_income_all_1" },
      ],
      [
        {
          text: "⬅️ Kembali ke Menu Utama",
          callback_data: "back_to_main_menu",
        },
      ],
    ])
  );
};

export const paginatedReportAction = async (ctx) => {
  const type = ctx.match[1];
  const category = ctx.match[2] === "all" ? null : ctx.match[2];
  const page = ctx.match[3];
  await sendPaginatedReport(ctx, type, category, page);
};

export const showCategoryOptionsAction = async (ctx) => {
  const categoryName = ctx.match[1];
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `Pilih jenis transaksi untuk kategori "*${categoryName}*":`,
    {
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
          [
            {
              text: "⬅️ Kembali ke Daftar Kategori",
              callback_data: "back_to_category_list",
            },
          ],
        ],
      },
    }
  );
};

export const backToMainMenuAction = async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  return menuCommand(ctx);
};

export const deleteAction = async (ctx) => {
  const type = ctx.match[1];
  const transactionId = parseInt(ctx.match[2], 10);
  try {
    const model = type === "expense" ? Expense : Income;
    const deletedRows = await model.destroy({
      where: { id: transactionId, userId: ctx.from.id },
    });
    if (deletedRows > 0) {
      await ctx.editMessageText("✅ Transaksi berhasil dihapus.");
    } else {
      await ctx.editMessageText(
        "❌ Gagal menghapus. Transaksi tidak ditemukan."
      );
    }
  } catch (error) {
    await ctx.editMessageText("Maaf, terjadi kesalahan saat menghapus.");
  }
};

export const deleteCancelAction = async (ctx) => {
  await ctx.editMessageText("Aksi dibatalkan.");
};

export const confirmDeleteTodayAction = async (ctx) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  try {
    const deletedIncomes = await Income.destroy({
      where: {
        userId: ctx.from.id,
        createdAt: { [Op.between]: [startOfDay, endOfDay] },
      },
    });
    const deletedExpenses = await Expense.destroy({
      where: {
        userId: ctx.from.id,
        createdAt: { [Op.between]: [startOfDay, endOfDay] },
      },
    });
    await ctx.editMessageText(
      `✅ Berhasil menghapus ${
        deletedIncomes + deletedExpenses
      } transaksi hari ini.`
    );
  } catch (error) {
    await ctx.editMessageText("❌ Gagal menghapus data hari ini.");
  }
};

export const confirmDeleteYesterdayAction = async (ctx) => {
  const yesterdayStart = new Date();
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date();
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);
  try {
    const deletedIncomes = await Income.destroy({
      where: {
        userId: ctx.from.id,
        createdAt: { [Op.between]: [yesterdayStart, yesterdayEnd] },
      },
    });
    const deletedExpenses = await Expense.destroy({
      where: {
        userId: ctx.from.id,
        createdAt: { [Op.between]: [yesterdayStart, yesterdayEnd] },
      },
    });
    await ctx.editMessageText(
      `✅ Berhasil menghapus ${
        deletedIncomes + deletedExpenses
      } transaksi kemarin.`
    );
  } catch (error) {
    await ctx.editMessageText("❌ Gagal menghapus data kemarin.");
  }
};

export const confirmDeleteAllAction = async (ctx) => {
  try {
    await Income.destroy({ where: { userId: ctx.from.id } });
    await Expense.destroy({ where: { userId: ctx.from.id } });
    await ctx.editMessageText(
      "✅ Semua data transaksi Anda telah berhasil dihapus secara permanen."
    );
  } catch (error) {
    await ctx.editMessageText(
      "❌ Terjadi kesalahan saat menghapus semua data."
    );
  }
};

export const editAction = async (ctx) => {
  const type = ctx.match[1];
  const transactionId = parseInt(ctx.match[2], 10);
  await ctx.answerCbQuery();
  await ctx.scene.enter("editWizard", { type, transactionId });
};

export const editCancelInitialAction = async (ctx) => {
  await ctx.editMessageText("Aksi edit dibatalkan.");
};
