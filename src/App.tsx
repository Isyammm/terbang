import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FlightSearch } from './components/FlightSearch';
import { FlightResults } from './components/FlightResults';
import { PassengerDetails } from './components/PassengerDetails';
import { Checkout } from './components/Checkout';
import { ETicket } from './components/ETicket';
import { BookingHistory } from './components/BookingHistory';
import { LoginModal, UserAccount } from './components/LoginModal';
import { Flight, Passenger, SearchParams, Booking } from './types';
import { generateFlights } from './data/mockData';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'bookings'>('home');
  const [step, setStep] = useState<'search' | 'outbound' | 'inbound' | 'passengers' | 'checkout' | 'ticket_display'>('search');

  // Auth states
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('flyease_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  // Pending flight to select after login
  const [pendingFlight, setPendingFlight] = useState<Flight | null>(null);

  // Booking states
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [inboundFlights, setInboundFlights] = useState<Flight[]>([]);
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null);
  const [inboundFlight, setInboundFlight] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Bookings list (persisted in localStorage)
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  // Load bookings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('flyease_bookings');
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved bookings', e);
      }
    } else {
      // Seed a default booking for the test account to ensure upcoming trips exist
      const seedBookings: Booking[] = [
        {
          id: 'FE99182',
          flightId: 'GA-200-Economy',
          passengers: [
            { id: 'p-seed-1', title: 'Mr', fullName: 'Hisyam Yassar', nationality: 'Indonesia', seatId: '4A', seatNumber: '4A' }
          ],
          contactEmail: 'hisyam.yassar@gmail.com',
          contactPhone: '+62 813-5536-4117',
          totalPrice: 1350000,
          paymentMethod: 'Kartu Kredit',
          paymentStatus: 'success',
          bookingDate: new Date().toISOString().split('T')[0],
          flightDetails: {
            id: 'GA-200-Economy',
            flightNumber: 'GA-200',
            airlineId: 'GA',
            airlineName: 'Garuda Indonesia',
            from: 'Jakarta',
            fromCode: 'CGK',
            to: 'Bali',
            toCode: 'DPS',
            departureTime: '08:45',
            arrivalTime: '11:35',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days in future
            price: 1100000,
            duration: '1j 50m',
            stops: 0,
            classType: 'Economy',
            availableSeats: 32
          },
          status: 'active'
        }
      ];
      setBookings(seedBookings);
      localStorage.setItem('flyease_bookings', JSON.stringify(seedBookings));
    }
  }, []);

  // Save bookings helper
  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('flyease_bookings', JSON.stringify(newBookings));
  };

  // Auth helpers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('flyease_user', JSON.stringify(user));
    setShowLoginModal(false);
    // If there was a pending flight selection, resume it after login
    if (pendingFlight) {
      const flight = pendingFlight;
      setPendingFlight(null);
      if (step === 'outbound') {
        setOutboundFlight(flight);
        if (searchParams?.isRoundTrip) setStep('inbound');
        else setStep('passengers');
      } else if (step === 'inbound') {
        setInboundFlight(flight);
        setStep('passengers');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('flyease_user');
    if (activeTab === 'bookings') setActiveTab('home');
  };

  // Reset booking wizard helper
  const handleReset = () => {
    setStep('search');
    setSearchParams(null);
    setOutboundFlight(null);
    setInboundFlight(null);
    setPassengers([]);
    setCurrentBooking(null);
    setActiveTab('home');
    setShowLoginModal(false);
    setPendingFlight(null);
  };

  // Step 1: Form search submitted
  const handleSearchSubmit = async (params: SearchParams) => {
    setShowLoginModal(false);
    setSearchParams(params);
    setStep('outbound');

    // Helper: fetch dari API, fallback ke generateFlights jika gagal
    const fetchFlights = async (from: string, to: string, date: string, cls: string) => {
      try {
        if (window.location.hostname !== 'localhost') {
          throw new Error('Not on localhost');
        }
        const res = await fetch(`http://localhost:3000/api/flights?from=${from}&to=${to}&date=${date}&class=${cls}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
        throw new Error('Empty data');
      } catch {
        // Backend tidak tersedia → gunakan data mock lokal
        return generateFlights(from, to, date, cls as any);
      }
    };

    // Fetch penerbangan pergi
    const outData = await fetchFlights(params.fromCode, params.toCode, params.departureDate, params.classType);
    setOutboundFlights(outData);

    // Fetch penerbangan pulang (jika pulang pergi atau ada tanggal kepulangan)
    if ((params.isRoundTrip || params.returnDate) && params.returnDate) {
      const inData = await fetchFlights(params.toCode, params.fromCode, params.returnDate, params.classType);
      setInboundFlights(inData);
    } else {
      setInboundFlights([]);
    }
  };

  // Step 2: Flight selected
  const handleSelectFlight = (flight: Flight) => {
    if (step === 'outbound') {
      setOutboundFlight(flight);
      if (searchParams?.isRoundTrip) {
        setStep('inbound');
      } else {
        setStep('passengers');
      }
    } else if (step === 'inbound') {
      setInboundFlight(flight);
      setStep('passengers');
    }
  };

  // Step 3: Passenger details filled
  const handlePassengerSubmit = (
    filledPassengers: Passenger[],
    email: string,
    phone: string
  ) => {
    setPassengers(filledPassengers);
    setContactEmail(email);
    setContactPhone(phone);
    setStep('checkout');
  };

  // Step 4: Checkout successful
  const handlePaymentSuccess = async (paymentMethod: string, finalPrice: number) => {
    if (!outboundFlight || !searchParams) return;

    // Generate unique booking code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let bookingId = '';
    for (let i = 0; i < 6; i++) {
      bookingId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newBooking: Booking = {
      id: bookingId,
      flightId: outboundFlight.id,
      returnFlightId: inboundFlight?.id,
      passengers,
      contactEmail,
      contactPhone,
      totalPrice: finalPrice,
      paymentMethod,
      paymentStatus: 'success',
      bookingDate: new Date().toISOString().split('T')[0],
      flightDetails: outboundFlight,
      returnFlightDetails: inboundFlight || undefined,
      status: 'active'
    };

    // Simpan ke DB jika backend aktif
    try {
      if (window.location.hostname !== 'localhost') {
        throw new Error('Not on localhost');
      }
      await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:                  newBooking.id,
          userId:              currentUser?.id || null,
          flightId:            newBooking.flightId,
          returnFlightId:      newBooking.returnFlightId || null,
          passengers:          newBooking.passengers,
          contactEmail:        newBooking.contactEmail,
          contactPhone:        newBooking.contactPhone,
          totalPrice:          newBooking.totalPrice,
          paymentMethod:       newBooking.paymentMethod,
          paymentStatus:       newBooking.paymentStatus,
          bookingDate:         newBooking.bookingDate,
          flightDetails:       newBooking.flightDetails,
          returnFlightDetails: newBooking.returnFlightDetails || null,
        }),
      });
    } catch {
      // Backend tidak aktif — booking tetap disimpan di localStorage
      console.warn('Backend tidak tersedia, booking hanya disimpan lokal');
    }

    const updatedBookings = [newBooking, ...bookings];
    saveBookings(updatedBookings);
    setCurrentBooking(newBooking);
    setStep('ticket_display');
  };

  // Cancel Booking action
  const handleCancelBooking = async (bookingId: string) => {
    // Update UI & localStorage
    const updated = bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
    saveBookings(updated);
    // Sync ke DB jika backend aktif
    try {
      if (window.location.hostname !== 'localhost') {
        throw new Error('Not on localhost');
      }
      await fetch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
      });
    } catch {
      console.warn('Backend tidak tersedia, pembatalan hanya disimpan lokal');
    }
  };

  // View Ticket from history
  const handleViewTicketFromHistory = (booking: Booking) => {
    setCurrentBooking(booking);
    setStep('ticket_display');
    setActiveTab('home');
  };

  // Render Stepper Node based on current wizard state
  const renderStepper = () => {
    if (step === 'search' || step === 'ticket_display') return null;

    const getStepClass = (nodeStep: number) => {
      const stepMapping: { [key: string]: number } = {
        outbound: 2,
        inbound: 2,
        passengers: 3,
        checkout: 4
      };
      
      const currentVal = stepMapping[step] || 1;
      
      if (currentVal > nodeStep) return 'step completed';
      if (currentVal === nodeStep) return 'step active';
      return 'step';
    };

    return (
      <div className="stepper container">
        <div className={getStepClass(1)}>
          <div className="step-node">1</div>
          <span className="step-label">Cari</span>
        </div>
        <div className={getStepClass(2)}>
          <div className="step-node">2</div>
          <span className="step-label">Penerbangan</span>
        </div>
        <div className={getStepClass(3)}>
          <div className="step-node">3</div>
          <span className="step-label">Kursi & Penumpang</span>
        </div>
        <div className={getStepClass(4)}>
          <div className="step-node">4</div>
          <span className="step-label">Bayar</span>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        resetApp={handleReset}
        currentUser={currentUser}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => { setShowLoginModal(false); setPendingFlight(null); }}
        onLoginSuccess={handleLoginSuccess}
      />

      <main className="container" style={{ padding: '40px 24px 80px 24px' }}>
        
        {/* Navigation tabs switching */}
        {activeTab === 'bookings' ? (
          <BookingHistory
            bookings={bookings}
            onViewTicket={handleViewTicketFromHistory}
            onCancelBooking={handleCancelBooking}
            onNavigateHome={handleReset}
            currentUser={currentUser}
            onLoginClick={() => setShowLoginModal(true)}
          />
        ) : (
          <>
            {renderStepper()}

            {/* Stepper routing views */}
            {step === 'search' && (
              <div className="home-hero-container">
                <div className="hero-text-block animated-fade-in" style={{ marginBottom: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px', textAlign: 'center' }}>
                    Terbang Tanpa Batas Bersama <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FlyEase</span>
                  </h1>
                  <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    Platform pemesanan tiket penerbangan berkelas dunia dengan visual premium dan proses check-out instan.
                  </p>
                </div>
                <FlightSearch onSearch={handleSearchSubmit} />
              </div>
            )}

            {step === 'outbound' && searchParams && (
              <FlightResults
                flights={outboundFlights}
                searchParams={searchParams}
                onSelectFlight={handleSelectFlight}
                selectionType="outbound"
              />
            )}

            {step === 'inbound' && searchParams && (
              <FlightResults
                flights={inboundFlights}
                searchParams={searchParams}
                onSelectFlight={handleSelectFlight}
                selectionType="inbound"
              />
            )}

            {step === 'passengers' && searchParams && outboundFlight && (
              <PassengerDetails
                searchParams={searchParams}
                flight={outboundFlight}
                onProceed={handlePassengerSubmit}
              />
            )}

            {step === 'checkout' && searchParams && outboundFlight && (
              <Checkout
                searchParams={searchParams}
                outboundFlight={outboundFlight}
                inboundFlight={inboundFlight || undefined}
                passengers={passengers}
                contactEmail={contactEmail}
                contactPhone={contactPhone}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}

            {step === 'ticket_display' && currentBooking && (
              <ETicket 
                booking={currentBooking} 
                onClose={handleReset} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
