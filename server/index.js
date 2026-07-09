const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // limit besar untuk JSON penerbangan

// ─────────────────────────────────────────────────────────────
//  HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FlyEase API berjalan' });
});

// ─────────────────────────────────────────────────────────────
//  AUTH — Register
// ─────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Semua field wajib diisi' });

    // Cek email duplikat
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0)
      return res.status(409).json({ error: 'Email sudah terdaftar' });

    const avatar = name.slice(0, 2).toUpperCase();
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
      [name, email, password, avatar]
    );

    res.status(201).json({
      success: true,
      user: { id: result.insertId, name, email, avatar }
    });
  } catch (err) {
    console.error('[Register]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
//  AUTH — Login
// ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email dan password wajib diisi' });

    const [rows] = await pool.query(
      'SELECT id, name, email, avatar FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Email atau password salah' });

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('[Login]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
//  AIRPORTS — Ambil semua bandara
// ─────────────────────────────────────────────────────────────
app.get('/api/airports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM airports ORDER BY country, city');
    res.json(rows);
  } catch (err) {
    console.error('[Airports]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
//  FLIGHTS — Cari penerbangan
// ─────────────────────────────────────────────────────────────
app.get('/api/flights', async (req, res) => {
  try {
    const { from, to, date, class: classType } = req.query;

    // ── 1. Coba fetch ke Tequila (API Asli) jika ada API KEY ──
    const apiKey = process.env.TEQUILA_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      try {
        let cabin = 'M';
        if (classType === 'Business') cabin = 'C';
        if (classType === 'First') cabin = 'F';

        let dateParam = '';
        if (date) {
          const [y, m, d] = date.split('-');
          dateParam = `${d}/${m}/${y}`;
        }

        const url = `https://api.tequila.kiwi.com/v2/search?fly_from=${from || ''}&fly_to=${to || ''}&dateFrom=${dateParam}&dateTo=${dateParam}&selected_cabins=${cabin}&curr=IDR&limit=30`;
        const response = await fetch(url, { headers: { 'apikey': apiKey } });

        if (response.ok) {
          const apiData = await response.json();
          const realFlights = apiData.data.map(r => {
            const depDate = new Date(r.local_departure);
            const arrDate = new Date(r.local_arrival);

            // Extract HH:mm format
            const depTime = depDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
            const arrTime = arrDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

            // Airline map (basic)
            const airlineCode = r.airlines[0] || 'XX';
            const flightNo = r.route && r.route[0] ? `${r.route[0].airline}-${r.route[0].flight_no}` : `${airlineCode}-101`;

            return {
              id: r.id,
              flightNumber: flightNo,
              airlineId: airlineCode,
              airlineName: airlineCode + ' Airlines', // Di dunia nyata kita butuh kamus IATA ke Nama Maskapai
              from: r.cityFrom,
              fromCode: r.flyFrom,
              to: r.cityTo,
              toCode: r.flyTo,
              departureTime: depTime,
              arrivalTime: arrTime,
              date: date || depDate.toISOString().split('T')[0],
              price: r.price,
              duration: r.fly_duration,
              stops: r.route ? Math.max(0, r.route.length - 1) : 0,
              classType: classType || 'Economy',
              availableSeats: r.availability?.seats || Math.floor(Math.random() * 50) + 1,
            };
          });

          return res.json(realFlights); // Sukses menggunakan data asli!
        } else {
          console.error('Tequila API Error:', response.status, await response.text());
          // Gagal fetch dari API asli, lanjut ke fallback DB lokal
        }
      } catch (apiErr) {
        console.error('Error contacting flight API:', apiErr);
        // Lanjut ke fallback
      }
    }

    // ── 2. Fallback: Gunakan Data Simulasi dari MySQL ──
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];

    if (from) { query += ' AND fromCode = ?'; params.push(from); }
    if (to) { query += ' AND toCode = ?'; params.push(to); }
    if (date) { query += ' AND date = ?'; params.push(date); }
    if (classType) { query += ' AND classType = ?'; params.push(classType); }

    query += ' ORDER BY departureTime ASC';

    const [rows] = await pool.query(query, params);

    // Map kolom DB ke format yang dipakai frontend
    const flights = rows.map(r => ({
      id: r.id,
      flightNumber: r.flightNumber,
      airlineId: r.airlineId,
      airlineName: r.airlineName,
      from: r.fromCity,
      fromCode: r.fromCode,
      to: r.toCity,
      toCode: r.toCode,
      departureTime: r.departureTime,
      arrivalTime: r.arrivalTime,
      date: r.date,
      price: r.price,
      duration: r.duration,
      stops: r.stops,
      classType: r.classType,
      availableSeats: r.availableSeats,
    }));

    res.json(flights);
  } catch (err) {
    console.error('[Flights]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
//  BOOKINGS — Buat pemesanan baru
// ─────────────────────────────────────────────────────────────
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      id, userId, flightId, returnFlightId,
      passengers, contactEmail, contactPhone,
      totalPrice, paymentMethod, paymentStatus,
      bookingDate, flightDetails, returnFlightDetails
    } = req.body;

    if (!id || !flightId || !passengers || !totalPrice)
      return res.status(400).json({ error: 'Data booking tidak lengkap' });

    await pool.query(
      `INSERT INTO bookings
        (id, userId, flightId, returnFlightId, passengersJson, contactEmail,
         contactPhone, totalPrice, paymentMethod, paymentStatus, status,
         bookingDate, flightDetailsJson, returnFlightJson)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [
        id,
        userId || null,
        flightId,
        returnFlightId || null,
        JSON.stringify(passengers),
        contactEmail,
        contactPhone,
        totalPrice,
        paymentMethod,
        paymentStatus || 'success',
        bookingDate,
        JSON.stringify(flightDetails),
        returnFlightDetails ? JSON.stringify(returnFlightDetails) : null
      ]
    );

    res.status(201).json({ success: true, bookingId: id });
  } catch (err) {
    console.error('[Bookings POST]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
//  BOOKINGS — Ambil semua booking milik user
// ─────────────────────────────────────────────────────────────
app.get('/api/bookings', async (req, res) => {
  try {
    const { userId, email } = req.query;
    if (!userId && !email) {
      return res.status(400).json({ error: 'userId atau email diperlukan' });
    }

    let rows;
    if (userId) {
      const [result] = await pool.query(
        'SELECT * FROM bookings WHERE userId = ? ORDER BY created_at DESC',
        [userId]
      );
      rows = result;
    } else {
      const [result] = await pool.query(
        'SELECT * FROM bookings WHERE contactEmail = ? ORDER BY created_at DESC',
        [email]
      );
      rows = result;
    }

    const bookings = rows.map(r => ({
      id: r.id,
      flightId: r.flightId,
      returnFlightId: r.returnFlightId,
      passengers: JSON.parse(r.passengersJson || '[]'),
      contactEmail: r.contactEmail,
      contactPhone: r.contactPhone,
      totalPrice: r.totalPrice,
      paymentMethod: r.paymentMethod,
      paymentStatus: r.paymentStatus,
      status: r.status,
      bookingDate: r.bookingDate,
      flightDetails: JSON.parse(r.flightDetailsJson || 'null'),
      returnFlightDetails: r.returnFlightJson ? JSON.parse(r.returnFlightJson) : undefined,
    }));

    res.json(bookings);
  } catch (err) {
    console.error('[Bookings GET]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
//  BOOKINGS — Batalkan pemesanan
// ─────────────────────────────────────────────────────────────
app.patch('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[Bookings CANCEL]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`✅  FlyEase API berjalan di http://localhost:${port}`);
  console.log(`    Database : ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
});
