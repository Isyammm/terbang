# FlyEase - Aplikasi Pemesanan Tiket Pesawat Premium

FlyEase adalah aplikasi pemesanan tiket pesawat Single Page Application (SPA) berbasis web yang dirancang dengan estetika modern, warna futuristik Cyberpunk Indigo & Neon Blue, serta kaya akan interaksi dinamis.

## Fitur Utama
1. **Pencarian Tiket**: Form dinamis pencarian tiket Sekali Jalan / Pulang Pergi dengan bandara asal/tujuan populer, penanggalan, jumlah penumpang, dan kelas kabin (Ekonomi/Bisnis/First Class).
2. **Hasil Pencarian**: Panel pencarian tiket pergi-pulang dengan penyaringan (Filter) lengkap berdasarkan maskapai penerbangan, jumlah transit, rentang harga, dan pengurutan (Sorting) termurah/tercepat/terawal.
3. **Peta Kursi Interaktif (Seat Map)**: Peta tata letak kabin pesawat 2D interaktif (kabin Bisnis & Ekonomi) yang memungkinkan pemilihan kursi per penumpang secara real-time dengan simulasi tambahan biaya kursi legroom ekstra / kursi jendela.
4. **Alur Checkout & Promo**: Rincian biaya pembayaran (tiket, pajak PPN 11%, biaya layanan), input kode promo diskon fiktif (`FLYEASE10` / `LIBURANYUK`), dan simulasi metode pembayaran (Kartu Kredit, QRIS, Virtual Account) beserta animasi loader pemrosesan transaksi.
5. **E-Ticket & Boarding Pass**: Tampilan boarding pass premium mirip dengan tiket maskapai fisik lengkap dengan pembagian stub tiket, barcode, dan QR code yang siap dicetak.
6. **Riwayat Pemesanan (My Bookings)**: Halaman pelacakan seluruh daftar pesanan tiket aktif/lalu yang tersimpan secara lokal di browser (`localStorage`), lengkap dengan fitur pembatalan tiket (Cancel Booking) instan.

---

## Cara Menjalankan Aplikasi

Kami menyediakan **dua versi** aplikasi yang dapat Anda pilih sesuai dengan kebutuhan Anda:

### Metode A: Versi Vanilla (Instan, Tanpa Instalasi - *Direkomendasikan*)
Sangat direkomendasikan jika sistem Anda tidak memiliki Node.js/NPM terinstal. Aplikasi berjalan 100% menggunakan HTML, CSS, dan JavaScript murni dan dapat dibuka langsung tanpa kompilasi.

1. Buka folder: `C:\Users\ASUS\.gemini\antigravity-ide\scratch\flight-booking-app\vanilla\`
2. Klik ganda (atau klik kanan -> open in browser) pada file **`index.html`**.
3. Aplikasi siap digunakan!

### Metode B: Versi React + Vite + TypeScript (Untuk Pengembangan / Build)
Versi modular modern menggunakan React.js dan TypeScript yang dipaket dengan Vite.

1. Pastikan Anda memiliki **Node.js (versi 18+)** terinstal di sistem Anda.
2. Buka terminal/command prompt pada direktori proyek:
   ```bash
   cd C:\Users\ASUS\.gemini\antigravity-ide\scratch\flight-booking-app
   ```
3. Instal seluruh dependensi:
   ```bash
   npm install
   ```
4. Jalankan server lokal:
   ```bash
   npm run dev
   ```
5. Buka link localhost yang ditampilkan terminal di browser Anda (misalnya `http://localhost:5173`).

---

## Kode Kupon Promo Fiktif yang Dapat Dicoba:
* **`FLYEASE10`** : Diskon 10% untuk Subtotal.
* **`LIBURANYUK`** : Diskon 15% untuk Subtotal.
