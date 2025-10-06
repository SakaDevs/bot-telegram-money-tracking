// commands/menu.js
import { Input, Markup } from "telegraf";

const menuCommand = async (ctx) => {
  const menuGifUrl = 'https://media1.tenor.com/m/HY6j2aFeg84AAAAC/rakshit-blowmoney.gif';
  
  const welcomeMessage = `Halo, ${ctx.from.first_name}! 📊\n\n` +
  `Ini adalah pusat kendali keuanganmu. Gunakan tombol-tombol di bawah untuk navigasi cepat.\n\n` +
  `Untuk input transaksi, cukup ketik langsung dengan format:\n` +
  '`+ kategori jumlah [deskripsi]`\n`- kategori jumlah [deskripsi]`';

  // Kirim pesan utama dengan GIF dan tombol inline
  await ctx.replyWithAnimation(
    Input.fromURL(menuGifUrl),
    {
      caption: welcomeMessage,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🧾 Buka Menu Laporan", callback_data: "show_report" },
          ],
        ],
      },
    }
  );

  // Kirim pesan kedua (atau pertama) untuk menampilkan Reply Keyboard
  await ctx.reply(
    'Pilih perintah cepat:',
    Markup.keyboard([
        ['/today', '/month'], // Baris pertama
        ['/edit', '/delete'], // Baris kedua
    ]).resize() // Membuat tombol lebih rapi
  );
};

export default menuCommand;