import cron from "node-cron";
import { Op } from "sequelize";
import RecurringTransaction from "../models/Reccuring.js";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

function getJakartaTime() {
  const now = new Date();
  const WIB_OFFSET = 7 * 60;
  const serverOffset = now.getTimezoneOffset();
  return new Date(now.getTime() + (WIB_OFFSET + serverOffset) * 60 * 1000);
}

const checkAndRunRecurringTransactions = async (bot) => {
  console.log("Scheduler is running, checking for due transactions...");
  const nowInJakarta = getJakartaTime();
  const dayOfMonth = nowInJakarta.getDate();

  const startOfDay = new Date(nowInJakarta);
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
    console.error("Error running recurring scheduler:", error);
  }
};

const checkBudgetAlerts = async (bot) => {
  console.log("Checking for budget alerts...");
  const nowInJakarta = getJakartaTime();
  const currentMonth = nowInJakarta.getMonth() + 1;
  const currentYear = nowInJakarta.getFullYear();

  try {
    const budgetsToAlert = await Budget.findAll({
      where: {
        month: currentMonth,
        year: currentYear,
        isAlertSent: false,
        amount: { [Op.gt]: 0 },
      },
    });

    for (const budget of budgetsToAlert) {
      const totalExpense = await Expense.sum("amount", {
        where: {
          userId: budget.userId,
          createdAt: {
            [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
            [Op.lt]: new Date(currentYear, currentMonth, 1),
          },
        },
      });

      if (totalExpense) {
        const percentage = (totalExpense / budget.amount) * 100;
        if (percentage >= 80) {
          const message = `🔔 *Peringatan Budget!* 🔔\n\nPengeluaranmu bulan ini sudah mencapai *${percentage.toFixed(
            1
          )}%* dari budget.\n\nTotal Pengeluaran: Rp${totalExpense.toLocaleString(
            "id-ID"
          )}\nBudget: Rp${budget.amount.toLocaleString("id-ID")}`;
          bot.telegram
            .sendMessage(budget.userId, message, { parse_mode: "Markdown" })
            .catch((err) =>
              console.error(
                `Failed to send alert to user ${budget.userId}`,
                err
              )
            );
          await budget.update({ isAlertSent: true });
        }
      }
    }
    if (budgetsToAlert.length > 0) {
      console.log(`Checked ${budgetsToAlert.length} budgets for alerts.`);
    }
  } catch (error) {
    console.error("Error checking budget alerts:", error);
  }
};

const startScheduler = (bot) => {
  cron.schedule(
    "0 9 * * *",
    () => {
      checkAndRunRecurringTransactions(bot);
      checkBudgetAlerts(bot);
    },
    {
      timezone: "Asia/Jakarta",
    }
  );
  console.log(
    "Daily scheduler started. Will run every day at 9:00 AM Jakarta time."
  );
};

export default startScheduler;
