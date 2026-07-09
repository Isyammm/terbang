import React, { useState } from 'react';
import { Plane, ShieldAlert, ArrowRight, Eye, Trash2, Ticket, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Booking } from '../types';
import { UserAccount } from './LoginModal';
import './BookingHistory.css';

interface BookingHistoryProps {
  bookings: Booking[];
  onViewTicket: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onNavigateHome: () => void;
  currentUser: UserAccount | null;
  onLoginClick: () => void;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({
  bookings,
  onViewTicket,
  onCancelBooking,
  onNavigateHome,
  currentUser,
  onLoginClick,
}) => {
  const [bookingCode, setBookingCode] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filter bookings to only show current user's bookings
  const userBookings = currentUser
    ? bookings.filter(b => b.contactEmail === currentUser.email)
    : [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCancelClick = (bookingId: string) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan pesanan tiket ini? Uang Anda akan direfund sesuai ketentuan.')) {
      onCancelBooking(bookingId);
      // Update local state if we cancelled a searched booking
      if (searchedBooking && searchedBooking.id === bookingId) {
        setSearchedBooking(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
      }
    }
  };

  // Search booking by code (either local or fetch from API)
  const handleSearchBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim() || !contactInfo.trim()) {
      setSearchError('Silakan isi Kode Booking dan Email/No. Telepon.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchedBooking(null);

    const queryCode = bookingCode.trim().toUpperCase();
    const queryContact = contactInfo.trim().toLowerCase();

    // 1. Coba cari di local state/localStorage first
    const foundLocal = bookings.find(b => 
      b.id.toUpperCase() === queryCode && 
      (b.contactEmail.toLowerCase() === queryContact || b.contactPhone === queryContact)
    );

    if (foundLocal) {
      setSearchedBooking(foundLocal);
      setIsSearching(false);
      return;
    }

    // 2. Coba fetch dari backend jika ada
    try {
      if (window.location.hostname !== 'localhost') {
        throw new Error('Not on localhost');
      }
      // Kita fetch seluruh booking milik contact (jika API mendukung)
      // Atau fetch spesifik detail (karena route API-nya: /api/bookings?userId=...)
      // Mari fetch dari database lokal jika backend aktif
      const res = await fetch(`http://localhost:3000/api/bookings?email=${queryContact}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const foundRemote = data.find((b: Booking) => b.id.toUpperCase() === queryCode);
          if (foundRemote) {
            setSearchedBooking(foundRemote);
            setIsSearching(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Gagal fetch booking dari database:', e);
    }

    setSearchError('Pesanan tidak ditemukan. Periksa kembali Kode Booking dan Email/No. Telepon Anda.');
    setIsSearching(false);
  };

  const renderBookingCard = (booking: Booking) => (
    <div key={booking.id} className="booking-history-card glass-card">
      {/* Card Top Info */}
      <div className="card-top-row">
        <div className="booking-code-info">
          <span className="booking-ref-label">KODE BOOKING</span>
          <span className="booking-ref-val">{booking.id}</span>
        </div>
        
        <div className="booking-status-badges">
          <span className={`status-badge ${booking.status === 'active' ? 'active' : 'cancelled'}`}>
            {booking.status === 'active' ? 'Aktif' : 'Dibatalkan'}
          </span>
          <span className="payment-status-badge">
            Lunas ({booking.paymentMethod})
          </span>
        </div>
      </div>

      {/* Card Middle: Route summary */}
      <div className="booking-route-summary">
        <div className="route-block">
          <div className="route-airline-mini">
            <Plane size={14} className="plane-rot" />
            <span>{booking.flightDetails.airlineName} ({booking.flightDetails.flightNumber})</span>
          </div>
          <div className="route-cities-row">
            <span className="city-code">{booking.flightDetails.fromCode}</span>
            <ArrowRight size={14} className="arrow-sep" />
            <span className="city-code">{booking.flightDetails.toCode}</span>
          </div>
          <span className="flight-date-info">{booking.flightDetails.date} • {booking.flightDetails.departureTime}</span>
        </div>

        {booking.returnFlightDetails && (
          <div className="route-block border-left">
            <div className="route-airline-mini return-mini">
              <Plane size={14} className="plane-rot-return" />
              <span>{booking.returnFlightDetails.airlineName} ({booking.returnFlightDetails.flightNumber})</span>
            </div>
            <div className="route-cities-row">
              <span className="city-code">{booking.returnFlightDetails.fromCode}</span>
              <ArrowRight size={14} className="arrow-sep" />
              <span className="city-code">{booking.returnFlightDetails.toCode}</span>
            </div>
            <span className="flight-date-info">{booking.returnFlightDetails.date} • {booking.returnFlightDetails.departureTime}</span>
          </div>
        )}
      </div>

      {/* Card Bottom: Summary Stats */}
      <div className="card-bottom-row">
        <div className="booking-passengers-summary">
          <span className="summary-lbl">PENUMPANG ({booking.passengers.length})</span>
          <span className="summary-val-passengers">
            {booking.passengers.map(p => p.fullName).join(', ')}
          </span>
        </div>

        <div className="booking-total-price">
          <span className="summary-lbl">TOTAL BIAYA</span>
          <span className="total-val">{formatCurrency(booking.totalPrice)}</span>
        </div>

        <div className="booking-actions">
          {booking.status === 'active' && (
            <>
              <button 
                className="btn btn-outline action-btn" 
                onClick={() => onViewTicket(booking)}
                title="Tampilkan Boarding Pass E-Ticket"
              >
                <Eye size={14} />
                <span>Lihat E-Ticket</span>
              </button>
              
              <button 
                className="btn btn-secondary cancel-btn-action" 
                onClick={() => handleCancelClick(booking.id)}
                title="Batalkan Penerbangan"
              >
                <Trash2 size={14} />
                <span>Batalkan</span>
              </button>
            </>
          )}
          {booking.status === 'cancelled' && (
            <div className="cancelled-message">
              <ShieldAlert size={14} />
              <span>Penerbangan Dibatalkan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="history-container animated-fade-in">
      <div className="history-header">
        <h2 className="history-title">Pesanan Saya</h2>
        <p className="history-subtitle">Kelola penerbangan dan unduh boarding pass Anda di sini</p>
      </div>

      {currentUser ? (
        // VIEW 1: Logged In (Show all bookings linked to account)
        userBookings.length === 0 ? (
          <div className="empty-history glass-card text-center">
            <Ticket size={54} className="empty-icon" />
            <h3>Belum Ada Tiket yang Dipesan</h3>
            <p>Anda belum memesan tiket pesawat. Cari rute liburan Anda berikutnya sekarang!</p>
            <button className="btn btn-primary empty-cta-btn" onClick={onNavigateHome}>
              Cari Tiket Pesawat
            </button>
          </div>
        ) : (
          <div className="bookings-list-container">
            {userBookings.map(renderBookingCard)}
          </div>
        )
      ) : (
        // VIEW 2: Not Logged In (Show Finder Form + optional Login banner)
        <div className="history-guest-layout">
          <div className="history-finder-panel glass-card">
            <div className="finder-header">
              <Search size={22} className="finder-icon" />
              <h3>Cari Pesanan Tanpa Login</h3>
            </div>
            <p className="finder-desc">
              Masukkan Kode Booking dan Email/No. Telepon kontak yang digunakan saat memesan tiket.
            </p>

            <form onSubmit={handleSearchBooking} className="finder-form">
              <div className="form-group">
                <label className="form-label">Kode Booking</label>
                <input
                  type="text"
                  placeholder="Contoh: AB1234"
                  className="form-input text-uppercase"
                  maxLength={10}
                  value={bookingCode}
                  onChange={e => setBookingCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email / No. Telepon</label>
                <input
                  type="text"
                  placeholder="email@example.com atau 0812..."
                  className="form-input"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                />
              </div>

              {searchError && (
                <div className="search-error-msg">
                  <AlertCircle size={14} />
                  <span>{searchError}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100" disabled={isSearching}>
                {isSearching ? 'Mencari...' : 'Cari Pesanan'}
              </button>
            </form>
          </div>

          <div className="history-login-banner glass-card text-center">
            <CheckCircle2 size={32} className="banner-icon" />
            <h4>Punya Akun FlyEase?</h4>
            <p>Masuk ke akun Anda untuk melihat semua riwayat pesanan Anda secara otomatis tanpa perlu dicari satu per satu.</p>
            <button className="btn btn-outline w-100" onClick={onLoginClick}>
              Masuk / Daftar Sekarang
            </button>
          </div>

          {/* If search succeeded, show the booking result below */}
          {searchedBooking && (
            <div className="search-result-area animated-fade-in">
              <h3 className="section-title-result">Hasil Pencarian Pesanan</h3>
              {renderBookingCard(searchedBooking)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
