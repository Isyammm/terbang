import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowRight, Plane, Clock, Award, ChevronRight } from 'lucide-react';
import { Flight, SearchParams } from '../types';
import './FlightResults.css';

interface FlightResultsProps {
  flights: Flight[];
  searchParams: SearchParams;
  onSelectFlight: (flight: Flight) => void;
  selectionType: 'outbound' | 'inbound';
}

type SortOption = 'cheapest' | 'fastest' | 'earliest' | 'latest';

export const FlightResults: React.FC<FlightResultsProps> = ({
  flights,
  searchParams,
  onSelectFlight,
  selectionType
}) => {
  // Sort State
  const [sortBy, setSortBy] = useState<SortOption>('cheapest');

  // Filter States
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    if (flights.length === 0) return 15000000;
    return Math.max(...flights.map(f => f.price));
  });
  
  const minPrice = useMemo(() => {
    if (flights.length === 0) return 0;
    return Math.min(...flights.map(f => f.price));
  }, [flights]);

  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [transitFilter, setTransitFilter] = useState<'all' | 'direct' | 'transit'>('all');

  // Unique airlines for filters
  const uniqueAirlines = useMemo(() => {
    const names = new Set<string>();
    flights.forEach(f => names.add(f.airlineName));
    return Array.from(names);
  }, [flights]);

  // Handle Airline checkbox toggle
  const handleAirlineToggle = (airlineName: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airlineName) 
        ? prev.filter(name => name !== airlineName)
        : [...prev, airlineName]
    );
  };

  // Filter & Sort Logic
  const filteredAndSortedFlights = useMemo(() => {
    let result = [...flights];

    // Filter by Price
    result = result.filter(f => f.price <= maxPrice);

    // Filter by Airline
    if (selectedAirlines.length > 0) {
      result = result.filter(f => selectedAirlines.includes(f.airlineName));
    }

    // Filter by Transit
    if (transitFilter === 'direct') {
      result = result.filter(f => f.stops === 0);
    } else if (transitFilter === 'transit') {
      result = result.filter(f => f.stops > 0);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'cheapest') {
        return a.price - b.price;
      }
      if (sortBy === 'fastest') {
        const getMinutes = (d: string) => {
          const parts = d.match(/(\d+)j\s*(\d+)m/);
          if (!parts) return 0;
          return Number(parts[1]) * 60 + Number(parts[2]);
        };
        return getMinutes(a.duration) - getMinutes(b.duration);
      }
      if (sortBy === 'earliest') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      if (sortBy === 'latest') {
        return b.departureTime.localeCompare(a.departureTime);
      }
      return 0;
    });

    return result;
  }, [flights, sortBy, maxPrice, selectedAirlines, transitFilter]);

  // Format Currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="results-container animated-fade-in">
      {/* Route Header */}
      <div className="results-header glass-card">
        <div className="route-info">
          <span className="route-badge">
            {selectionType === 'outbound' ? 'Penerbangan Pergi' : 'Penerbangan Pulang'}
          </span>
          <div className="route-title">
            <h2>{selectionType === 'outbound' ? searchParams.from : searchParams.to}</h2>
            <ArrowRight className="route-arrow" />
            <h2>{selectionType === 'outbound' ? searchParams.to : searchParams.from}</h2>
          </div>
          <p className="route-details">
            {selectionType === 'outbound' ? searchParams.departureDate : searchParams.returnDate} • {searchParams.passengers} Penumpang • {searchParams.classType}
          </p>
        </div>
      </div>

      <div className="results-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar glass-card">
          <div className="sidebar-title">
            <Filter size={18} />
            <h3>Filter Pencarian</h3>
          </div>

          {/* Transit Filter */}
          <div className="filter-section">
            <h4 className="filter-label">Transit</h4>
            <div className="transit-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="transit"
                  checked={transitFilter === 'all'}
                  onChange={() => setTransitFilter('all')}
                />
                <span>Semua</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="transit"
                  checked={transitFilter === 'direct'}
                  onChange={() => setTransitFilter('direct')}
                />
                <span>Langsung (Non-stop)</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="transit"
                  checked={transitFilter === 'transit'}
                  onChange={() => setTransitFilter('transit')}
                />
                <span>1+ Transit</span>
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h4 className="filter-label">Harga Maksimal</h4>
            <div className="price-slider-container">
              <input
                type="range"
                className="price-range-slider"
                min={minPrice}
                max={flights.length > 0 ? Math.max(...flights.map(f => f.price)) : 10000000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="price-labels">
                <span>{formatCurrency(minPrice)}</span>
                <span className="current-max">{formatCurrency(maxPrice)}</span>
              </div>
            </div>
          </div>

          {/* Airlines Filter */}
          <div className="filter-section">
            <h4 className="filter-label">Maskapai</h4>
            <div className="airline-options">
              {uniqueAirlines.map(airlineName => (
                <label key={airlineName} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedAirlines.includes(airlineName)}
                    onChange={() => handleAirlineToggle(airlineName)}
                  />
                  <span>{airlineName}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Flight Cards Main List */}
        <main className="flights-main">
          {/* Sorting Bar */}
          <div className="sorting-bar glass-card">
            <div className="sorting-label">
              <SlidersHorizontal size={16} />
              <span>Urutkan:</span>
            </div>
            <div className="sorting-tabs">
              <button
                className={`sort-tab ${sortBy === 'cheapest' ? 'active' : ''}`}
                onClick={() => setSortBy('cheapest')}
              >
                Termurah
              </button>
              <button
                className={`sort-tab ${sortBy === 'fastest' ? 'active' : ''}`}
                onClick={() => setSortBy('fastest')}
              >
                Tercepat
              </button>
              <button
                className={`sort-tab ${sortBy === 'earliest' ? 'active' : ''}`}
                onClick={() => setSortBy('earliest')}
              >
                Terawal
              </button>
              <button
                className={`sort-tab ${sortBy === 'latest' ? 'active' : ''}`}
                onClick={() => setSortBy('latest')}
              >
                Terakhir
              </button>
            </div>
          </div>

          {/* List of Flights */}
          <div className="flights-list">
            {filteredAndSortedFlights.length === 0 ? (
              <div className="no-flights glass-card">
                <Plane size={48} className="no-flights-icon" />
                <h3>Tidak Ada Penerbangan Ditemukan</h3>
                <p>Silakan sesuaikan filter pencarian atau range harga Anda.</p>
              </div>
            ) : (
              filteredAndSortedFlights.map(flight => (
                <div key={flight.id} className="flight-card glass-card">
                  {/* Airline Info */}
                  <div className="flight-airline">
                    <div 
                      className="airline-logo-circle"
                      style={{ backgroundColor: flight.airlineId === 'GA' ? '#005C8A' : 
                                              flight.airlineId === 'SQ' ? '#F5A623' : 
                                              flight.airlineId === 'ID' ? '#A81C25' : 
                                              flight.airlineId === 'QG' ? '#4A90E2' : 
                                              flight.airlineId === 'JL' ? '#E60012' : '#E01933' }}
                    >
                      <Plane size={16} className="airline-plane-icon" />
                    </div>
                    <div>
                      <h4 className="airline-name-text">{flight.airlineName}</h4>
                      <span className="flight-number-text">{flight.flightNumber}</span>
                    </div>
                  </div>

                  {/* Flight Schedule Details */}
                  <div className="flight-schedule">
                    <div className="time-node departure">
                      <span className="time">{flight.departureTime}</span>
                      <span className="airport-code-label">{flight.fromCode}</span>
                    </div>
                    
                    <div className="duration-line">
                      <span className="duration-text">{flight.duration}</span>
                      <div className="line-bar">
                        <div className="circle-node"></div>
                        <div className="line"></div>
                        <div className="plane-mini-container">
                          <Plane size={12} className="plane-mini" />
                        </div>
                        <div className="line"></div>
                        <div className="circle-node"></div>
                      </div>
                      <span className="transit-text">
                        {flight.stops === 0 ? 'Langsung' : `${flight.stops} Transit`}
                      </span>
                    </div>

                    <div className="time-node arrival">
                      <span className="time">{flight.arrivalTime}</span>
                      <span className="airport-code-label">{flight.toCode}</span>
                    </div>
                  </div>

                  {/* Ticket Price & Actions */}
                  <div className="flight-price-action">
                    <div className="price-detail">
                      <span className="price-tag">{formatCurrency(flight.price)}</span>
                      <span className="price-info">/ pax</span>
                    </div>
                    <button 
                      className="btn btn-primary select-btn"
                      onClick={() => onSelectFlight(flight)}
                    >
                      <span>Pilih</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
