import { Telegraf, Scenes, session } from "telegraf";
import "dotenv/config";
import sequelize from "./database.js";
import categoryCommand from "./commands/category.js";

// Impor semua command
import menuCommand from "./commands/menu.js";
import todayCommand from "./commands/today.js";
import deleteCommand from "./commands/delete.js";
import monthCommand from "./commands/month.js";
import editCommand from "./commands/edit.js";
import helpCommand from "./commands/help.js";
import budgetCommand from "./commands/budget.js";
import summaryCommand from "./commands/summaryMonth.js";
import yearCommand from "./commands/yearSummary.js";
import recurringCommand from "./commands/recurring.js";
import goalCommand from "./commands/goal.js";
import reportCommand from "./commands/report.js";
import exportCommand from "./commands/export.js";
import yesterdayCommand from "./commands/yesterday.js";

// Impor semua action handler
import {
  showReportAction,
  paginatedReportAction,
  showCategoryOptionsAction,
  backToMainMenuAction,
  showReportFromTextAction,
  deleteAction,
  deleteCancelAction,
  confirmDeleteTodayAction,
  confirmDeleteYesterdayAction,
  confirmDeleteAllAction,
  editAction,
  editCancelInitialAction,
} from "./commands/actions.js";

// Impor handler untuk pesan +/-
import transactionHandler from "./commands/transactions.js";
// Impor scene untuk proses edit
import editScene from "./scenes/editScenes.js";
import { message } from "telegraf/filters";

const SakaBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Inisialisasi Scene dan Session
const stage = new Scenes.Stage([editScene]);
SakaBot.use(session());
SakaBot.use(stage.middleware());

// Pendaftaran Perintah (Commands)
SakaBot.start((ctx) => {
  ctx.reply("Halo selamat datang! Silakan gunakan /menu untuk memulai.");
});

SakaBot.on(message('text'), async (ctx, next) => {
  if (ctx.message.text.startsWith("/")) {
    return next();
  }
  const isHandled = await transactionHandler(ctx);
  if (!isHandled) {
    await ctx.reply(
      'Maaf, saya tidak mengerti maksud kamu nih. 😔\n\n' +
      'Ketik /help untuk melihat semua command yang ada.'
    );
  }
});

SakaBot.help(helpCommand);
SakaBot.command("menu", menuCommand);
SakaBot.command("today", todayCommand);
SakaBot.command("delete", deleteCommand);
SakaBot.command("month", monthCommand);
SakaBot.command("edit", editCommand);
SakaBot.command("budget", budgetCommand);
SakaBot.command("summary", summaryCommand);
SakaBot.command("year", yearCommand);
SakaBot.command("recurring", recurringCommand);
SakaBot.command("category", categoryCommand);
SakaBot.command("goal", goalCommand);
SakaBot.command("report", reportCommand);
SakaBot.command("export", exportCommand);
SakaBot.command("yesterday", yesterdayCommand);

// Pendaftaran Aksi Tombol (Actions)
SakaBot.action("show_report", showReportAction);
SakaBot.action("show_report_from_text", showReportFromTextAction);
SakaBot.action(/^paginate_(\w+)_([\w-]+)_(\d+)$/, paginatedReportAction);
SakaBot.action(/^show_options_for_category_(.+)$/, showCategoryOptionsAction);
SakaBot.action("back_to_main_menu", backToMainMenuAction);
SakaBot.action("back_to_category_list", (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
  ctx.message = { text: "/category" };
  categoryCommand(ctx);
});

SakaBot.action(/^delete_(\w+)_(\d+)$/, deleteAction);
SakaBot.action("delete_cancel", deleteCancelAction);
SakaBot.action("confirm_delete_today", confirmDeleteTodayAction);
SakaBot.action("confirm_delete_yesterday", confirmDeleteYesterdayAction);
SakaBot.action("confirm_delete_all", confirmDeleteAllAction);

SakaBot.action(/^edit_(\w+)_(\d+)$/, editAction);
SakaBot.action("edit_cancel_initial", editCancelInitialAction);

// Pendaftaran Handler Pesan Umum

// Fungsi untuk Menjalankan Bot
async function startBot() {
  try {
    await sequelize.sync();
    console.log("Koneksi Database Berhasil.");
    SakaBot.launch();
    console.log("Bot Berjalan...");
  } catch (error) {
    console.error("Gagal memulai bot:", error);
  }
}



startBot();
