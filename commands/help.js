import { Markup } from "telegraf";

const helpCommand = async (ctx) => {
  const helpMessage = `
*Bantuan Bot Keuangan* 🤖

Selamat datang! Bot ini adalah asisten keuangan pribadimu yang canggih. Berikut adalah semua fitur yang bisa kamu gunakan:

*✍️ Mencatat Transaksi*
Cara tercepat untuk mencatat adalah dengan mengirim pesan langsung:

•  *Pemasukan:*
   \`+ kategori jumlah [deskripsi]\`
   Contoh: \`+ gaji 5000000 Gaji bulanan\`

•  *Pengeluaran:*
   \`- kategori jumlah [deskripsi]\`
   Contoh: \`- makan 25000 Nasi goreng\`

_Bot akan memvalidasi kategorimu dan akan memberikan saran jika ada salah ketik._

*📊 Perintah Laporan & Analisis*
Dapatkan wawasan mendalam tentang keuanganmu:

• \`/today\` - Laporan detail transaksi hari ini.
• \`/month\` - Laporan detail untuk bulan ini (default), atau gunakan \`/month [bln] [thn]\`.
• \`/year\` - Laporan ringkasan per bulan untuk tahun ini (default), atau gunakan \`/year [thn]\`.
• \`/summary\` - Grafik Pie Chart pengeluaran bulan ini beserta analisis budget.
• \`/summary [bln] [thn] \` - Grafik Pie Chart pengeluaran budget.
• \`/category\` - Menampilkan menu interaktif semua kategorimu, atau gunakan \`/category [nama]\` untuk laporan spesifik.
• \`/report [tgl_mulai] [tgl_akhir]\` - Laporan untuk rentang tanggal kustom (format: DD/MM/YYYY).

*🎯 Tujuan & Budget*
Rencanakan keuanganmu untuk masa depan:

• \`/budget [jumlah]\` - Menetapkan/mengganti budget bulan ini.
• \`/budget +[jumlah]\` - Menambah budget yang ada.
• \`/budget -[jumlah]\` - Mengurangi budget yang ada.

• \`/goal list\` - Melihat semua progres tujuan tabunganmu.
• \`/goal tambah [nama] [target]\` - Membuat tujuan tabungan baru.
• \`/goal isi [nama] [jumlah]\` - Menambahkan progres ke tujuanmu.
• \`/goal hapus [nama]\` - Menghapus tujuan tabungan.

*⚙️ Mengelola Data*
Atur data dan otomatisasi bot sesuai kebutuhanmu:

• \`/edit\` - Menampilkan menu untuk mengubah 5 transaksi terakhir.
• \`/delete\` - Menu interaktif atau gunakan sub-perintah: \`/delete today\`, \`/delete yesterday\`, \`/delete all\`.
• \`/recurring list\` - Melihat semua aturan transaksi berulang.
• \`/recurring hapus [id]\` - Menghapus aturan berulang.
• \`/recurring [+/-] kat jml tgl [desc]\` - Menambah aturan baru.
   Contoh: \`/recurring - wifi 350000 5 Tagihan bulanan\`

*📁 Ekspor Data*
• \`/export [format]\` - Ekspor semua data transaksimu ke dalam sebuah file. Format yang tersedia: \`excel\` atau \`pdf\`.

*🤖 Fitur Otomatis*
Bot ini bekerja untukmu di belakang layar:

• *Transaksi Berulang:* Semua aturan dari \`/recurring\` akan otomatis tercatat pada tanggalnya setiap pagi.
• *Notifikasi Budget:* Kamu akan menerima peringatan otomatis jika total pengeluaran bulananmu sudah mencapai 80% dari budget.

*📌 Perintah Dasar*
• \`/menu\` - Menampilkan dashboard utama bot.
• \`/start\` - Menampilkan pesan selamat datang.
• \`/help\` - Menampilkan pesan bantuan ini.
  `;

  await ctx.replyWithMarkdown(
    helpMessage,
    Markup.inlineKeyboard([
      [{ text: "Buka Menu Utama", callback_data: "back_to_main_menu" }],
    ])
  );
};

export default helpCommand;
