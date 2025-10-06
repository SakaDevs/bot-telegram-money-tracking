import { Op } from "sequelize";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import { parse } from "date-fns";

const reportCommand = async (ctx) => {
    const parts = ctx.message.text.split(' ');
    if (parts.length < 3) {
        return ctx.reply('Format salah.\nGunakan: /report [tgl_mulai] [tgl_akhir]\nContoh: /report 01/10/2025 15/10/2025');
    }

    const startDateStr = parts[1];
    const endDateStr = parts[2];

    try {
        const startDate = parse(startDateStr, 'dd/MM/yyyy', new Date());
        startDate.setHours(0, 0, 0, 0);

        const endDate = parse(endDateStr, 'dd/MM/yyyy', new Date());
        endDate.setHours(23, 59, 59, 999);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return ctx.reply('Format tanggal tidak valid. Gunakan format DD/MM/YYYY.');
        }

        const [incomes, expenses] = await Promise.all([
            Income.findAll({
                where: { userId: ctx.from.id, createdAt: { [Op.between]: [startDate, endDate] }},
                order: [['createdAt', 'ASC']]
            }),
            Expense.findAll({
                where: { userId: ctx.from.id, createdAt: { [Op.between]: [startDate, endDate] }},
                order: [['createdAt', 'ASC']]
            })
        ]);

        if (incomes.length === 0 && expenses.length === 0) {
            return ctx.reply(`Tidak ada transaksi antara ${startDateStr} - ${endDateStr}.`);
        }

        const formattedStartDate = startDate.toLocaleDateString('id-ID', { dateStyle: 'long' });
        const formattedEndDate = endDate.toLocaleDateString('id-ID', { dateStyle: 'long' });
        let message = `*Laporan Kustom*\n_${formattedStartDate} - ${formattedEndDate}_\n\n`;
        let totalIncome = 0;
        let totalExpense = 0;

        if (incomes.length > 0) {
            message += "*Pemasukan:*\n";
            incomes.forEach((income) => {
                const timestamp = income.createdAt.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
                const descriptionText = income.description ? `\n    └ _${income.description}_` : '';
                message += `  ${timestamp} | + ${income.category}: Rp${income.amount.toLocaleString("id-ID")}${descriptionText}\n`;
                totalIncome += income.amount;
            });
            message += `*Total Pemasukan: Rp${totalIncome.toLocaleString("id-ID")}*\n\n`;
        }

        if (expenses.length > 0) {
            message += "*Pengeluaran:*\n";
            expenses.forEach((expense) => {
                const timestamp = expense.createdAt.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
                const descriptionText = expense.description ? `\n    └ _${expense.description}_` : '';
                message += `  ${timestamp} | - ${expense.category}: Rp${expense.amount.toLocaleString("id-ID")}${descriptionText}\n`;
                totalExpense += expense.amount;
            });
            message += `*Total Pengeluaran: Rp${totalExpense.toLocaleString("id-ID")}*\n\n`;
        }

        const netChange = totalIncome - totalExpense;
        const sign = netChange >= 0 ? "+" : "-";
        message += `*Perubahan Bersih: ${sign}Rp${Math.abs(netChange).toLocaleString("id-ID")}*`;

        ctx.replyWithMarkdown(message);

    } catch (error) {
        console.error("Gagal membuat laporan kustom:", error);
        ctx.reply("Maaf, terjadi kesalahan saat membuat laporan.");
    }
};

export default reportCommand;