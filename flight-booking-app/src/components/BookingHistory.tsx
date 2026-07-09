import React from 'react';
import { Plane, Calendar, ShieldAlert, ArrowRight, Eye, Trash2, Ticket } from 'lucide-react';
import { Booking } from '../types';
import './BookingHistory.css';

interface BookingHistoryProps {
  bookings: Booking[];
  onViewTicket: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onNavigateHome: () => void;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({
  bookings,
  onViewTicket,
  onCancelBooking,
  onNavigateHome
}) => {
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
    }
  };

  return (
    <div className="history-container animated-fade-in">
      <div className="history-header">
        <h2 className="history-title">Pesanan Saya</h2>
        <p className="history-subtitle">Kelola penerbangan dan unduh boarding pass Anda di sini</p>
      </div>

      {bookings.length === 0 ? (
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
          {bookings.map(booking => (
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
          ))}
        </div>
      )}
    </div>
  );
};
