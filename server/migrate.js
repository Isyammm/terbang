const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'flight_booking',
    multipleStatements: true
  });

  console.log('✅ Terhubung ke MySQL:', process.env.DB_NAME);

  // Cek kolom yang ada
  const [cols] = await conn.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings'
  `, [process.env.DB_NAME || 'flight_booking']);
  
  const existing = cols.map(c => c.COLUMN_NAME);
  console.log('Kolom bookings saat ini:', existing.join(', '));

  const migrations = [
    // Ubah tipe id dari INT menjadi VARCHAR (kode booking 6 karakter)
    {
      check: () => true, // selalu jalankan MODIFY
      sql: `ALTER TABLE bookings MODIFY COLUMN id VARCHAR(10) NOT NULL`
    },
    {
      check: () => !existing.includes('returnFlightId'),
      sql: `ALTER TABLE bookings ADD COLUMN returnFlightId VARCHAR(120) DEFAULT NULL AFTER flightId`
    },
    {
      check: () => !existing.includes('passengersJson'),
      sql: `ALTER TABLE bookings ADD COLUMN passengersJson LONGTEXT DEFAULT NULL`
    },
    {
      check: () => !existing.includes('contactEmail'),
      sql: `ALTER TABLE bookings ADD COLUMN contactEmail VARCHAR(255) DEFAULT ''`
    },
    {
      check: () => !existing.includes('contactPhone'),
      sql: `ALTER TABLE bookings ADD COLUMN contactPhone VARCHAR(50) DEFAULT ''`
    },
    {
      check: () => !existing.includes('paymentMethod'),
      sql: `ALTER TABLE bookings ADD COLUMN paymentMethod VARCHAR(50) DEFAULT 'transfer'`
    },
    {
      check: () => !existing.includes('paymentStatus'),
      sql: `ALTER TABLE bookings ADD COLUMN paymentStatus VARCHAR(20) DEFAULT 'success'`
    },
    {
      check: () => !existing.includes('bookingDate'),
      sql: `ALTER TABLE bookings ADD COLUMN bookingDate VARCHAR(20) DEFAULT ''`
    },
    {
      check: () => !existing.includes('flightDetailsJson'),
      sql: `ALTER TABLE bookings ADD COLUMN flightDetailsJson LONGTEXT DEFAULT NULL`
    },
    {
      check: () => !existing.includes('returnFlightJson'),
      sql: `ALTER TABLE bookings ADD COLUMN returnFlightJson LONGTEXT DEFAULT NULL`
    },
    // Tambah kolom avatar ke users jika belum ada
    {
      check: async () => {
        const [uc] = await conn.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar'`,
          [process.env.DB_NAME]
        );
        return uc.length === 0;
      },
      sql: `ALTER TABLE users ADD COLUMN avatar VARCHAR(10) DEFAULT NULL`
    }
  ];

  for (const m of migrations) {
    const shouldRun = typeof m.check === 'function' ? await m.check() : true;
    if (shouldRun) {
      try {
        await conn.query(m.sql);
        console.log('✅', m.sql.substring(0, 60) + '...');
      } catch (err) {
        // Abaikan error jika kolom sudah ada
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('⏭️  Kolom sudah ada, dilewati');
        } else {
          console.error('❌ Error:', err.message);
        }
      }
    } else {
      console.log('⏭️  Dilewati (sudah ada)');
    }
  }

  // Seed airports jika kosong
  const [airportCount] = await conn.query('SELECT COUNT(*) as cnt FROM airports');
  if (airportCount[0].cnt === 0) {
    console.log('\n📍 Tabel airports kosong, mengisi data bandara...');
    const airports = [
      ['CGK','Jakarta','Soekarno-Hatta International Airport','Indonesia'],
      ['DPS','Bali','I Gusti Ngurah Rai International Airport','Indonesia'],
      ['SUB','Surabaya','Juanda International Airport','Indonesia'],
      ['KNO','Medan','Kualanamu International Airport','Indonesia'],
      ['YIA','Yogyakarta','Yogyakarta International Airport','Indonesia'],
      ['BDO','Bandung','Husein Sastranegara International Airport','Indonesia'],
      ['LOP','Lombok','Lombok International Airport','Indonesia'],
      ['UPG','Makassar','Sultan Hasanuddin International Airport','Indonesia'],
      ['SRG','Semarang','Jenderal Ahmad Yani International Airport','Indonesia'],
      ['BPN','Balikpapan','Sultan Aji Muhammad Sulaiman Sepinggan Airport','Indonesia'],
      ['PLM','Palembang','Sultan Mahmud Badaruddin II Airport','Indonesia'],
      ['PKU','Pekanbaru','Sultan Syarif Kasim II Airport','Indonesia'],
      ['MDC','Manado','Sam Ratulangi International Airport','Indonesia'],
      ['DJJ','Jayapura','Dortheys Hiyo Eluay International Airport','Indonesia'],
      ['SIN','Singapore','Changi Airport','Singapore'],
      ['KUL','Kuala Lumpur','Kuala Lumpur International Airport','Malaysia'],
      ['BKK','Bangkok','Suvarnabhumi Airport','Thailand'],
      ['HKG','Hong Kong','Hong Kong International Airport','Hong Kong'],
      ['ICN','Seoul','Incheon International Airport','South Korea'],
      ['HND','Tokyo','Haneda Airport','Japan'],
      ['PEK','Beijing','Beijing Capital International Airport','China'],
      ['DXB','Dubai','Dubai International Airport','UAE'],
      ['AMS','Amsterdam','Amsterdam Airport Schiphol','Netherlands'],
      ['LHR','London','Heathrow Airport','UK'],
      ['CDG','Paris','Charles de Gaulle Airport','France'],
      ['FRA','Frankfurt','Frankfurt Airport','Germany'],
      ['SYD','Sydney','Kingsford Smith Airport','Australia'],
      ['JFK','New York','John F. Kennedy International Airport','USA'],
      ['LAX','Los Angeles','Los Angeles International Airport','USA'],
    ];
    for (const a of airports) {
      await conn.query(
        'INSERT IGNORE INTO airports (code, city, name, country) VALUES (?, ?, ?, ?)', a
      );
    }
    console.log(`✅ ${airports.length} bandara berhasil dimasukkan`);
  } else {
    console.log(`✅ Tabel airports sudah ada ${airportCount[0].cnt} data`);
  }

  await conn.end();
  console.log('\n🎉 Migrasi selesai! Jalankan: node index.js');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migrasi gagal:', err.message);
  process.exit(1);
});
