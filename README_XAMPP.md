# 🗄️ Panduan Setup Database XAMPP — FlyEase

## Langkah 1 — Aktifkan XAMPP

1. Buka **XAMPP Control Panel**
2. Klik **Start** pada **Apache** dan **MySQL**
3. Pastikan keduanya berwarna hijau (Running)

---

## Langkah 2 — Buat Database via phpMyAdmin

1. Buka browser → http://localhost/phpmyadmin
2. Klik **SQL** di menu atas
3. Copy-paste isi file [`server/schema.sql`](server/schema.sql) ke kotak SQL
4. Klik **Go / Jalankan**

> ✅ Database `flight_booking` beserta tabel `users`, `airports`, `flights`, `bookings` akan otomatis dibuat.

---

## Langkah 3 — Sesuaikan Password (jika perlu)

Buka file `server/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=          ← kosongkan jika XAMPP default (tidak ada password)
DB_NAME=flight_booking
PORT=3000
```

> Jika kamu sudah set password MySQL di phpMyAdmin, isi `DB_PASS` dengan password tersebut.

---

## Langkah 4 — Install dependencies server

```powershell
cd server
npm install
```

---

## Langkah 5 — Isi data awal (seed)

```powershell
cd server
node initDb.js    # Buat tabel (jika belum via phpMyAdmin)
node seed.js      # Isi data bandara + penerbangan
```

> ⚠️ `seed.js` akan menghasilkan ribuan data penerbangan. Tunggu hingga selesai (~1-2 menit).

---

## Langkah 6 — Jalankan Backend API

```powershell
cd server
node index.js
```

Output yang diharapkan:
```
✅  FlyEase API berjalan di http://localhost:3000
    Database : flight_booking@localhost:3306
```

---

## Langkah 7 — Jalankan Frontend

```powershell
# Di terminal terpisah, dari root project
npm run dev
```

Buka → **http://localhost:5173**

---

## Arsitektur

```
Frontend (Vite/React)          Backend (Express.js)        Database (XAMPP MySQL)
http://localhost:5173    →     http://localhost:3000    →   localhost:3306
                               /api/auth/login              flight_booking.users
                               /api/auth/register           flight_booking.airports
                               /api/airports                flight_booking.flights
                               /api/flights                 flight_booking.bookings
                               /api/bookings
```

---

## ⚡ Mode Offline (tanpa backend)

Jika backend **tidak dijalankan**, app tetap berfungsi penuh dengan:
- Data bandara dari `mockData.ts` (29 bandara)
- Data penerbangan di-generate secara lokal
- Login/Register disimpan di localStorage browser
- Booking disimpan di localStorage browser
