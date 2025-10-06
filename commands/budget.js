import Budget from "../models/Budget.js";

const budgetCommand = async (ctx) => {
  const parts = ctx.message.text.split(' ');
  const amountStr = parts[1];

  if (!amountStr) {
    return ctx.reply('Format salah. Gunakan:\n/budget [jumlah]\n/budget +[jumlah]\n/budget -[jumlah]');
  }

  const isAddition = amountStr.startsWith('+');
  const isSubtraction = amountStr.startsWith('-');
  
  const numberStr = amountStr.replace(/^[+-]/, '').replace(/[,.]/g, '');
  const amountValue = parseFloat(numberStr);

  if (isNaN(amountValue) || amountValue < 0) {
    return ctx.reply('Jumlah budget tidak valid. Harap masukkan angka positif.');
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  try {
    const [budget, created] = await Budget.findOrCreate({
      where: {
        userId: ctx.from.id,
        month: currentMonth,
        year: currentYear,
      },
      defaults: {
        amount: 0,
      },
    });

    let newAmount = 0;
    let actionText = '';

    if (isAddition) {
      newAmount = budget.amount + amountValue;
      actionText = 'ditambah';
    } else if (isSubtraction) {
      newAmount = Math.max(0, budget.amount - amountValue);
      actionText = 'dikurangi';
    } else {
      newAmount = amountValue;
      actionText = 'ditetapkan';
    }

    await budget.update({ amount: newAmount });

    ctx.reply(`✅ Budget untuk bulan ini berhasil ${actionText} menjadi Rp${newAmount.toLocaleString('id-ID')}.`);

  } catch (error) {
    console.error("Gagal mengatur budget:", error);
    ctx.reply("Maaf, terjadi kesalahan saat menyimpan budget.");
  }
};

export default budgetCommand;