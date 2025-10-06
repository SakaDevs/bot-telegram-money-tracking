
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

const exportCommand = async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const format = parts[1]?.toLowerCase();

  if (!format) {
    return ctx.reply(
      "Format tidak valid. Gunakan:\n/export excel\n/export pdf"
    );
  }

  switch (format) {
    case "excel":
    case "csv":
      return exportToCsv(ctx);
    case "pdf":
      return exportToPdf(ctx);
    case "sheet":
      return ctx.reply(
        "Fitur ekspor ke Google Sheets masih dalam pengembangan. Coba /export excel untuk saat ini."
      );
    default:
      return ctx.reply("Format tidak dikenal. Gunakan 'excel' atau 'pdf'.");
  }
};

async function getAllTransactions(userId) {
  const incomes = await Income.findAll({ where: { userId }, raw: true });
  const expenses = await Expense.findAll({ where: { userId }, raw: true });

  const allTransactions = [
    ...incomes.map((i) => ({ ...i, Tipe: "Pemasukan" })),
    ...expenses.map((e) => ({ ...e, Tipe: "Pengeluaran" })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return allTransactions;
}

async function exportToCsv(ctx) {
  await ctx.reply("Sedang menyiapkan file Excel (CSV)...");
  try {
    const transactions = await getAllTransactions(ctx.from.id);
    if (transactions.length === 0)
      return ctx.reply("Tidak ada data untuk diekspor.");

    const fields = ["Tipe", "category", "amount", "description", "createdAt"];
    const opts = { fields, header: true };

    const parser = new Parser(opts);
    const csv = parser.parse(transactions);

    const now = new Date();
    const timestamp = now.toISOString().split("T")[0];
    const fileName = `Laporan_Keuangan_${ctx.from.first_name}_${timestamp}.csv`;

    await ctx.replyWithDocument(
      { source: Buffer.from(csv, "utf-8"), filename: fileName },
      { caption: "Berikut adalah file CSV dari semua data transaksimu." }
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Gagal membuat file CSV.");
  }
}

async function exportToPdf(ctx) {
  await ctx.reply(
    "Sedang membuat file PDF, ini mungkin butuh waktu lebih lama..."
  );
  try {
    const transactions = await getAllTransactions(ctx.from.id);
    if (transactions.length === 0)
      return ctx.reply("Tidak ada data untuk diekspor.");

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);
      const now = new Date();
      const timestamp = now.toISOString().split("T")[0];
      const fileName = `Laporan_Keuangan_${ctx.from.first_name}_${timestamp}.pdf`;

      await ctx.replyWithDocument(
        { source: pdfData, filename: fileName },
        { caption: "Berikut adalah file PDF dari semua data transaksimu." }
      );
    });

    doc
      .fontSize(18)
      .text(`Laporan Keuangan untuk ${ctx.from.first_name}`, {
        align: "center",
      });
    doc.moveDown();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      const date = new Date(t.createdAt).toLocaleString("id-ID");
      const sign = t.Tipe === "Pemasukan" ? "+" : "-";
      const amount = t.amount.toLocaleString("id-ID");

      doc.fontSize(10).text(`${date} | ${sign} ${t.category}: Rp${amount}`);
      if (t.description) {
        doc.fontSize(8).fillColor("grey").text(`   └ ${t.description}`);
      }
      doc.moveDown(0.5);

      if (t.Tipe === "Pemasukan") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    doc.moveDown();
    doc.fontSize(12).fillColor("black").text("--- Ringkasan ---");
    doc.text(`Total Pemasukan: Rp${totalIncome.toLocaleString("id-ID")}`);
    doc.text(`Total Pengeluaran: Rp${totalExpense.toLocaleString("id-ID")}`);

    doc.end();
  } catch (error) {
    console.error(error);
    ctx.reply("Gagal membuat file PDF.");
  }
}

export default exportCommand;
