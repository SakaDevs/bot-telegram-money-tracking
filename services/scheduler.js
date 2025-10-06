import cron from "node-cron";
import { Op } from "sequelize";
import RecurringTransaction from "../models/Reccuring.js";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

const checkAndRunRecurringTransactions = async (bot) => {
  console.log("Scheduler is running, checking for due transactions...");
  const today = new Date();
  const dayOfMonth = today.getDate();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const dueTransactions = await RecurringTransaction.findAll({
      where: {
        dayOfMonth: dayOfMonth,
        isActive: true,
        [Op.or]: [
          { lastExecuted: null },
          { lastExecuted: { [Op.lt]: startOfDay } },
        ],
      },
    });

    for (const t of dueTransactions) {
      const model = t.type === "income" ? Income : Expense;
      await model.create({
        userId: t.userId,
        category: t.category,
        amount: t.amount,
        description: t.description,
      });

      await t.update({ lastExecuted: new Date() });

      const sign = t.type === "income" ? "+" : "-";
      const message = `🔔 Transaksi berulang otomatis tercatat:\n${sign} ${
        t.category
      } Rp${t.amount.toLocaleString("id-ID")}`;
      bot.telegram
        .sendMessage(t.userId, message)
        .catch((err) =>
          console.error(`Failed to send notification to user ${t.userId}`, err)
        );
    }
    if (dueTransactions.length > 0) {
      console.log(
        `Successfully processed ${dueTransactions.length} recurring transactions.`
      );
    }
  } catch (error) {
    console.error("Error running scheduler:", error);
  }
};

const startScheduler = (bot) => {
  cron.schedule("0 9 * * *", () => checkAndRunRecurringTransactions(bot), {
    timezone: "Asia/Jakarta",
  });
  console.log(
    "Daily scheduler started. Will run every day at 9:00 AM Jakarta time."
  );
};

export default startScheduler;
