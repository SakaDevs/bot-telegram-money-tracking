# 💰 Bot Pencatat Keuangan Telegram

![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Sebuah bot Telegram canggih untuk mencatat, mengelola, dan menganalisis keuangan pribadi Anda langsung dari dalam chat. Proyek ini dibangun dengan Node.js dan Telegraf, dengan fokus pada fungsionalitas yang *powerful* dan pengalaman pengguna yang mulus.

---

### 🎥 Demo Singkat

_(**Saran:** Ganti bagian ini dengan screenshot atau GIF pendek yang menampilkan perintah `/menu`, proses menambah transaksi, dan melihat laporan grafik. Ini akan membuat README-mu sangat menarik!)_

![Contoh Tampilan Bot](https://i.imgur.com/your-screenshot-url.png)

---

### ✨ Fitur Utama

Bot ini bukan sekadar pencatat biasa. Berikut adalah fitur-fitur unggulannya:

* **⚡ Input Super Cepat:** Catat pemasukan dan pengeluaran dalam hitungan detik dengan format `+` dan `-` (contoh: `- makan 50000 sate padang`).
* **📊 Laporan Detail & Fleksibel:**
    * Laporan harian (`/today`), bulanan (`/month`), dan tahunan (`/year`).
    * Filter laporan berdasarkan kategori (`/category makan`).
    * Navigasi laporan dengan sistem halaman (*pagination*).
* **🎨 Ringkasan Visual:** Dapatkan grafik *pie chart* pengeluaran bulanan dengan perintah `/summary`.
* **🎯 Manajemen Budget:**
    * Atur budget bulanan dengan `/budget [jumlah]`.
    * Tambah atau kurangi budget dengan mudah (`/budget +500000` atau `/budget -100000`).
    * Dapatkan notifikasi progres budget di setiap laporan.
* **🤖 Otomatisasi Cerdas:**
    * **Transaksi Berulang:** Atur pemasukan (gaji) atau pengeluaran (tagihan) rutin dengan `/recurring`.
    * **Notifikasi Budget:** Dapatkan peringatan proaktif jika pengeluaran sudah mendekati 80% dari budget.
* **✏️ Manajemen Data Penuh:**
    * Edit transaksi yang salah input dengan alur percakapan via `/edit`.
    * Hapus transaksi secara interaktif atau massal (`/delete`, `/delete today`, `/delete all`) dengan konfirmasi keamanan.
* **📁 Ekspor Data:** Unduh semua data transaksimu dalam format **Excel (CSV)** atau **PDF** dengan perintah `/export`.

---

### 🚀 Teknologi yang Digunakan

* **Runtime:** Node.js
* **Framework Bot:** Telegraf.js
* **Database:** SQLite dengan Sequelize (ORM)
* ** penjadwalan:** node-cron
* **Grafik:** chart.js & chartjs-node-canvas
* **Ekspor File:** json2csv & pdfkit

---

### 🛠️ Instalasi & Setup

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    ```
2.  **Masuk ke direktori proyek:**
    ```bash
    cd your-repo-name
    ```
3.  **Install semua dependensi:**
    ```bash
    npm install
    ```
4.  **Konfigurasi Environment:**
    * Buat file `.env` di direktori utama.
    * Salin isi dari `.env.example` (jika ada) atau tambahkan baris berikut:
        ```
        TELEGRAM_BOT_TOKEN=TOKEN_BOT_ANDA_DARI_BOTFATHER
        ```

---

### ▶️ Cara Menjalankan

* **Untuk development:**
    ```bash
    node index.js
    ```
* Setelah bot berjalan, buka aplikasi Telegram, cari bot Anda, dan kirim perintah `/start` atau `/menu`.

### 📖 Daftar Perintah Utama

Untuk daftar lengkap, kirim `/help` langsung ke bot. Berikut adalah beberapa perintah inti:

* `/menu` - Membuka dashboard utama.
* `/help` - Menampilkan panduan lengkap.
* `/today` - Laporan cepat untuk hari ini.
* `/month` - Laporan cepat untuk bulan ini.
* `/summary` - Grafik pengeluaran bulan ini.

---

### 📝 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.