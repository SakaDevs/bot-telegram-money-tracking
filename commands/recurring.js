import RecurringTransaction from "../models/Reccuring.js";

const recurringCommand = async (ctx) => {
  const text = ctx.message.text;
  const parts = text.split(" ");

  // Coba deteksi format tambah yang baru: /recurring [+/-] [kat] [jml] [tgl] [desc]
  const addRegex =
    /^\/recurring\s+([+-])\s*(\w+)\s+([\d.,]+)\s+(\d{1,2})\s*(.*)/i;
  const addMatch = text.match(addRegex);

  if (addMatch) {
    return addRecurring(ctx, addMatch);
  }

  const subCommand = parts[1] || "list";

  switch (subCommand) {
    case "list":
      return listRecurring(ctx);
    case "delete":
      return deleteRecurring(ctx);
    default:
      return ctx.reply(
        "Format tidak dikenal.\nGunakan salah satu format di bawah:\n\n" +
          "`/recurring [+/-] kategori jumlah tgl`\n" +
          "`/recurring list`\n" +
          "`/recurring delete [ID]`",
        { parse_mode: "Markdown" }
      );
  }
};

async function addRecurring(ctx, match) {
  const sign = match[1];
  const category = match[2].toLowerCase();
  const amount = parseFloat(match[3].replace(/[,.]/g, ""));
  const dayOfMonth = parseInt(match[4], 10);
  const description = match[5] || null;

  if (dayOfMonth < 1 || dayOfMonth > 31) {
    return ctx.reply("Tanggal harus antara 1 dan 31.");
  }
  if (isNaN(amount)) {
    return ctx.reply("Jumlah yang Anda masukkan tidak valid.");
  }

  try {
    await RecurringTransaction.create({
      userId: ctx.from.id,
      type: sign === "+" ? "income" : "expense",
      category,
      amount,
      dayOfMonth,
      description,
    });
    ctx.reply(
      `✅ Aturan transaksi berulang berhasil ditambahkan! Akan dijalankan setiap tanggal ${dayOfMonth}.`
    );
  } catch (error) {
    console.error("Gagal menambah aturan berulang:", error);
    ctx.reply("Gagal menambahkan aturan berulang.");
  }
}

async function listRecurring(ctx) {
  const transactions = await RecurringTransaction.findAll({
    where: { userId: ctx.from.id, isActive: true },
  });
  if (transactions.length === 0) {
    return ctx.reply(
      "Kamu belum memiliki aturan transaksi berulang yang aktif."
    );
  }
  let message = "*Daftar Transaksi Anda Perbulan:*\n\n";
  transactions.forEach((t) => {
    const sign = t.type === "income" ? "+" : "-";
    message += `ID: \`${t.id}\` | Setiap tgl *${t.dayOfMonth}*\n`;
    message += `  ${sign} ${t.category}: Rp${t.amount.toLocaleString(
      "id-ID"
    )}\n`;
    if (t.description) message += `    └ _${t.description}_\n`;
    message += `\n`;
  });
  message += "Gunakan `/recurring delete [ID]` untuk menghapus.";
  ctx.replyWithMarkdown(message);
}

async function deleteRecurring(ctx) {
  const idToDelete = parseInt(ctx.message.text.split(" ")[2], 10);
  if (isNaN(idToDelete)) {
    return ctx.reply("Format salah. Gunakan: /recurring delete [ID]");
  }
  const deleted = await RecurringTransaction.destroy({
    where: { id: idToDelete, userId: ctx.from.id },
  });
  if (deleted > 0) {
    ctx.reply(`✅ Aturan berulang dengan ID ${idToDelete} berhasil dihapus.`);
  } else {
    ctx.reply(
      `❌ Aturan berulang dengan ID ${idToDelete} tidak ditemukan atau bukan milikmu.`
    );
  }
}

export default recurringCommand;
