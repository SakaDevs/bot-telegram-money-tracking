import Goal from "../models/Goal.js";
import { Markup } from "telegraf";

const goalCommand = async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const subCommand = parts[1] || "list";

  switch (subCommand) {
    case "tambah":
      return addGoal(ctx);
    case "isi":
      return fillGoal(ctx);
    case "list":
      return listGoals(ctx);
    case "hapus":
      return deleteGoal(ctx);
    default:
      return ctx.reply(
        "Perintah tidak dikenal. Gunakan: /goal [tambah|isi|list|hapus]"
      );
  }
};

async function addGoal(ctx) {
  const parts = ctx.message.text.split(" ");
  if (parts.length < 4) {
    return ctx.reply(
      "Format salah.\nGunakan: /goal tambah [nama_tujuan] [jumlah_target]"
    );
  }
  const name = parts[2];
  const targetAmount = parseFloat(parts[3].replace(/[,.]/g, ""));

  if (isNaN(targetAmount) || targetAmount <= 0) {
    return ctx.reply("Jumlah target tidak valid.");
  }

  try {
    await Goal.create({ userId: ctx.from.id, name, targetAmount });
    ctx.reply(
      `✅ Tujuan baru "${name}" dengan target Rp${targetAmount.toLocaleString(
        "id-ID"
      )} berhasil dibuat!`
    );
  } catch (error) {
    ctx.reply("Gagal membuat tujuan baru.");
  }
}

async function fillGoal(ctx) {
  const parts = ctx.message.text.split(" ");
  if (parts.length < 4) {
    return ctx.reply(
      "Format salah.\nGunakan: /goal isi [nama_tujuan] [jumlah]"
    );
  }
  const name = parts[2];
  const amount = parseFloat(parts[3].replace(/[,.]/g, ""));

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply("Jumlah isian tidak valid.");
  }

  try {
    const goal = await Goal.findOne({
      where: { userId: ctx.from.id, name: name, isCompleted: false },
    });
    if (!goal) {
      return ctx.reply(`Tujuan "${name}" tidak ditemukan atau sudah selesai.`);
    }

    const newAmount = goal.currentAmount + amount;
    await goal.update({ currentAmount: newAmount });

    let replyMessage = `Berhasil mengisi Rp${amount.toLocaleString(
      "id-ID"
    )} ke tujuan "${name}".\n\n`;
    if (newAmount >= goal.targetAmount) {
      await goal.update({ isCompleted: true });
      replyMessage += `SELAMAT! Tujuanmu tercapai!`;
    } else {
      const percentage = ((newAmount / goal.targetAmount) * 100).toFixed(1);
      replyMessage += `Progres: ${percentage}% (Rp${newAmount.toLocaleString(
        "id-ID"
      )} / Rp${goal.targetAmount.toLocaleString("id-ID")})`;
    }
    ctx.reply(replyMessage);
  } catch (error) {
    ctx.reply("Gagal mengisi tujuan.");
  }
}

async function listGoals(ctx) {
  const goals = await Goal.findAll({ where: { userId: ctx.from.id } });
  if (goals.length === 0) {
    return ctx.reply(
      "Kamu belum memiliki tujuan keuangan. Buat dengan `/goal tambah`."
    );
  }

  let message = "*Goals Keuanganmu:*\n\n";
  goals.forEach((g) => {
    const percentage = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
    const progressBar = createProgressBar(percentage);

    message += `*${g.name}* ${g.isCompleted ? "✅ (Selesai)" : ""}\n`;
    message += `\`${progressBar}\` ${percentage.toFixed(1)}%\n`;
    message += `Rp${g.currentAmount.toLocaleString(
      "id-ID"
    )} / Rp${g.targetAmount.toLocaleString("id-ID")}\n\n`;
  });
  ctx.replyWithMarkdown(message);
}

async function deleteGoal(ctx) {
  const parts = ctx.message.text.split(" ");
  if (parts.length < 3) {
    return ctx.reply("Format salah.\nGunakan: /goal hapus [nama_tujuan]");
  }
  const name = parts.slice(2).join(" ");

  const deleted = await Goal.destroy({
    where: { name: name, userId: ctx.from.id },
  });
  if (deleted > 0) {
    ctx.reply(`✅ Tujuan "${name}" berhasil dihapus.`);
  } else {
    ctx.reply(`❌ Tujuan "${name}" tidak ditemukan.`);
  }
}

function createProgressBar(percentage) {
  const totalChars = 10;
  const filledChars = Math.round((percentage / 100) * totalChars);
  const emptyChars = totalChars - filledChars;
  return "█".repeat(filledChars) + "░".repeat(emptyChars);
}

export default goalCommand;
