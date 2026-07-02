const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API: Get all airports
app.get('/api/airports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM airports');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Search flights
app.get('/api/flights', async (req, res) => {
  try {
    const { from, to, date, class: classType } = req.query;
    
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];
    
    if (from) {
      query += ' AND fromCode = ?';
      params.push(from);
    }
    if (to) {
      query += ' AND toCode = ?';
      params.push(to);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    if (classType) {
      query += ' AND classType = ?';
      params.push(classType);
    }
    
    query += ' ORDER BY departureTime ASC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Create a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { flightId, passengers, totalPrice, userId } = req.body;
    
    // Default userId to null if not logged in
    const finalUserId = userId || null;
    
    const [result] = await pool.query(
      'INSERT INTO bookings (userId, flightId, passengers, totalPrice) VALUES (?, ?, ?, ?)',
      [finalUserId, flightId, passengers, totalPrice]
    );
    
    res.status(201).json({ success: true, bookingId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
