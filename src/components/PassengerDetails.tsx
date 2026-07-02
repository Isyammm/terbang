import React, { useState } from 'react';
import { User, Contact, ChevronRight } from 'lucide-react';
import { SeatMap } from './SeatMap';
import { Passenger, SearchParams, Flight } from '../types';
import './PassengerDetails.css';

interface PassengerDetailsProps {
  searchParams: SearchParams;
  flight: Flight;
  onProceed: (passengers: Passenger[], contactEmail: string, contactPhone: string) => void;
}

export const PassengerDetails: React.FC<PassengerDetailsProps> = ({
  searchParams,
  flight,
  onProceed
}) => {
  const passengerCount = searchParams.passengers;
  const isInternational = ['SIN', 'HND', 'SYD'].includes(flight.fromCode) || ['SIN', 'HND', 'SYD'].includes(flight.toCode);

  // Initialize passenger list state
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    return Array.from({ length: passengerCount }).map((_, i) => ({
      id: `p-${i}`,
      title: 'Mr',
      fullName: '',
      nationality: 'Indonesia',
      passportNumber: ''
    }));
  });

  // Contact info
  const [contactEmail, setContactEmail] = useState('hisyam.yassar@gmail.com');
  const [contactPhone, setContactPhone] = useState('+62 813-5536-4117');

  // Selected seats state: { passengerIndex: seatId }
  const [selectedSeats, setSelectedSeats] = useState<{ [passengerIndex: number]: string }>({});
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState<number>(0);

  // Handle passenger input changes
  const handleInputChange = (idx: number, field: keyof Passenger, value: string) => {
    setPassengers(prev => 
      prev.map((p, i) => i === idx ? { ...p, [field]: value } : p)
    );
  };

  // Seat Select handler
  const handleSeatSelect = (passengerIndex: number, seatId: string) => {
    setSelectedSeats(prev => {
      // Create new selections copy
      const next = { ...prev };
      // Assign seat
      next[passengerIndex] = seatId;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Passenger Names
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].fullName.trim()) {
        alert(`Nama lengkap Penumpang ${i + 1} tidak boleh kosong!`);
        return;
      }
      if (isInternational && !passengers[i].passportNumber?.trim()) {
        alert(`Nomor Passport Penumpang ${i + 1} wajib diisi untuk rute internasional!`);
        return;
      }
    }

    // Validate Seats
    for (let i = 0; i < passengers.length; i++) {
      if (!selectedSeats[i]) {
        alert(`Harap pilih kursi untuk Penumpang ${i + 1}!`);
        setCurrentPassengerIndex(i); // switch to the passenger that doesn't have a seat
        return;
      }
    }

    // Map seats back to passenger records
    const finalPassengers = passengers.map((p, idx) => ({
      ...p,
      seatId: selectedSeats[idx],
      seatNumber: selectedSeats[idx]
    }));

    onProceed(finalPassengers, contactEmail, contactPhone);
  };

  return (
    <form onSubmit={handleSubmit} className="details-container animated-fade-in">
      <div className="details-layout">
        
        {/* Left Side: Forms */}
        <div className="forms-section">
          {/* Contact Details */}
          <div className="details-card glass-card">
            <div className="card-header-icon">
              <Contact size={20} className="header-icon" />
              <h3>Informasi Kontak</h3>
            </div>
            
            <div className="contact-grid">
              <div className="form-group">
                <label className="form-label">Email Kontak</label>
                <input
                  type="email"
                  className="form-input"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input
                  type="tel"
                  className="form-input"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  placeholder="+62 8xxx"
                />
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="details-card glass-card">
            <div className="card-header-icon">
              <User size={20} className="header-icon" />
              <h3>Detail Penumpang</h3>
            </div>

            <div className="passengers-list-form">
              {passengers.map((passenger, idx) => (
                <div key={passenger.id} className="passenger-form-block">
                  <div className="block-title">
                    <span className="passenger-num">#{idx + 1}</span>
                    <h4>Penumpang {idx + 1}</h4>
                  </div>

                  <div className="passenger-fields">
                    <div className="form-group-row">
                      <div className="form-group title-group">
                        <label className="form-label">Gelar</label>
                        <select
                          className="form-input select-input"
                          value={passenger.title}
                          onChange={(e) => handleInputChange(idx, 'title', e.target.value as any)}
                        >
                          <option value="Mr">Tuan (Mr)</option>
                          <option value="Mrs">Nyonya (Mrs)</option>
                          <option value="Ms">Nona (Ms)</option>
                          <option value="Mstr">Anak (Mstr)</option>
                        </select>
                      </div>

                      <div className="form-group name-group">
                        <label className="form-label">Nama Lengkap (sesuai ID)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={passenger.fullName}
                          onChange={(e) => handleInputChange(idx, 'fullName', e.target.value)}
                          required
                          placeholder="Contoh: Hisyam Yassar"
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label className="form-label">Kewarganegaraan</label>
                        <input
                          type="text"
                          className="form-input"
                          value={passenger.nationality}
                          onChange={(e) => handleInputChange(idx, 'nationality', e.target.value)}
                          required
                        />
                      </div>

                      {isInternational && (
                        <div className="form-group">
                          <label className="form-label">Nomor Passport</label>
                          <input
                            type="text"
                            className="form-input"
                            value={passenger.passportNumber || ''}
                            onChange={(e) => handleInputChange(idx, 'passportNumber', e.target.value)}
                            required={isInternational}
                            placeholder="Axxxxxxx"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Seat Map */}
        <div className="seats-section">
          <SeatMap
            passengerNames={passengers.map(p => p.fullName)}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            currentPassengerIndex={currentPassengerIndex}
            setCurrentPassengerIndex={setCurrentPassengerIndex}
            classType={flight.classType}
          />

          <button type="submit" className="btn btn-primary proceed-btn">
            Lanjutkan ke Pembayaran
            <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </form>
  );
};
