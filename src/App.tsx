import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FlightSearch } from './components/FlightSearch';
import { FlightResults } from './components/FlightResults';
import { PassengerDetails } from './components/PassengerDetails';
import { Checkout } from './components/Checkout';
import { ETicket } from './components/ETicket';
import { BookingHistory } from './components/BookingHistory';
import { LoginModal, UserAccount } from './components/LoginModal';
import { User, Flight, Passenger, SearchParams, Booking } from './types';

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
  };

  // Step 1: Form search submitted
  const handleSearchSubmit = async (params: SearchParams) => {
    setSearchParams(params);
    setStep('outbound');
    
    // Fetch outbound flights
    try {
      const outRes = await fetch(`http://localhost:3000/api/flights?from=${params.fromCode}&to=${params.toCode}&date=${params.departureDate}&class=${params.classType}`);
      const outData = await outRes.json();
      setOutboundFlights(outData);
    } catch (e) {
      console.error(e);
      setOutboundFlights([]);
    }

    // Fetch inbound flights
    if (params.isRoundTrip && params.returnDate) {
      try {
        const inRes = await fetch(`http://localhost:3000/api/flights?from=${params.toCode}&to=${params.fromCode}&date=${params.returnDate}&class=${params.classType}`);
        const inData = await inRes.json();
        setInboundFlights(inData);
      } catch (e) {
        console.error(e);
        setInboundFlights([]);
      }
    } else {
      setInboundFlights([]);
    }
  };

  // Step 2: Flight selected (requires login)
  const handleSelectFlight = (flight: Flight) => {
    if (!currentUser) {
      // Store pending selection and prompt login
      setPendingFlight(flight);
      setShowLoginModal(true);
      return;
    }
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
  const handlePaymentSuccess = (paymentMethod: string, finalPrice: number) => {
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

    const updatedBookings = [newBooking, ...bookings];
    saveBookings(updatedBookings);
    setCurrentBooking(newBooking);
    setStep('ticket_display');
  };

  // Cancel Booking action
  const handleCancelBooking = (bookingId: string) => {
    const updated = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
    saveBookings(updated);
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
                <div className="hero-text-block text-center animated-fade-in" style={{ marginBottom: '60px' }}>
                  <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
                    Terbang Tanpa Batas Bersama <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FlyEase</span>
                  </h1>
                  <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
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
