import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Users, Briefcase, ArrowRightLeft, Search, X } from 'lucide-react';
import { SearchParams, ClassType, Airport } from '../types';
import { airports as staticAirports } from '../data/mockData';
import './FlightSearch.css';

interface FlightSearchProps {
  onSearch: (params: SearchParams) => void;
}

export const FlightSearch: React.FC<FlightSearchProps> = ({ onSearch }) => {
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
  const [fromCode, setFromCode] = useState<string>('CGK');
  const [toCode, setToCode] = useState<string>('DPS');
  const [airports, setAirports] = useState<Airport[]>(staticAirports);

  React.useEffect(() => {
    if (window.location.hostname !== 'localhost') {
      setAirports(staticAirports);
      return;
    }
    fetch('http://localhost:3000/api/airports')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAirports(data);
      })
      .catch(() => {
        // Backend tidak tersedia, gunakan data statis
        setAirports(staticAirports);
      });
  }, []);

  // Format today's date for defaults
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [departureDate, setDepartureDate] = useState<string>(getTodayString(1));
  const [returnDate, setReturnDate] = useState<string>(getTodayString(3));
  const [passengers, setPassengers] = useState<number>(1);
  const [classType, setClassType] = useState<ClassType>('Economy');

  // Dropdown + search states
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromSelect(false);
        setFromSearch('');
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToSelect(false);
        setToSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fromAirport = airports.find(a => a.code === fromCode);
  const toAirport = airports.find(a => a.code === toCode);

  const filterAirports = (query: string) => {
    if (!query) return airports;
    const q = query.toLowerCase();
    return airports.filter(a =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
    );
  };

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCode) {
      alert('Kota asal wajib dipilih!');
      return;
    }
    if (!toCode) {
      alert('Kota tujuan wajib dipilih!');
      return;
    }
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
      returnDate: (isRoundTrip || returnDate) ? returnDate : undefined,
      passengers,
      classType,
      isRoundTrip
    });
  };

  const AirportOption = ({
    airport,
    isSelected,
    onClick,
  }: {
    airport: Airport;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <div
      className={`custom-option ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span className="option-code">{airport.code}</span>
      <div className="option-info">
        <span className="option-city">{airport.city}</span>
        <span className="option-name">{airport.name}</span>
      </div>
      <span className="option-country">{airport.country}</span>
    </div>
  );

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
          <div className="search-input-container" ref={fromRef}>
            <label className="form-label"><MapPin size={14} /> Asal</label>
            <div
              className={`custom-select-trigger ${showFromSelect ? 'open' : ''}`}
              onClick={() => {
                setShowFromSelect(!showFromSelect);
                setShowToSelect(false);
                setToSearch('');
              }}
            >
              <span className="airport-code">{fromCode}</span>
              <span className="airport-detail">{fromAirport?.city} — {fromAirport?.country}</span>
            </div>
            {showFromSelect && (
              <div className="custom-select-options">
                <div className="airport-search-box">
                  <Search size={14} className="airport-search-icon" />
                  <input
                    autoFocus
                    type="text"
                    className="airport-search-input"
                    placeholder="Cari kota atau kode bandara..."
                    value={fromSearch}
                    onChange={e => setFromSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                  {fromSearch && (
                    <button type="button" className="airport-search-clear" onClick={e => { e.stopPropagation(); setFromSearch(''); }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="airport-options-list">
                  {filterAirports(fromSearch).length === 0 ? (
                    <div className="airport-no-result">Bandara tidak ditemukan</div>
                  ) : filterAirports(fromSearch).map(airport => (
                    <AirportOption
                      key={`from-${airport.code}`}
                      airport={airport}
                      isSelected={airport.code === fromCode}
                      onClick={() => { setFromCode(airport.code); setShowFromSelect(false); setFromSearch(''); }}
                    />
                  ))}
                </div>
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
          <div className="search-input-container" ref={toRef}>
            <label className="form-label"><MapPin size={14} /> Tujuan</label>
            <div
              className={`custom-select-trigger ${showToSelect ? 'open' : ''}`}
              onClick={() => {
                setShowToSelect(!showToSelect);
                setShowFromSelect(false);
                setFromSearch('');
              }}
            >
              <span className="airport-code">{toCode}</span>
              <span className="airport-detail">{toAirport?.city} — {toAirport?.country}</span>
            </div>
            {showToSelect && (
              <div className="custom-select-options">
                <div className="airport-search-box">
                  <Search size={14} className="airport-search-icon" />
                  <input
                    autoFocus
                    type="text"
                    className="airport-search-input"
                    placeholder="Cari kota atau kode bandara..."
                    value={toSearch}
                    onChange={e => setToSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                  {toSearch && (
                    <button type="button" className="airport-search-clear" onClick={e => { e.stopPropagation(); setToSearch(''); }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="airport-options-list">
                  {filterAirports(toSearch).length === 0 ? (
                    <div className="airport-no-result">Bandara tidak ditemukan</div>
                  ) : filterAirports(toSearch).map(airport => (
                    <AirportOption
                      key={`to-${airport.code}`}
                      airport={airport}
                      isSelected={airport.code === toCode}
                      onClick={() => { setToCode(airport.code); setShowToSelect(false); setToSearch(''); }}
                    />
                  ))}
                </div>
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
                if (new Date(e.target.value) > new Date(returnDate)) {
                  setReturnDate(e.target.value);
                }
              }}
              required
            />
          </div>

          {/* Return Date — always editable */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={14} /> Kepulangan
              {!isRoundTrip && <span className="optional-label">(Opsional)</span>}
            </label>
            <input
              type="date"
              className={`form-input ${!isRoundTrip ? 'input-optional' : ''}`}
              value={returnDate}
              min={departureDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required={isRoundTrip}
            />
          </div>

          {/* Passengers — up to 10 */}
          <div className="form-group">
            <label className="form-label"><Users size={14} /> Penumpang</label>
            <select
              className="form-input select-input"
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
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
