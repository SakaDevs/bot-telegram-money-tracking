import { Markup } from "telegraf";

const helpCommand = async (ctx) => {
  const helpMessage = `
*Bantuan Lengkap Bot Keuangan* 🤖

Selamat datang! Bot ini adalah asisten keuangan pribadimu yang canggih. Berikut adalah semua fitur yang bisa kamu gunakan:

*✍️ Mencatat Transaksi (Cara Cepat)*
Gunakan format ini di chat biasa untuk input super cepat:

•  *Pemasukan:*
   \`+ kategori jumlah [deskripsi]\`
   Contoh: \`+ gaji 5000000 Gaji bulanan\`

•  *Pengeluaran:*
   \`- kategori jumlah [deskripsi]\`
   Contoh: \`- makan 25000 Nasi goreng\`

✨ *Pro Tip:* Kamu juga bisa mengirim foto struk dan tulis format di atas pada bagian *caption* untuk melampirkan bukti transaksi.

*📊 Perintah Laporan & Analisis*
Dapatkan wawasan mendalam tentang keuanganmu:

• \`/today\` - Laporan detail transaksi hari ini beserta progres budget.
• \`/month\` - Laporan detail bulan ini.
• \`/month [bln] [thn]\` - Laporan detail bulan & tahun spesifik (e.g., \`/month 10 2024\`).
• \`/year\` - Laporan ringkasan untuk tahun ini.
• \`/summary\` - Grafik Pie Chart pengeluaran bulan ini & analisis budget.
• \`/category\` - Menampilkan menu interaktif semua kategorimu.
• \`/category [nama]\` - Menampilkan laporan transaksi untuk kategori spesifik.

*⚙️ Mengelola Data & Pengaturan*
Atur data dan otomatisasi bot sesuai kebutuhanmu:

• \`/budget [jumlah]\` - Menetapkan/mengganti budget bulan ini.
• \`/budget +[jumlah]\` - Menambah budget yang ada.
• \`/budget -[jumlah]\` - Mengurangi budget yang ada.

• \`/recurring list\` - Melihat semua aturan transaksi berulang.
• \`/recurring hapus [id]\` - Menghapus aturan berulang.
• \`/recurring [+/-] kat jml tgl [desc]\` - Menambah aturan baru.
   Contoh: \`/recurring - wifi 350000 5 Tagihan bulanan\`

• \`/edit\` - Menampilkan menu untuk mengubah 5 transaksi terakhir.
• \`/delete\` - Menampilkan menu hapus interaktif atau gunakan sub-perintah: \`/delete today\`, \`/delete yesterday\`, \`/delete all\` (semua dengan konfirmasi).

*🤖 Fitur Otomatis*
Bot ini bekerja untukmu di belakang layar:

• *Transaksi Berulang:* Semua aturan dari \`/recurring\` akan otomatis tercatat pada tanggalnya setiap pagi (sekitar jam 9 WIB).
• *Notifikasi Budget:* Kamu akan menerima peringatan otomatis jika total pengeluaran bulanan sudah mencapai 80% dari budget.

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
