import React, { useState } from 'react';
import { MapPin, Calendar, Users, Briefcase, ArrowRightLeft, Search } from 'lucide-react';
import { SearchParams, ClassType, Airport } from '../types';
import './FlightSearch.css';

interface FlightSearchProps {
  onSearch: (params: SearchParams) => void;
}

export const FlightSearch: React.FC<FlightSearchProps> = ({ onSearch }) => {
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
  const [fromCode, setFromCode] = useState<string>('CGK');
  const [toCode, setToCode] = useState<string>('DPS');
  const [airports, setAirports] = useState<Airport[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/airports')
      .then(res => res.json())
      .then(data => setAirports(data))
      .catch(err => console.error('Failed to fetch airports:', err));
  }, []);
  
  // Format today's date for defaults
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [departureDate, setDepartureDate] = useState<string>(getTodayString(1)); // default tomorrow
  const [returnDate, setReturnDate] = useState<string>(getTodayString(3));       // default 3 days from now
  const [passengers, setPassengers] = useState<number>(1);
  const [classType, setClassType] = useState<ClassType>('Economy');
  
  // Dropdown states
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);

  const fromAirport = airports.find(a => a.code === fromCode);
  const toAirport = airports.find(a => a.code === toCode);

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCode === toCode) {
      alert('Kota asal dan kota tujuan tidak boleh sama!');
      return;
    }
    
    onSearch({
      from: fromAirport?.city || '',
      fromCode,
      to: toAirport?.city || '',
      toCode,
      departureDate,
      returnDate: isRoundTrip ? returnDate : undefined,
      passengers,
      classType,
      isRoundTrip
    });
  };

  return (
    <div className="search-card glass-card animated-fade-in">
      <div className="search-header">
        <h2 className="search-title">Temukan Penerbangan Terbaik</h2>
        <p className="search-subtitle">Jelajahi dunia dengan kenyamanan kelas satu bersama FlyEase</p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        {/* Trip Type Selector */}
        <div className="trip-type-selector">
          <button
            type="button"
            className={`trip-type-btn ${!isRoundTrip ? 'active' : ''}`}
            onClick={() => setIsRoundTrip(false)}
          >
            Sekali Jalan
          </button>
          <button
            type="button"
            className={`trip-type-btn ${isRoundTrip ? 'active' : ''}`}
            onClick={() => setIsRoundTrip(true)}
          >
            Pulang Pergi
          </button>
        </div>

        {/* Search Grid */}
        <div className="search-grid">
          {/* Origin Airport */}
          <div className="search-input-container">
            <label className="form-label"><MapPin size={14} /> Asal</label>
            <div 
              className="custom-select-trigger" 
              onClick={() => { setShowFromSelect(!showFromSelect); setShowToSelect(false); }}
            >
              <span className="airport-code">{fromCode}</span>
              <span className="airport-detail">{fromAirport?.city} ({fromAirport?.name})</span>
            </div>
            {showFromSelect && (
              <div className="custom-select-options">
                {airports.map(airport => (
                  <div
                    key={`from-${airport.code}`}
                    className={`custom-option ${airport.code === fromCode ? 'selected' : ''}`}
                    onClick={() => {
                      setFromCode(airport.code);
                      setShowFromSelect(false);
                    }}
                  >
                    <span className="option-code">{airport.code}</span>
                    <div className="option-info">
                      <span className="option-city">{airport.city}</span>
                      <span className="option-name">{airport.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="swap-btn-container">
            <button type="button" className="swap-btn" onClick={handleSwapAirports} title="Tukar Rute">
              <ArrowRightLeft size={18} />
            </button>
          </div>

          {/* Destination Airport */}
          <div className="search-input-container">
            <label className="form-label"><MapPin size={14} /> Tujuan</label>
            <div 
              className="custom-select-trigger" 
              onClick={() => { setShowToSelect(!showToSelect); setShowFromSelect(false); }}
            >
              <span className="airport-code">{toCode}</span>
              <span className="airport-detail">{toAirport?.city} ({toAirport?.name})</span>
            </div>
            {showToSelect && (
              <div className="custom-select-options">
                {airports.map(airport => (
                  <div
                    key={`to-${airport.code}`}
                    className={`custom-option ${airport.code === toCode ? 'selected' : ''}`}
                    onClick={() => {
                      setToCode(airport.code);
                      setShowToSelect(false);
                    }}
                  >
                    <span className="option-code">{airport.code}</span>
                    <div className="option-info">
                      <span className="option-city">{airport.city}</span>
                      <span className="option-name">{airport.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="search-grid secondary-grid">
          {/* Departure Date */}
          <div className="form-group">
            <label className="form-label"><Calendar size={14} /> Keberangkatan</label>
            <input
              type="date"
              className="form-input"
              value={departureDate}
              min={getTodayString()}
              onChange={(e) => {
                setDepartureDate(e.target.value);
                if (isRoundTrip && new Date(e.target.value) > new Date(returnDate)) {
                  setReturnDate(e.target.value);
                }
              }}
              required
            />
          </div>

          {/* Return Date */}
          <div className={`form-group ${!isRoundTrip ? 'disabled' : ''}`}>
            <label className="form-label"><Calendar size={14} /> Kepulangan</label>
            <input
              type="date"
              className="form-input"
              value={returnDate}
              min={departureDate}
              disabled={!isRoundTrip}
              onChange={(e) => setReturnDate(e.target.value)}
              required={isRoundTrip}
            />
          </div>

          {/* Passengers */}
          <div className="form-group">
            <label className="form-label"><Users size={14} /> Penumpang</label>
            <select
              className="form-input select-input"
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} Penumpang</option>
              ))}
            </select>
          </div>

          {/* Cabin Class */}
          <div className="form-group">
            <label className="form-label"><Briefcase size={14} /> Kelas Kabin</label>
            <select
              className="form-input select-input"
              value={classType}
              onChange={(e) => setClassType(e.target.value as ClassType)}
            >
              <option value="Economy">Ekonomi</option>
              <option value="Business">Bisnis</option>
              <option value="First">First Class</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="search-action-container">
          <button type="submit" className="btn btn-primary search-submit-btn">
            <Search size={18} />
            Cari Penerbangan
          </button>
        </div>
      </form>
    </div>
  );
};
