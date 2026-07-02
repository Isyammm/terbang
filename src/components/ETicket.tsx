import React, { useRef } from 'react';
import { Plane, ArrowRight, Printer, Home, CheckCircle } from 'lucide-react';
import { Booking } from '../types';
import './ETicket.css';

interface ETicketProps {
  booking: Booking;
  onClose: () => void;
}

export const ETicket: React.FC<ETicketProps> = ({ booking, onClose }) => {
  const ticketRef = useRef<HTMLDivElement>(null);


  const handlePrint = () => {
    // Standard mock print confirmation
    alert('Simulasi Print: E-Ticket Anda siap diunduh dalam format PDF!');
    window.print();
  };

  return (
    <div className="eticket-wrapper animated-fade-in">
      {/* Top Banner Confirmation */}
      <div className="eticket-banner glass-card">
        <CheckCircle className="banner-success-icon" size={32} />
        <div className="banner-content">
          <h3>E-Ticket Berhasil Diterbitkan!</h3>
          <p>Kode Booking Anda: <strong className="booking-ref-code">{booking.id}</strong></p>
        </div>
        <div className="banner-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} />
            <span>Cetak PDF</span>
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            <Home size={16} />
            <span>Ke Beranda</span>
          </button>
        </div>
      </div>

      <h3 className="section-title-label">E-Ticket & Boarding Pass</h3>

      {/* Ticket Loop for each passenger */}
      <div className="tickets-stack" ref={ticketRef}>
        {booking.passengers.map((passenger, idx) => (
          <div key={passenger.id} className="boarding-pass-card">
            
            {/* Left Side: Main Boarding Pass */}
            <div className="pass-main">
              <div className="pass-header">
                <div className="pass-airline">
                  <div 
                    className="airline-logo-circle-mini"
                    style={{ backgroundColor: booking.flightDetails.airlineId === 'GA' ? '#005C8A' : 
                                            booking.flightDetails.airlineId === 'SQ' ? '#F5A623' : 
                                            booking.flightDetails.airlineId === 'ID' ? '#A81C25' : 
                                            booking.flightDetails.airlineId === 'QG' ? '#4A90E2' : 
                                            booking.flightDetails.airlineId === 'JL' ? '#E60012' : '#E01933' }}
                  >
                    <Plane size={14} className="airline-plane-icon" />
                  </div>
                  <span className="pass-airline-name">{booking.flightDetails.airlineName}</span>
                </div>
                <div className="pass-class-badge">{booking.flightDetails.classType}</div>
              </div>

              <div className="pass-body">
                {/* Route */}
                <div className="pass-route-row">
                  <div className="route-node">
                    <span className="pass-city">{booking.flightDetails.from}</span>
                    <span className="pass-code">{booking.flightDetails.fromCode}</span>
                  </div>
                  <div className="route-connector">
                    <Plane size={16} className="connector-plane" />
                    <div className="connector-dash-line"></div>
                  </div>
                  <div className="route-node text-right">
                    <span className="pass-city">{booking.flightDetails.to}</span>
                    <span className="pass-code">{booking.flightDetails.toCode}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="pass-details-grid">
                  <div className="grid-item">
                    <span className="grid-label">NAMA PENUMPANG</span>
                    <span className="grid-val">{passenger.title}. {passenger.fullName}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">NOMOR PENERBANGAN</span>
                    <span className="grid-val">{booking.flightDetails.flightNumber}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">TANGGAL TERBANG</span>
                    <span className="grid-val">{booking.flightDetails.date}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">JAM KEBERANGKATAN</span>
                    <span className="grid-val">{booking.flightDetails.departureTime}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">BOARDING TIME</span>
                    <span className="grid-val">
                      {(() => {
                        const [h, m] = booking.flightDetails.departureTime.split(':').map(Number);
                        const bh = m < 30 ? (h - 1 + 24) % 24 : h;
                        const bm = (m - 30 + 60) % 60;
                        return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`;
                      })()}
                    </span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">GATE</span>
                    <span className="grid-val">G-{2 + (idx % 4)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom barcode mock info */}
              <div className="pass-footer">
                <div className="barcode-mock-container">
                  <div className="barcode-lines"></div>
                  <span className="barcode-digits">FE-{booking.id}-{idx + 1}</span>
                </div>
              </div>
            </div>

            {/* Dash Tear Line Separator */}
            <div className="pass-separator">
              <div className="tear-circle top"></div>
              <div className="dashed-line"></div>
              <div className="tear-circle bottom"></div>
            </div>

            {/* Right Side: Boarding Pass Stub */}
            <div className="pass-stub">
              <div className="stub-header">
                <span className="stub-title">BOARDING PASS STUB</span>
              </div>
              <div className="stub-body">
                <div className="stub-cities-row">
                  <span>{booking.flightDetails.fromCode}</span>
                  <ArrowRight size={12} />
                  <span>{booking.flightDetails.toCode}</span>
                </div>
                
                <div className="stub-details">
                  <div className="stub-item">
                    <span className="stub-label">SEAT</span>
                    <span className="stub-val-highlight">{passenger.seatNumber}</span>
                  </div>
                  <div className="stub-item">
                    <span className="stub-label">FLIGHT</span>
                    <span className="stub-val">{booking.flightDetails.flightNumber}</span>
                  </div>
                  <div className="stub-item">
                    <span className="stub-label">PASSENGER</span>
                    <span className="stub-val-name">{passenger.fullName}</span>
                  </div>
                  <div className="stub-item">
                    <span className="stub-label">CLASS</span>
                    <span className="stub-val">{booking.flightDetails.classType}</span>
                  </div>
                </div>

                <div className="stub-qr-mock">
                  <svg viewBox="0 0 100 100" className="stub-qr-svg">
                    <path d="M10 10h20v20h-20zm0 40h20v20h-20zm40-40h20v20h-20zm10 30h10v10h-10zm10 10h10v10h-10zm-20 10h10v10h-10z" fill="white" />
                  </svg>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Return Flight Ticket if booked */}
      {booking.returnFlightDetails && (
        <>
          <h3 className="section-title-label return-title-label">E-Ticket & Boarding Pass (Kepulangan)</h3>
          <div className="tickets-stack">
            {booking.passengers.map((passenger, idx) => (
              <div key={`ret-${passenger.id}`} className="boarding-pass-card return-pass">
                
                <div className="pass-main">
                  <div className="pass-header">
                    <div className="pass-airline">
                      <div 
                        className="airline-logo-circle-mini return-bg"
                        style={{ backgroundColor: booking.returnFlightDetails?.airlineId === 'GA' ? '#005C8A' : 
                                                booking.returnFlightDetails?.airlineId === 'SQ' ? '#F5A623' : 
                                                booking.returnFlightDetails?.airlineId === 'ID' ? '#A81C25' : 
                                                booking.returnFlightDetails?.airlineId === 'QG' ? '#4A90E2' : 
                                                booking.returnFlightDetails?.airlineId === 'JL' ? '#E60012' : '#E01933' }}
                      >
                        <Plane size={14} className="airline-plane-icon" />
                      </div>
                      <span className="pass-airline-name">{booking.returnFlightDetails?.airlineName}</span>
                    </div>
                    <div className="pass-class-badge">{booking.returnFlightDetails?.classType}</div>
                  </div>

                  <div className="pass-body">
                    <div className="pass-route-row">
                      <div className="route-node">
                        <span className="pass-city">{booking.returnFlightDetails?.from}</span>
                        <span className="pass-code">{booking.returnFlightDetails?.fromCode}</span>
                      </div>
                      <div className="route-connector">
                        <Plane size={16} className="connector-plane" />
                        <div className="connector-dash-line"></div>
                      </div>
                      <div className="route-node text-right">
                        <span className="pass-city">{booking.returnFlightDetails?.to}</span>
                        <span className="pass-code">{booking.returnFlightDetails?.toCode}</span>
                      </div>
                    </div>

                    <div className="pass-details-grid">
                      <div className="grid-item">
                        <span className="grid-label">NAMA PENUMPANG</span>
                        <span className="grid-val">{passenger.title}. {passenger.fullName}</span>
                      </div>
                      <div className="grid-item">
                        <span className="grid-label">NOMOR PENERBANGAN</span>
                        <span className="grid-val">{booking.returnFlightDetails?.flightNumber}</span>
                      </div>
                      <div className="grid-item">
                        <span className="grid-label">TANGGAL TERBANG</span>
                        <span className="grid-val">{booking.returnFlightDetails?.date}</span>
                      </div>
                      <div className="grid-item">
                        <span className="grid-label">JAM KEBERANGKATAN</span>
                        <span className="grid-val">{booking.returnFlightDetails?.departureTime}</span>
                      </div>
                      <div className="grid-item">
                        <span className="grid-label">BOARDING TIME</span>
                        <span className="grid-val">
                          {(() => {
                            if (!booking.returnFlightDetails) return '';
                            const [h, m] = booking.returnFlightDetails.departureTime.split(':').map(Number);
                            const bh = m < 30 ? (h - 1 + 24) % 24 : h;
                            const bm = (m - 30 + 60) % 60;
                            return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`;
                          })()}
                        </span>
                      </div>
                      <div className="grid-item">
                        <span className="grid-label">GATE</span>
                        <span className="grid-val">G-{5 + (idx % 4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pass-footer">
                    <div className="barcode-mock-container">
                      <div className="barcode-lines"></div>
                      <span className="barcode-digits">FE-{booking.id}-RET-{idx + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="pass-separator">
                  <div className="tear-circle top"></div>
                  <div className="dashed-line"></div>
                  <div className="tear-circle bottom"></div>
                </div>

                <div className="pass-stub">
                  <div className="stub-header">
                    <span className="stub-title">BOARDING PASS STUB</span>
                  </div>
                  <div className="stub-body">
                    <div className="stub-cities-row">
                      <span>{booking.returnFlightDetails?.fromCode}</span>
                      <ArrowRight size={12} />
                      <span>{booking.returnFlightDetails?.toCode}</span>
                    </div>
                    
                    <div className="stub-details">
                      <div className="stub-item">
                        <span className="stub-label">SEAT</span>
                        <span className="stub-val-highlight">{passenger.seatNumber ? `${parseInt(passenger.seatNumber) + 1}${passenger.seatNumber.replace(/[0-9]/g, '')}` : ''}</span>
                      </div>
                      <div className="stub-item">
                        <span className="stub-label">FLIGHT</span>
                        <span className="stub-val">{booking.returnFlightDetails?.flightNumber}</span>
                      </div>
                      <div className="stub-item">
                        <span className="stub-label">PASSENGER</span>
                        <span className="stub-val-name">{passenger.fullName}</span>
                      </div>
                      <div className="stub-item">
                        <span className="stub-label">CLASS</span>
                        <span className="stub-val">{booking.returnFlightDetails?.classType}</span>
                      </div>
                    </div>

                    <div className="stub-qr-mock">
                      <svg viewBox="0 0 100 100" className="stub-qr-svg">
                        <path d="M10 10h20v20h-20zm0 40h20v20h-20zm40-40h20v20h-20zm10 30h10v10h-10zm10 10h10v10h-10zm-20 10h10v10h-10z" fill="white" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
