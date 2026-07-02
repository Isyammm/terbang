import React, { useState } from 'react';
import { CreditCard, QrCode, Building, Percent, ShieldCheck, Ticket, Plane, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Flight, Passenger, SearchParams } from '../types';
import './Checkout.css';

interface CheckoutProps {
  searchParams: SearchParams;
  outboundFlight: Flight;
  inboundFlight?: Flight;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  onPaymentSuccess: (paymentMethod: string, finalPrice: number) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({
  searchParams: _searchParams,
  outboundFlight,
  inboundFlight,
  passengers,
  contactEmail: _contactEmail,
  contactPhone: _contactPhone,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'qris' | 'va'>('credit_card');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Calculate Seat pricing additions
  const getSeatPriceAddition = (seatId?: string): number => {
    if (!seatId) return 0;
    const row = parseInt(seatId);
    const col = seatId.replace(/[0-9]/g, '');
    let addition = 0;
    if (row === 1 || row === 4) addition += 150000; // Extra Legroom
    if (col === 'A' || col === 'F') addition += 50000; // Window Seat
    return addition;
  };

  const passengerSeatFees = passengers.reduce((sum, p) => sum + getSeatPriceAddition(p.seatId), 0);

  // Calculate Pricing breakdown
  const outboundTicketPrice = outboundFlight.price * passengers.length;
  const inboundTicketPrice = inboundFlight ? inboundFlight.price * passengers.length : 0;
  const subtotal = outboundTicketPrice + inboundTicketPrice + passengerSeatFees;
  const taxFee = Math.round(subtotal * 0.11); // 11% PPN
  const serviceFee = 15000; // Rp 15.000 flat booking fee

  const discountAmount = promoApplied ? Math.round(subtotal * (discountPercent / 100)) : 0;
  const finalTotalPrice = subtotal + taxFee + serviceFee - discountAmount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'FLYEASE10') {
      setDiscountPercent(10);
      setPromoApplied(true);
      alert('Kode promo FLYEASE10 berhasil digunakan! Diskon 10% diterapkan.');
    } else if (promoCode.toUpperCase() === 'LIBURANYUK') {
      setDiscountPercent(15);
      setPromoApplied(true);
      alert('Kode promo LIBURANYUK berhasil digunakan! Diskon 15% diterapkan.');
    } else {
      alert('Kode promo tidak valid!');
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Payment Processor Delay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Allow another short delay for successful payment checkmark animation
      setTimeout(() => {
        onPaymentSuccess(
          paymentMethod === 'credit_card' ? 'Kartu Kredit' : paymentMethod === 'qris' ? 'QRIS' : 'Virtual Account',
          finalTotalPrice
        );
      }, 2000);
    }, 3000);
  };

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (paymentSuccess) {
    return (
      <div className="payment-animation-card glass-card animated-fade-in text-center">
        <div className="success-checkmark">
          <CheckCircle2 size={72} className="checkmark-icon" />
        </div>
        <h2 className="success-title">Pembayaran Berhasil!</h2>
        <p className="success-subtitle">Terima kasih. Kami sedang menerbitkan e-ticket Anda...</p>
        <div className="loader-bar-container">
          <div className="loader-bar-fill"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container animated-fade-in">
      <div className="checkout-grid-layout">
        
        {/* Left Side: Summary & Payment */}
        <div className="checkout-left-column">
          
          {/* Flight Summary Cards */}
          <div className="checkout-card glass-card">
            <div className="card-heading">
              <Plane size={18} className="heading-icon" />
              <h3>Ringkasan Penerbangan</h3>
            </div>

            {/* Outbound */}
            <div className="flight-summary-block">
              <span className="summary-badge">Pergi</span>
              <div className="summary-route-times">
                <div className="summary-airline">
                  <span className="airline-name-bold">{outboundFlight.airlineName}</span>
                  <span className="flight-num">{outboundFlight.flightNumber}</span>
                </div>
                <div className="summary-cities">
                  <span>{outboundFlight.from} ({outboundFlight.fromCode})</span>
                  <ArrowRight size={14} className="arrow-sep" />
                  <span>{outboundFlight.to} ({outboundFlight.toCode})</span>
                </div>
                <div className="summary-schedule-info">
                  <span>{outboundFlight.date} • {outboundFlight.departureTime} - {outboundFlight.arrivalTime}</span>
                </div>
              </div>
            </div>

            {/* Inbound if Round Trip */}
            {inboundFlight && (
              <div className="flight-summary-block border-top">
                <span className="summary-badge return">Pulang</span>
                <div className="summary-route-times">
                  <div className="summary-airline">
                    <span className="airline-name-bold">{inboundFlight.airlineName}</span>
                    <span className="flight-num">{inboundFlight.flightNumber}</span>
                  </div>
                  <div className="summary-cities">
                    <span>{inboundFlight.from} ({inboundFlight.fromCode})</span>
                    <ArrowRight size={14} className="arrow-sep" />
                    <span>{inboundFlight.to} ({inboundFlight.toCode})</span>
                  </div>
                  <div className="summary-schedule-info">
                    <span>{inboundFlight.date} • {inboundFlight.departureTime} - {inboundFlight.arrivalTime}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Passenger List Summary */}
          <div className="checkout-card glass-card">
            <div className="card-heading">
              <Ticket size={18} className="heading-icon" />
              <h3>Detail Penumpang & Kursi</h3>
            </div>
            <div className="passengers-summary-list">
              {passengers.map((p, idx) => (
                <div key={p.id} className="p-summary-item">
                  <span className="p-number">P{idx + 1}</span>
                  <div className="p-details">
                    <span className="p-name">{p.title}. {p.fullName}</span>
                    <span className="p-nationality">{p.nationality} {p.passportNumber ? `• Passport: ${p.passportNumber}` : ''}</span>
                  </div>
                  <div className="p-seat">
                    <span className="seat-summary-label">Kursi</span>
                    <span className="seat-summary-val">{p.seatNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="checkout-card glass-card">
            <div className="card-heading">
              <CreditCard size={18} className="heading-icon" />
              <h3>Metode Pembayaran</h3>
            </div>

            <div className="payment-tabs">
              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('credit_card')}
              >
                <CreditCard size={16} />
                <span>Kartu Kredit</span>
              </button>
              
              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'qris' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qris')}
              >
                <QrCode size={16} />
                <span>QRIS</span>
              </button>

              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'va' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('va')}
              >
                <Building size={16} />
                <span>Virtual Account</span>
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="payment-form-area">
              {paymentMethod === 'credit_card' && (
                <div className="cc-form animated-fade-in">
                  <div className="form-group">
                    <label className="form-label">Nomor Kartu</label>
                    <input
                      type="text"
                      className="form-input"
                      maxLength={19}
                      placeholder="1234 5678 9101 1121"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label">Masa Berlaku (MM/YY)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="***"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'qris' && (
                <div className="qris-area animated-fade-in text-center">
                  <p className="qris-desc">Pindai kode QRIS berikut menggunakan aplikasi e-wallet atau mobile banking Anda.</p>
                  <div className="qris-qr-mock">
                    <svg viewBox="0 0 100 100" className="mock-qr-svg">
                      <path d="M10 10h30v30h-30zm0 50h30v30h-30zm50-50h30v30h-30zm10 40h10v10h-10zm10 10h10v10h-10zm-20 10h10v10h-10zm20 10h10v10h-10zm-10 10h10v10h-10zm-10-20h10v10h-10z" fill="white" />
                      <path d="M18 18h14v14h-14zm0 50h14v14h-14zm50-50h14v14h-14z" fill="#06B6D4" />
                    </svg>
                  </div>
                  <span className="qris-expire">Berlaku selama 15:00 menit</span>
                </div>
              )}

              {paymentMethod === 'va' && (
                <div className="va-area animated-fade-in">
                  <p className="va-desc">Pilih bank dan transfer tepat sesuai dengan nilai total pembayaran.</p>
                  <div className="va-bank-select">
                    <div className="bank-option selected">
                      <span className="bank-name-tag">MANDIRI</span>
                      <span className="bank-full">Mandiri Virtual Account</span>
                    </div>
                    <div className="bank-option">
                      <span className="bank-name-tag">BCA</span>
                      <span className="bank-full">BCA Virtual Account</span>
                    </div>
                    <div className="bank-option">
                      <span className="bank-name-tag">BRI</span>
                      <span className="bank-full">BRI Virtual Account</span>
                    </div>
                  </div>
                  <div className="va-details-box">
                    <span className="va-num-label">Nomor Virtual Account</span>
                    <span className="va-number-code">88001 98321 00482</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary pay-now-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="processing-indicator">
                    <span className="spinner"></span>
                    Memproses Pembayaran...
                  </span>
                ) : (
                  `Bayar Sekarang - ${formatCurrency(finalTotalPrice)}`
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Price Summary & Promo */}
        <div className="checkout-right-column">
          
          {/* Promo Code Input */}
          <div className="checkout-card glass-card">
            <div className="card-heading">
              <Percent size={18} className="heading-icon" />
              <h3>Kode Promo / Kupon</h3>
            </div>
            <div className="promo-input-row">
              <input
                type="text"
                className="form-input promo-field"
                placeholder="Masukkan kode promo (FLYEASE10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoApplied}
              />
              <button
                type="button"
                className="btn btn-outline apply-promo-btn"
                onClick={handleApplyPromo}
                disabled={promoApplied}
              >
                Gunakan
              </button>
            </div>
            {promoApplied && (
              <span className="promo-applied-badge">
                Promo Berhasil Digunakan ({discountPercent}% Diskon)
              </span>
            )}
            <p className="promo-tip">Gunakan kode <strong>FLYEASE10</strong> untuk diskon 10% atau <strong>LIBURANYUK</strong> untuk diskon 15% subtotal.</p>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="checkout-card glass-card pricing-breakdown-card">
            <div className="card-heading">
              <ShieldCheck size={18} className="heading-icon" />
              <h3>Rincian Harga</h3>
            </div>

            <div className="price-breakdown-rows">
              <div className="price-row">
                <span>Penerbangan Pergi (x{passengers.length})</span>
                <span>{formatCurrency(outboundTicketPrice)}</span>
              </div>
              
              {inboundFlight && (
                <div className="price-row">
                  <span>Penerbangan Pulang (x{passengers.length})</span>
                  <span>{formatCurrency(inboundTicketPrice)}</span>
                </div>
              )}

              <div className="price-row">
                <span>Biaya Pemilihan Kursi ({passengers.filter(p => p.seatId).length} Kursi)</span>
                <span>{formatCurrency(passengerSeatFees)}</span>
              </div>

              <div className="price-row">
                <span>Pajak (PPN 11%)</span>
                <span>{formatCurrency(taxFee)}</span>
              </div>

              <div className="price-row">
                <span>Biaya Layanan</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>

              {promoApplied && (
                <div className="price-row discount-row">
                  <span>Diskon Promo ({discountPercent}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="price-row total-row border-top">
                <span>Total Pembayaran</span>
                <span className="final-total">{formatCurrency(finalTotalPrice)}</span>
              </div>
            </div>

            <div className="secure-badge-box">
              <ShieldCheck size={16} className="secure-icon" />
              <span>Pembayaran Terenkripsi & Aman</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
