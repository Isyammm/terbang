import React from 'react';
import { Armchair } from 'lucide-react';
import { Seat } from '../types';
import './SeatMap.css';

interface SeatMapProps {
  passengerNames: string[];
  selectedSeats: { [passengerIndex: number]: string }; // passengerIndex -> seatId
  onSeatSelect: (passengerIndex: number, seatId: string) => void;
  currentPassengerIndex: number;
  setCurrentPassengerIndex: (index: number) => void;
  classType: 'Economy' | 'Business' | 'First';
}

export const SeatMap: React.FC<SeatMapProps> = ({
  passengerNames,
  selectedSeats,
  onSeatSelect,
  currentPassengerIndex,
  setCurrentPassengerIndex,
  classType
}) => {
  // Generate a map of occupied seats deterministically for display
  const isSeatOccupied = (row: number, col: string): boolean => {
    // Row + Col hash
    const val = (row * 7 + col.charCodeAt(0)) % 5;
    return val === 0; // 20% of seats are occupied
  };

  const getSeatType = (col: string): 'window' | 'aisle' | 'middle' => {
    if (col === 'A' || col === 'F') return 'window';
    if (col === 'C' || col === 'D') return 'aisle';
    return 'middle';
  };

  const getSeatPriceAddition = (row: number, col: string): number => {
    let addition = 0;
    if (row === 1 || row === 4) addition += 150000; // Extra Legroom / Front row
    if (col === 'A' || col === 'F') addition += 50000; // Window Seat
    return addition;
  };

  // Render business or economy grid depending on selected flight class
  const renderCabin = () => {
    const rows = classType === 'Business' ? [1, 2, 3] : [4, 5, 6, 7, 8, 9, 10];
    const cols = classType === 'Business' ? ['A', 'B', 'E', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
      <div className="cabin-grid">
        {/* Cabin Header */}
        <div className="cabin-header">
          <span>DEPAN</span>
          <div className="cockpit-divider"></div>
        </div>

        {/* Seat Rows */}
        {rows.map(row => (
          <div key={`row-${row}`} className="seat-row">
            <span className="row-number">{row}</span>
            
            {/* Left Column Group */}
            <div className="col-group">
              {cols.slice(0, cols.length / 2).map(col => {
                const seatId = `${row}${col}`;
                const occupied = isSeatOccupied(row, col);
                
                // Check if this seat is selected by ANY passenger
                let selectedByPassengerIndex = -1;
                Object.entries(selectedSeats).forEach(([idx, id]) => {
                  if (id === seatId) selectedByPassengerIndex = Number(idx);
                });
                
                const isSelectedByCurrent = selectedByPassengerIndex === currentPassengerIndex;
                const isSelectedByOther = selectedByPassengerIndex !== -1 && !isSelectedByCurrent;

                const seatType = getSeatType(col);
                const priceAdd = getSeatPriceAddition(row, col);

                return (
                  <button
                    key={seatId}
                    type="button"
                    disabled={occupied || isSelectedByOther}
                    className={`seat-btn 
                      ${occupied ? 'occupied' : ''} 
                      ${isSelectedByCurrent ? 'selected' : ''} 
                      ${isSelectedByOther ? 'selected-other' : ''}
                      ${seatType}
                    `}
                    onClick={() => onSeatSelect(currentPassengerIndex, seatId)}
                    title={`Kursi ${seatId} (${seatType}) ${priceAdd > 0 ? `+Rp ${priceAdd.toLocaleString()}` : ''}`}
                  >
                    <Armchair size={18} />
                    <span className="seat-label-inside">{seatId}</span>
                  </button>
                );
              })}
            </div>

            {/* Aisle */}
            <div className="aisle-space">GANG</div>

            {/* Right Column Group */}
            <div className="col-group">
              {cols.slice(cols.length / 2).map(col => {
                const seatId = `${row}${col}`;
                const occupied = isSeatOccupied(row, col);
                
                let selectedByPassengerIndex = -1;
                Object.entries(selectedSeats).forEach(([idx, id]) => {
                  if (id === seatId) selectedByPassengerIndex = Number(idx);
                });
                
                const isSelectedByCurrent = selectedByPassengerIndex === currentPassengerIndex;
                const isSelectedByOther = selectedByPassengerIndex !== -1 && !isSelectedByCurrent;

                const seatType = getSeatType(col);
                const priceAdd = getSeatPriceAddition(row, col);

                return (
                  <button
                    key={seatId}
                    type="button"
                    disabled={occupied || isSelectedByOther}
                    className={`seat-btn 
                      ${occupied ? 'occupied' : ''} 
                      ${isSelectedByCurrent ? 'selected' : ''} 
                      ${isSelectedByOther ? 'selected-other' : ''}
                      ${seatType}
                    `}
                    onClick={() => onSeatSelect(currentPassengerIndex, seatId)}
                    title={`Kursi ${seatId} (${seatType}) ${priceAdd > 0 ? `+Rp ${priceAdd.toLocaleString()}` : ''}`}
                  >
                    <Armchair size={18} />
                    <span className="seat-label-inside">{seatId}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="cabin-footer">
          <div className="cockpit-divider"></div>
          <span>BELAKANG</span>
        </div>
      </div>
    );
  };

  return (
    <div className="seat-map-card glass-card">
      <h3 className="seat-map-title">Pilih Kursi Penerbangan</h3>
      
      {/* Passenger Selection tabs */}
      <div className="passenger-selection-tabs">
        {passengerNames.map((name, idx) => (
          <button
            key={`tab-${idx}`}
            type="button"
            className={`passenger-tab-btn ${currentPassengerIndex === idx ? 'active' : ''}`}
            onClick={() => setCurrentPassengerIndex(idx)}
          >
            <div className="tab-passenger-info">
              <span className="tab-label">Penumpang {idx + 1}</span>
              <span className="tab-name">{name || `Penumpang ${idx + 1}`}</span>
            </div>
            {selectedSeats[idx] && (
              <span className="assigned-seat-badge">{selectedSeats[idx]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Seat Info Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box available"><Armchair size={14} /></div>
          <span>Tersedia</span>
        </div>
        <div className="legend-item">
          <div className="legend-box occupied"><Armchair size={14} /></div>
          <span>Terisi</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected"><Armchair size={14} /></div>
          <span>Pilihan Anda</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected-other"><Armchair size={14} /></div>
          <span>Penumpang Lain</span>
        </div>
      </div>

      {/* Seat Grid Map */}
      <div className="cabin-scroll-area">
        {renderCabin()}
      </div>

      {/* Additions details info */}
      <div className="seat-notes">
        <p className="seat-note-text">* Baris depan (Baris 1 & 4) dikenakan biaya Legroom Ekstra (+Rp 150.000)</p>
        <p className="seat-note-text">* Kursi Jendela (A & F) dikenakan biaya (+Rp 50.000)</p>
      </div>
    </div>
  );
};
export default SeatMap;
