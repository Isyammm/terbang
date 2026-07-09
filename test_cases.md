# Blueprint Pengujian Aplikasi Flight Booking

Dokumen ini berisi daftar **15 Skenario Pengujian (Test Scenarios)** dan **40 Kasus Uji (Test Cases)** yang dirancang khusus untuk aplikasi pemesanan tiket pesawat Anda. Setiap Test Case telah dikategorikan sebagai **Positive**, **Negative**, atau **Edge Case** untuk memastikan pengujian yang komprehensif.

---

### Skenario 1: Autentikasi Pengguna (Login)
1. **TC01 (Positive):** Login dengan email dan password valid yang terdaftar. Verifikasi pengguna masuk ke halaman utama.
2. **TC02 (Negative):** Login dengan password yang salah. Verifikasi munculnya pesan error yang sesuai.
3. **TC03 (Negative):** Login dengan format email yang tidak valid (misal: `userexample.com`). Verifikasi validasi form mencegah submit.

### Skenario 2: Autentikasi Pengguna (Registrasi)
4. **TC04 (Positive):** Mendaftar menggunakan data lengkap dan valid. Verifikasi akun berhasil dibuat.
5. **TC05 (Negative):** Mendaftar menggunakan alamat email yang sudah pernah terdaftar sebelumnya. Verifikasi sistem menolak duplikasi.
6. **TC06 (Edge Case):** Mendaftar dengan memasukkan nama atau password dengan karakter maksimum (misal: 100 karakter). Verifikasi aplikasi atau database tidak crash.

### Skenario 3: Pencarian Penerbangan (Sekali Jalan)
7. **TC07 (Positive):** Melakukan pencarian rute valid untuk 1 penumpang dewasa (One-Way). Verifikasi hasil daftar penerbangan muncul.
8. **TC08 (Positive):** Melakukan pencarian khusus kelas penerbangan "Bisnis". Verifikasi hasil hanya menampilkan tiket kelas bisnis.
9. **TC09 (Edge Case):** Memasukkan jumlah penumpang maksimal yang diizinkan oleh sistem (misal: 9 orang). Verifikasi aplikasi dapat memproses pencarian massal.

### Skenario 4: Pencarian Penerbangan (Pulang Pergi)
10. **TC10 (Positive):** Mencari tiket pulang-pergi dengan tanggal kepulangan beberapa hari setelah tanggal keberangkatan. Verifikasi penerbangan pergi dan pulang tersedia.
11. **TC11 (Negative):** Memasukkan tanggal kembali (return) yang mendahului tanggal keberangkatan. Verifikasi sistem menampilkan error.
12. **TC12 (Edge Case):** Memilih penerbangan berangkat dan pulang pada tanggal (hari) yang sama persis. Verifikasi logika pencarian mengizinkan *same-day return*.

### Skenario 5: Validasi Form Pencarian Utama
13. **TC13 (Negative):** Memilih kota Asal (Origin) dan kota Tujuan (Destination) yang persis sama. Verifikasi form menampilkan error (rute tidak logis).
14. **TC14 (Negative):** Mencoba menginput tanggal keberangkatan pada hari kemarin (past date). Verifikasi kalender memblokir tanggal masa lalu.
15. **TC15 (Negative):** Mengosongkan isian kota Asal atau kota Tujuan dan menekan tombol Cari. Verifikasi muncul pop-up field wajib diisi.

### Skenario 6: Filter Hasil Penerbangan
16. **TC16 (Positive):** Memfilter hasil dengan rentang harga menengah ke bawah. Verifikasi tidak ada tiket yang lewat batas harga yang diset.
17. **TC17 (Positive):** Mencentang filter pada maskapai penerbangan spesifik (misal: Garuda Indonesia). Verifikasi hanya maskapai tersebut yang tampil di layar.
18. **TC18 (Edge Case):** Mengatur filter yang saling bertolak belakang atau sangat sempit (misal: budget minimal namun kelas Bisnis) sehingga hasil = 0. Verifikasi muncul tampilan "Tidak ada penerbangan ditemukan" (Empty State).

### Skenario 7: Pengurutan (Sorting) Hasil Penerbangan
19. **TC19 (Positive):** Mengubah pengurutan hasil ke "Harga: Termurah ke Termahal". Verifikasi daftar terurut secara *ascending* berdasarkan harga.
20. **TC20 (Positive):** Mengubah pengurutan ke "Durasi Tercepat". Verifikasi penerbangan non-stop atau dengan durasi jam terpendek berada di posisi atas.

### Skenario 8: Pengisian Data Penumpang (Passenger Details)
21. **TC21 (Positive):** Mengisi identitas dengan data huruf biasa untuk satu penumpang dewasa. Verifikasi data tersimpan dan lanjut ke tahap berikutnya.
22. **TC22 (Positive):** Mengisi kombinasi formulir penumpang berbeda (1 Tuan/Mr dewasa, 1 Nona/Miss anak-anak). Verifikasi form bisa menghandle perbedaan tipe penumpang.

### Skenario 9: Validasi Keamanan Form Penumpang
23. **TC23 (Negative):** Sengaja membiarkan kolom "Nama Belakang" (Last Name) kosong karena field tersebut ditandai bintang merah. Verifikasi sistem mencegah ke langkah selanjutnya.
24. **TC24 (Negative):** Memasukkan kombinasi angka dan simbol spesial (seperti `@#$%`) pada kolom Nama Depan. Verifikasi muncul error *invalid characters*.
25. **TC25 (Negative):** Memasukkan isian alfabet pada kolom Nomor Telepon kontak darurat. Verifikasi validasi format nomor mendeteksi error.
26. **TC26 (Edge Case):** Memasukkan nama dengan panjang ekstrem (misal 60 karakter) untuk melihat apakah *layout* UI (misal di E-Ticket nanti) akan menjadi berantakan/overflow.

### Skenario 10: Pemilihan Kursi (Seat Selection)
27. **TC27 (Positive):** Mengklik kursi berwarna hijau (Tersedia) untuk penumpang 1 dan 2. Verifikasi status kursi berubah warna menjadi "Terpilih" (Selected).
28. **TC28 (Negative):** Mengklik kursi berwarna abu-abu/merah (Sudah Dipesan). Verifikasi tidak ada perubahan (*unclickable*).
29. **TC29 (Edge Case):** Mengklik sebuah kursi, lalu berubah pikiran dan mengklik kursi yang sama (Deselect), kemudian memilih kursi yang lain. Verifikasi sistem mereset kursi awal ke berstatus 'tersedia' kembali.

### Skenario 11: Interaksi Proses Reservasi
30. **TC30 (Negative):** Menekan tombol Lanjut ke Pembayaran namun belum menyelesaikan alokasi kursi untuk *semua* penumpang (jika pemesanan kursi diwajibkan). Verifikasi adanya peringatan.
31. **TC31 (Edge Case):** Melakukan *Refresh* (F5) halaman browser saat berada di pertengahan pengisian data penumpang atau peta kursi. Verifikasi apakah aplikasi mereset seluruh flow dari awal atau mempertahankan *State*.

### Skenario 12: Proses Pembayaran (Checkout)
32. **TC32 (Positive):** Mengisi rincian kartu kredit *dummy* yang valid (Test Card). Verifikasi sukses membayar dan dialihkan ke E-Ticket.
33. **TC33 (Positive):** Memverifikasi bahwa nominal subtotal, pajak (taxes/fees), dan *Total Harga Akhir* diukur/dijumlahkan secara akurat berdasarkan kursi dan kelas yang dipilih.

### Skenario 13: Validasi Form Pembayaran (Payment Gateway)
34. **TC34 (Negative):** Memasukkan detail kartu kredit yang masa berlakunya (Expiry Date) telah lewat di bulan/tahun lalu. Verifikasi simulasi pembayaran ditolak.
35. **TC35 (Negative):** Menginput kode CVV dengan jumlah kurang dari 3 digit. Verifikasi error panjang karakter.
36. **TC36 (Edge Case):** Menekan tombol "Bayar Sekarang" berkali-kali dengan sangat cepat (double/triple clicks) pada mouse. Verifikasi sistem meng-*disable* tombol pasca-klik pertama agar tidak terjadi *double-charge*.

### Skenario 14: Pembuatan E-Ticket
37. **TC37 (Positive):** Memverifikasi E-ticket yang dicetak pada layar menampilkan kode PNR/Booking Reference yang spesifik/unik.
38. **TC38 (Edge Case):** Menyelesaikan pesanan dengan jumlah maksimal (9 penumpang) dan memverifikasi tata letak visual E-Ticket tidak terpotong (broken UI) karena memuat banyak data nama.

### Skenario 15: Riwayat Pemesanan (Booking History)
39. **TC39 (Positive):** Masuk ke halaman menu Profil/Riwayat. Verifikasi tiket penerbangan masa depan yang baru saja dibayar muncul di tab "Penerbangan Mendatang" (Upcoming).
40. **TC40 (Negative):** Menyalin URL halaman `BookingHistory` dan membukanya di Tab incognito/peramban yang *belum login*. Verifikasi sistem mendeteksi proteksi *route* dan mengalihkan *user* ke form Login secara paksa.