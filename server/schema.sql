-- ============================================================
--  FlyEase - Database Schema untuk XAMPP MySQL
--  Jalankan via phpMyAdmin atau: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS flight_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE flight_booking;

-- ─── Tabel Users (Akun pengguna) ─────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- disimpan plain/hashed
  avatar     VARCHAR(10)  DEFAULT NULL,       -- inisial / emoji avatar
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Tabel Airports (Daftar bandara) ─────────────────────────
CREATE TABLE IF NOT EXISTS airports (
  code    VARCHAR(10)  PRIMARY KEY,
  city    VARCHAR(100) NOT NULL,
  name    VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Tabel Flights (Data penerbangan) ────────────────────────
CREATE TABLE IF NOT EXISTS flights (
  id             VARCHAR(120) PRIMARY KEY,
  flightNumber   VARCHAR(20)  NOT NULL,
  airlineId      VARCHAR(10)  NOT NULL,
  airlineName    VARCHAR(100) NOT NULL,
  fromCity       VARCHAR(100) NOT NULL,
  fromCode       VARCHAR(10)  NOT NULL,
  toCity         VARCHAR(100) NOT NULL,
  toCode         VARCHAR(10)  NOT NULL,
  departureTime  VARCHAR(10)  NOT NULL,   -- format HH:MM
  arrivalTime    VARCHAR(10)  NOT NULL,   -- format HH:MM
  date           VARCHAR(20)  NOT NULL,   -- format YYYY-MM-DD
  price          INT          NOT NULL,
  duration       VARCHAR(20)  NOT NULL,   -- contoh: "1j 50m"
  stops          INT          DEFAULT 0,
  classType      VARCHAR(20)  NOT NULL,   -- Economy / Business / First
  availableSeats INT          NOT NULL,
  INDEX idx_from_to_date (fromCode, toCode, date),
  INDEX idx_class (classType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Tabel Bookings (Pemesanan tiket) ────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                  VARCHAR(10)   PRIMARY KEY,    -- kode booking 6 karakter e.g. "AB1234"
  userId              INT           DEFAULT NULL,
  flightId            VARCHAR(120)  NOT NULL,
  returnFlightId      VARCHAR(120)  DEFAULT NULL,   -- untuk pulang pergi
  passengersJson      LONGTEXT      NOT NULL,       -- JSON array of Passenger objects
  contactEmail        VARCHAR(255)  NOT NULL,
  contactPhone        VARCHAR(50)   NOT NULL,
  totalPrice          INT           NOT NULL,
  paymentMethod       VARCHAR(50)   NOT NULL,
  paymentStatus       VARCHAR(20)   DEFAULT 'success',
  status              VARCHAR(20)   DEFAULT 'active',
  bookingDate         VARCHAR(20)   NOT NULL,       -- format YYYY-MM-DD
  flightDetailsJson   LONGTEXT      NOT NULL,       -- JSON snapshot flight data
  returnFlightJson    LONGTEXT      DEFAULT NULL,   -- JSON snapshot return flight
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
