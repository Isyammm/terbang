// FlyEase Flight Booking App - Core Logic (Vanilla JS)

// Mock Databases
const airports = [
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International Airport', country: 'Indonesia' },
  { code: 'DPS', city: 'Bali', name: 'I Gusti Ngurah Rai International Airport', country: 'Indonesia' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia' },
  { code: 'SUB', city: 'Surabaya', name: 'Juanda International Airport', country: 'Indonesia' },
  { code: 'KNO', city: 'Medan', name: 'Kualanamu International Airport', country: 'Indonesia' }
];

const airlines = [
  { id: 'GA', name: 'Garuda Indonesia', code: 'GA', logoColor: '#005C8A' },
  { id: 'SQ', name: 'Singapore Airlines', code: 'SQ', logoColor: '#F5A623' },
  { id: 'ID', name: 'Batik Air', code: 'ID', logoColor: '#A81C25' },
  { id: 'QG', name: 'Citilink', code: 'QG', logoColor: '#4A90E2' },
  { id: 'JL', name: 'Japan Airlines', code: 'JL', logoColor: '#E60012' },
  { id: 'QF', name: 'Qantas', code: 'QF', logoColor: '#E01933' }
];

// Global State
let activeTab = 'home'; // home | bookings
let step = 'search';    // search | outbound | inbound | passengers | checkout | ticket_display

// Auth & Custom State
let currentUser = null; // Will store logged-in user object { name, email }
let loginModalMode = 'login'; // login | register
let searchQuery = '';
let bookingToEdit = null;

let searchParams = null;
let outboundFlight = null;
let inboundFlight = null;
let passengers = [];
let contactEmail = '';
let contactPhone = '';
let selectedSeats = {}; // passengerIndex -> seatId
let currentPassengerIndex = 0;

let bookings = [];
let currentBooking = null;

// Search Dropdown State
let fromCode = 'CGK';
let toCode = 'DPS';

// Results Filtering & Sorting State
let flightsPool = []; // current selection pool (outbound or inbound)
let activeSort = 'cheapest';
let activeTransit = 'all';
let maxPriceFilter = 15000000;
let checkedAirlines = [];

// Checkout Promo State
let promoApplied = false;
let discountPercent = 0;
let checkoutPaymentMethod = 'credit_card';

// Lifecycle: DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Load Bookings from localStorage
  const savedBookings = localStorage.getItem('flyease_bookings');
  if (savedBookings) {
    try {
      bookings = JSON.parse(savedBookings);
    } catch (e) {
      console.error(e);
    }
  }

  // Set up mock registered accounts if empty
  const savedAccounts = localStorage.getItem('flyease_accounts');
  if (!savedAccounts) {
    const defaultAccounts = [
      { name: 'Hisyam Yassar', email: 'hisyam.yassar@gmail.com', password: 'password123' },
      { name: 'Budi Santoso', email: 'budi@gmail.com', password: 'password123' }
    ];
    localStorage.setItem('flyease_accounts', JSON.stringify(defaultAccounts));
  } else {
    // Migrasi: ganti akun lama adrian.wijaya jika masih ada di localStorage
    try {
      let accounts = JSON.parse(savedAccounts);
      const hasOld = accounts.some(a => a.email === 'adrian.wijaya@gmail.com');
      if (hasOld) {
        accounts = accounts.filter(a => a.email !== 'adrian.wijaya@gmail.com');
        if (!accounts.find(a => a.email === 'hisyam.yassar@gmail.com')) {
          accounts.unshift({ name: 'Hisyam Yassar', email: 'hisyam.yassar@gmail.com', password: 'password123' });
        }
        localStorage.setItem('flyease_accounts', JSON.stringify(accounts));
      }
    } catch (e) { console.error(e); }
  }

  // Load Auth from localStorage
  const savedUser = localStorage.getItem('flyease_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (e) {
      console.error(e);
    }
  }

  // Render navbar profile initial state
  renderNavbarProfile();

  // Set default search dates (tomorrow & 3 days from now)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);

  document.getElementById('input-dep-date').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('input-dep-date').min = today.toISOString().split('T')[0];
  document.getElementById('input-ret-date').value = threeDays.toISOString().split('T')[0];
  document.getElementById('input-ret-date').min = tomorrow.toISOString().split('T')[0];

  // Setup Event Listeners
  setupEventListeners();

  // Draw airport selectors dropdown contents
  drawAirportSelectors();

  // Initial View
  renderView();
});

// View Router
function renderView() {
  // Hide all sections
  document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
  document.getElementById('app-stepper').classList.add('hidden');

  if (activeTab === 'bookings') {
    document.getElementById('view-bookings').classList.remove('hidden');
    renderBookingsHistory();
  } else {
    // Render stepper indicator
    renderStepperIndicator();

    if (step === 'search') {
      document.getElementById('view-search').classList.remove('hidden');
    } else if (step === 'outbound' || step === 'inbound') {
      document.getElementById('view-results').classList.remove('hidden');
      renderResultsPage();
    } else if (step === 'passengers') {
      document.getElementById('view-passengers').classList.remove('hidden');
      renderPassengerPage();
    } else if (step === 'checkout') {
      document.getElementById('view-checkout').classList.remove('hidden');
      renderCheckoutPage();
    } else if (step === 'ticket_display') {
      document.getElementById('view-ticket').classList.remove('hidden');
      renderTicketPage();
    }
  }

  // Refresh icons
  lucide.createIcons();
}

function renderStepperIndicator() {
  const stepper = document.getElementById('app-stepper');
  if (step === 'search' || step === 'ticket_display') {
    stepper.classList.add('hidden');
    return;
  }
  stepper.classList.remove('hidden');

  const stepMapping = {
    outbound: 2,
    inbound: 2,
    passengers: 3,
    checkout: 4
  };
  const currentVal = stepMapping[step] || 1;

  for (let s = 1; s <= 4; s++) {
    const node = document.getElementById(`step-node-${s}`);
    node.className = 'step';
    if (currentVal > s) {
      node.className = 'step completed';
    } else if (currentVal === s) {
      node.className = 'step active';
    }
  }
}

// Draw custom airport option contents
function drawAirportSelectors() {
  const originTrigger = document.getElementById('origin-trigger');
  const destTrigger = document.getElementById('dest-trigger');
  const originOpts = document.getElementById('origin-options');
  const destOpts = document.getElementById('dest-options');

  const updateTriggerLabels = () => {
    const fromAir = airports.find(a => a.code === fromCode);
    const toAir = airports.find(a => a.code === toCode);
    
    document.getElementById('origin-code-display').textContent = fromCode;
    document.getElementById('origin-detail-display').textContent = `${fromAir.city} (${fromAir.name})`;
    document.getElementById('dest-code-display').textContent = toCode;
    document.getElementById('dest-detail-display').textContent = `${toAir.city} (${toAir.name})`;
  };

  const fillDropdown = (el, type) => {
    el.innerHTML = '';
    airports.forEach(airport => {
      const activeCode = type === 'origin' ? fromCode : toCode;
      const opt = document.createElement('div');
      opt.className = `custom-option ${airport.code === activeCode ? 'selected' : ''}`;
      opt.innerHTML = `
        <span class="option-code">${airport.code}</span>
        <div class="option-info">
          <span class="option-city">${airport.city}</span>
          <span class="option-name">${airport.name}</span>
        </div>
      `;
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        if (type === 'origin') {
          fromCode = airport.code;
          originOpts.classList.add('hidden');
        } else {
          toCode = airport.code;
          destOpts.classList.add('hidden');
        }
        updateTriggerLabels();
      });
      el.appendChild(opt);
    });
  };

  originTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    destOpts.classList.add('hidden');
    originOpts.classList.toggle('hidden');
    fillDropdown(originOpts, 'origin');
  });

  destTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    originOpts.classList.add('hidden');
    destOpts.classList.toggle('hidden');
    fillDropdown(destOpts, 'dest');
  });

  document.addEventListener('click', () => {
    originOpts.classList.add('hidden');
    destOpts.classList.add('hidden');
  });

  updateTriggerLabels();
}

// Event Listeners setup
function setupEventListeners() {
  // Tabs switching
  document.getElementById('btn-tab-home').addEventListener('click', () => {
    activeTab = 'home';
    step = 'search';
    document.getElementById('btn-tab-home').classList.add('active');
    document.getElementById('btn-tab-bookings').classList.remove('active');
    renderView();
  });

  document.getElementById('btn-tab-bookings').addEventListener('click', () => {
    activeTab = 'bookings';
    document.getElementById('btn-tab-home').classList.remove('active');
    document.getElementById('btn-tab-bookings').classList.add('active');
    renderView();
  });

  document.getElementById('nav-logo').addEventListener('click', () => {
    activeTab = 'home';
    step = 'search';
    document.getElementById('btn-tab-home').classList.add('active');
    document.getElementById('btn-tab-bookings').classList.remove('active');
    renderView();
  });

  // Trip Type toggles
  document.getElementById('btn-oneway').addEventListener('click', () => {
    document.getElementById('btn-oneway').classList.add('active');
    document.getElementById('btn-roundtrip').classList.remove('active');
    document.getElementById('group-return-date').classList.add('disabled');
    document.getElementById('input-ret-date').disabled = true;
  });

  document.getElementById('btn-roundtrip').addEventListener('click', () => {
    document.getElementById('btn-oneway').classList.remove('active');
    document.getElementById('btn-roundtrip').classList.add('active');
    document.getElementById('group-return-date').classList.remove('disabled');
    document.getElementById('input-ret-date').disabled = false;
  });

  // Swap Airports
  document.getElementById('btn-swap-airports').addEventListener('click', () => {
    const temp = fromCode;
    fromCode = toCode;
    toCode = temp;
    drawAirportSelectors();
  });

  // Date updates min dates
  document.getElementById('input-dep-date').addEventListener('change', (e) => {
    document.getElementById('input-ret-date').min = e.target.value;
  });

  // Search submission
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (fromCode === toCode) {
      alert('Kota asal dan kota tujuan tidak boleh sama!');
      return;
    }

    const depDate = document.getElementById('input-dep-date').value;
    const isRound = document.getElementById('btn-roundtrip').classList.contains('active');
    const retDate = isRound ? document.getElementById('input-ret-date').value : undefined;
    const numPass = parseInt(document.getElementById('input-passengers').value);
    const cabClass = document.getElementById('input-cabin-class').value;

    const fromAir = airports.find(a => a.code === fromCode);
    const toAir = airports.find(a => a.code === toCode);

    searchParams = {
      from: fromAir.city,
      fromCode,
      to: toAir.city,
      toCode,
      departureDate: depDate,
      returnDate: retDate,
      passengers: numPass,
      classType: cabClass,
      isRoundTrip: isRound
    };

    // Initialize passenger names pool
    passengers = Array.from({ length: numPass }).map((_, i) => ({
      id: `p-${i}`,
      title: 'Mr',
      fullName: '',
      nationality: 'Indonesia'
    }));

    selectedSeats = {};
    currentPassengerIndex = 0;
    promoApplied = false;
    discountPercent = 0;

    step = 'outbound';
    renderView();
  });

  // Result sorting tabs
  document.querySelectorAll('.sorting-tabs .sort-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.sorting-tabs .sort-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeSort = tab.dataset.sort;
      filterAndSortFlights();
    });
  });

  // Results transit filters
  document.querySelectorAll('input[name="filter-transit"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      activeTransit = e.target.value;
      filterAndSortFlights();
    });
  });

  // Results price filters slider
  document.getElementById('filter-price-slider').addEventListener('input', (e) => {
    maxPriceFilter = parseInt(e.target.value);
    document.getElementById('filter-price-max').textContent = formatCurrency(maxPriceFilter);
    filterAndSortFlights();
  });

  // Proceed passengers detail
  document.getElementById('btn-proceed-checkout').addEventListener('click', () => {
    // Validate names
    for (let i = 0; i < passengers.length; i++) {
      const nameVal = document.getElementById(`p-name-${i}`).value.trim();
      const nationalityVal = document.getElementById(`p-nat-${i}`).value.trim();
      
      if (!validateName(nameVal)) {
        alert(`Nama lengkap Penumpang ${i + 1} tidak valid! Harus terdiri dari huruf saja, minimal 3 karakter.`);
        return;
      }
      passengers[i].fullName = nameVal;
      passengers[i].nationality = nationalityVal;

      const isInternational = ['SIN', 'HND', 'SYD'].includes(outboundFlight.fromCode) || ['SIN', 'HND', 'SYD'].includes(outboundFlight.toCode);
      if (isInternational) {
        const passVal = document.getElementById(`p-pass-${i}`).value.trim();
        if (!passVal) {
          alert(`Nomor Passport Penumpang ${i + 1} wajib diisi untuk rute internasional!`);
          return;
        }
        passengers[i].passportNumber = passVal;
      }
    }

    // Validate seats selection
    for (let i = 0; i < passengers.length; i++) {
      if (!selectedSeats[i]) {
        alert(`Harap pilih kursi untuk Penumpang ${i + 1}!`);
        currentPassengerIndex = i;
        renderPassengerPage();
        return;
      }
      passengers[i].seatId = selectedSeats[i];
      passengers[i].seatNumber = selectedSeats[i];
    }

    // Get contact info and validate
    const emailVal = document.getElementById('input-contact-email').value.trim();
    const phoneVal = document.getElementById('input-contact-phone').value.trim();
    
    if (!validateEmail(emailVal)) {
      alert('Email kontak tidak valid! Harap gunakan format yang benar (contoh: nama@domain.com).');
      return;
    }
    
    if (!validatePhone(phoneVal)) {
      alert('Nomor telepon kontak tidak valid! Harus berupa angka (boleh menggunakan + atau -), antara 10 hingga 14 digit.');
      return;
    }

    contactEmail = emailVal;
    contactPhone = phoneVal;

    step = 'checkout';
    renderView();
  });

  // Checkout Payment tab buttons
  document.querySelectorAll('.payment-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      checkoutPaymentMethod = btn.dataset.payment;

      document.getElementById('form-cc-details').classList.add('hidden');
      document.getElementById('form-qris-details').classList.add('hidden');
      document.getElementById('form-va-details').classList.add('hidden');

      if (checkoutPaymentMethod === 'credit_card') {
        document.getElementById('form-cc-details').classList.remove('hidden');
      } else if (checkoutPaymentMethod === 'qris') {
        document.getElementById('form-qris-details').classList.remove('hidden');
      } else if (checkoutPaymentMethod === 'va') {
        document.getElementById('form-va-details').classList.remove('hidden');
      }
    });
  });

  // Apply Coupon promo code
  document.getElementById('btn-apply-promo').addEventListener('click', () => {
    const code = document.getElementById('input-promo-code').value.toUpperCase().trim();
    if (code === 'FLYEASE10') {
      discountPercent = 10;
      promoApplied = true;
      alert('Kupon FLYEASE10 berhasil digunakan! Diskon 10% diterapkan.');
      renderCheckoutPage();
    } else if (code === 'LIBURANYUK') {
      discountPercent = 15;
      promoApplied = true;
      alert('Kupon LIBURANYUK berhasil digunakan! Diskon 15% diterapkan.');
      renderCheckoutPage();
    } else {
      alert('Kode promo tidak valid!');
    }
  });

  // Checkout Payment execution
  document.getElementById('btn-pay-now').addEventListener('click', () => {
    // CC validation if active
    if (checkoutPaymentMethod === 'credit_card') {
      const num = document.getElementById('cc-number').value.trim();
      const exp = document.getElementById('cc-expiry').value.trim();
      const cvv = document.getElementById('cc-cvv').value.trim();
      if (!num || !exp || !cvv) {
        alert('Harap isi semua kolom detail Kartu Kredit Anda!');
        return;
      }
      
      const ccNumRegex = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/;
      const ccExpRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      const ccCvvRegex = /^[0-9]{3}$/;
      
      if (!ccNumRegex.test(num.replace(/\s/g, ''))) {
        alert('Nomor Kartu Kredit tidak valid! Harus terdiri dari 16 digit angka.');
        return;
      }
      if (!ccExpRegex.test(exp)) {
        alert('Masa Berlaku Kartu tidak valid! Gunakan format MM/YY (contoh: 12/28).');
        return;
      }
      if (!ccCvvRegex.test(cvv)) {
        alert('CVV tidak valid! Harus terdiri dari 3 digit angka.');
        return;
      }
    }

    // Go to processing loading screen
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById('view-processing').classList.remove('hidden');
    document.getElementById('processing-title').textContent = 'Memproses Pembayaran...';
    document.getElementById('processing-subtitle').textContent = 'Terima kasih. Harap tunggu sebentar selagi kami mengamankan transaksi Anda...';
    document.getElementById('processing-spinner-container').style.display = 'block';
    document.getElementById('processing-check-container').style.display = 'none';

    const bar = document.getElementById('processing-loader-bar');
    bar.style.width = '0%';
    
    // Animate fake progress bar
    let width = 0;
    const interval = setInterval(() => {
      width += 5;
      bar.style.width = `${width}%`;
      if (width >= 100) {
        clearInterval(interval);
        
        // Show success animation
        document.getElementById('processing-spinner-container').style.display = 'none';
        document.getElementById('processing-check-container').style.display = 'block';
        document.getElementById('processing-title').textContent = 'Pembayaran Berhasil!';
        document.getElementById('processing-subtitle').textContent = 'Pembayaran Anda telah dikonfirmasi. Kami sedang menerbitkan E-ticket...';
        
        // Short delay to transition into ticket display page
        setTimeout(() => {
          generateFinalBooking();
        }, 1500);
      }
    }, 100);
  });

  // Print PDF ticket
  document.getElementById('btn-print-pdf').addEventListener('click', () => {
    alert('Simulasi Cetak: E-Ticket Anda siap diunduh dalam format PDF!');
    window.print();
  });

  // Boarding card back home reset
  document.getElementById('btn-ticket-back-home').addEventListener('click', () => {
    activeTab = 'home';
    step = 'search';
    renderView();
  });

  // Empty Booking CTA
  document.getElementById('btn-bookings-empty-cta').addEventListener('click', () => {
    activeTab = 'home';
    step = 'search';
    document.getElementById('btn-tab-home').classList.add('active');
    document.getElementById('btn-tab-bookings').classList.remove('active');
    renderView();
  });

  // Close Login Modal
  document.getElementById('btn-close-login-modal').addEventListener('click', () => {
    closeLoginModal();
  });

  // Toggle Login/Register Mode
  document.getElementById('login-toggle-link').addEventListener('click', () => {
    loginModalMode = loginModalMode === 'login' ? 'register' : 'login';
    resetLoginForm();
  });

  // Submit Login/Register Form
  document.getElementById('login-form').addEventListener('submit', (e) => {
    handleLoginSubmit(e);
  });

  // Close Edit Booking Modal
  document.getElementById('btn-close-edit-modal').addEventListener('click', () => {
    closeEditBookingModal();
  });
  document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    closeEditBookingModal();
  });

  // Submit Edit Booking Form
  document.getElementById('edit-booking-form').addEventListener('submit', (e) => {
    handleEditBookingSubmit(e);
  });

  // Search Bookings input typing
  document.getElementById('input-search-bookings').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderBookingsHistory();
  });
}

// Generate stable random flight database
function generateFlightsPool() {
  const isOutbound = step === 'outbound';
  const depCode = isOutbound ? searchParams.fromCode : searchParams.toCode;
  const arrCode = isOutbound ? searchParams.toCode : searchParams.fromCode;
  const dateStr = isOutbound ? searchParams.departureDate : searchParams.returnDate;

  // Static route characteristics
  let baseDuration = 90;
  let basePrice = 850000;

  const routeKey = [depCode, arrCode].sort().join('-');
  switch (routeKey) {
    case 'CGK-DPS':
      baseDuration = 110; basePrice = 1100000; break;
    case 'CGK-SIN':
      baseDuration = 105; basePrice = 1600000; break;
    case 'CGK-HND':
      baseDuration = 430; basePrice = 7500000; break;
    case 'CGK-SYD':
      baseDuration = 480; basePrice = 8200000; break;
    case 'DPS-SIN':
      baseDuration = 150; basePrice = 2200000; break;
    case 'DPS-HND':
      baseDuration = 450; basePrice = 8500000; break;
    case 'DPS-SYD':
      baseDuration = 360; basePrice = 5800000; break;
    case 'HND-SIN':
      baseDuration = 410; basePrice = 7200000; break;
    case 'SIN-SYD':
      baseDuration = 490; basePrice = 8900000; break;
    case 'CGK-SUB':
      baseDuration = 90; basePrice = 850000; break;
    case 'CGK-KNO':
      baseDuration = 140; basePrice = 1450000; break;
  }

  // Adjust class type price
  if (searchParams.classType === 'Business') basePrice *= 2.5;
  if (searchParams.classType === 'First') basePrice *= 5.0;

  flightsPool = [];
  const scheduleTimes = [
    { dep: '05:30' },
    { dep: '08:45' },
    { dep: '13:15' },
    { dep: '17:30' },
    { dep: '21:00' }
  ];

  scheduleTimes.forEach((time, index) => {
    const isInternational = ['SIN', 'HND', 'SYD'].includes(depCode) || ['SIN', 'HND', 'SYD'].includes(arrCode);
    let avAirlines = airlines;
    if (isInternational) {
      avAirlines = airlines.filter(a => ['GA', 'SQ', 'JL', 'QF'].includes(a.id));
    } else {
      avAirlines = airlines.filter(a => ['GA', 'ID', 'QG', 'SQ'].includes(a.id));
    }

    // Stable random seed based on date/flight index
    const seed = (dateStr.charCodeAt(5) + dateStr.charCodeAt(9) + index) % avAirlines.length;
    const airline = avAirlines[seed] || airlines[0];

    const durVar = (index * 7) % 30 - 15;
    const finalDurationVal = baseDuration + durVar;
    const hours = Math.floor(finalDurationVal / 60);
    const minutes = finalDurationVal % 60;
    const durationStr = `${hours}j ${minutes}m`;

    const [depH, depM] = time.dep.split(':').map(Number);
    let arrH = (depH + hours) % 24;
    let arrM = (depM + minutes);
    if (arrM >= 60) {
      arrH = (arrH + Math.floor(arrM / 60)) % 24;
      arrM = arrM % 60;
    }
    const arrivalTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

    const priceVar = 1.0 + ((index * 13) % 30 - 15) / 100.0;
    const finalPrice = Math.round((basePrice * priceVar) / 1000) * 1000;

    const flightNumber = `${airline.code}-${100 + (index * 157) % 899}`;
    const stops = isInternational && finalDurationVal > 300 && index % 2 === 0 ? 1 : 0;

    flightsPool.push({
      id: `${flightNumber}-${dateStr}-${index}`,
      flightNumber,
      airlineId: airline.id,
      airlineName: airline.name,
      from: isOutbound ? searchParams.from : searchParams.to,
      fromCode: depCode,
      to: isOutbound ? searchParams.to : searchParams.from,
      toCode: arrCode,
      departureTime: time.dep,
      arrivalTime,
      date: dateStr,
      price: finalPrice,
      duration: durationStr,
      stops,
      classType: searchParams.classType,
      availableSeats: 15 + (index * 12) % 30
    });
  });
}

// Render Results selector
function renderResultsPage() {
  generateFlightsPool();

  // Reset defaults for filters
  const prices = flightsPool.map(f => f.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const priceSlider = document.getElementById('filter-price-slider');
  priceSlider.min = minPrice;
  priceSlider.max = maxPrice;
  priceSlider.value = maxPrice;
  maxPriceFilter = maxPrice;

  document.getElementById('filter-price-min').textContent = formatCurrency(minPrice);
  document.getElementById('filter-price-max').textContent = formatCurrency(maxPrice);

  // Draw Unique Airlines check options
  const uniqueNames = Array.from(new Set(flightsPool.map(f => f.airlineName)));
  const container = document.getElementById('filter-airlines-list');
  container.innerHTML = '';
  checkedAirlines = [];

  uniqueNames.forEach(airlineName => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.innerHTML = `
      <input type="checkbox" value="${airlineName}" class="airline-check-filter">
      <span>${airlineName}</span>
    `;
    label.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) {
        checkedAirlines.push(airlineName);
      } else {
        checkedAirlines = checkedAirlines.filter(n => n !== airlineName);
      }
      filterAndSortFlights();
    });
    container.appendChild(label);
  });

  // Render text descriptions
  const isOut = step === 'outbound';
  document.getElementById('results-badge-type').textContent = isOut ? 'Penerbangan Pergi' : 'Penerbangan Pulang';
  document.getElementById('results-badge-type').className = `route-badge ${isOut ? '' : 'return'}`;
  
  document.getElementById('results-origin-city').textContent = isOut ? searchParams.from : searchParams.to;
  document.getElementById('results-dest-city').textContent = isOut ? searchParams.to : searchParams.from;

  const depStr = isOut ? searchParams.departureDate : searchParams.returnDate;
  document.getElementById('results-route-details').textContent = `${depStr} • ${searchParams.passengers} Penumpang • ${searchParams.classType}`;

  // Process list draw
  filterAndSortFlights();
}

function filterAndSortFlights() {
  let list = [...flightsPool];

  // Price filter
  list = list.filter(f => f.price <= maxPriceFilter);

  // Transit filter
  if (activeTransit === 'direct') {
    list = list.filter(f => f.stops === 0);
  } else if (activeTransit === 'transit') {
    list = list.filter(f => f.stops > 0);
  }

  // Airlines filter
  if (checkedAirlines.length > 0) {
    list = list.filter(f => checkedAirlines.includes(f.airlineName));
  }

  // Sortings
  list.sort((a, b) => {
    if (activeSort === 'cheapest') {
      return a.price - b.price;
    }
    if (activeSort === 'fastest') {
      const getMin = (d) => {
        const p = d.match(/(\d+)j\s*(\d+)m/);
        return p ? Number(p[1]) * 60 + Number(p[2]) : 0;
      };
      return getMin(a.duration) - getMin(b.duration);
    }
    if (activeSort === 'earliest') {
      return a.departureTime.localeCompare(b.departureTime);
    }
    if (activeSort === 'latest') {
      return b.departureTime.localeCompare(a.departureTime);
    }
  });

  // Draw cards
  const wrapper = document.getElementById('flights-list-placeholder');
  wrapper.innerHTML = '';

  if (list.length === 0) {
    wrapper.innerHTML = `
      <div class="no-flights glass-card">
        <i data-lucide="plane" class="no-flights-icon" size="48"></i>
        <h3>Tidak Ada Penerbangan Ditemukan</h3>
        <p>Silakan sesuaikan filter pencarian atau range harga Anda.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  list.forEach(flight => {
    const card = document.createElement('div');
    card.className = 'flight-card glass-card';
    card.innerHTML = `
      <div class="flight-airline">
        <div class="airline-logo-circle" style="background-color: ${flight.airlineId === 'GA' ? '#005C8A' : 
                                              flight.airlineId === 'SQ' ? '#F5A623' : 
                                              flight.airlineId === 'ID' ? '#A81C25' : 
                                              flight.airlineId === 'QG' ? '#4A90E2' : 
                                              flight.airlineId === 'JL' ? '#E60012' : '#E01933'}">
          <i data-lucide="plane" class="airline-plane-icon" size="16"></i>
        </div>
        <div>
          <h4 class="airline-name-text">${flight.airlineName}</h4>
          <span class="flight-number-text">${flight.flightNumber}</span>
        </div>
      </div>

      <div class="flight-schedule">
        <div class="time-node departure">
          <span class="time">${flight.departureTime}</span>
          <span class="airport-code-label">${flight.fromCode}</span>
        </div>
        
        <div class="duration-line">
          <span class="duration-text">${flight.duration}</span>
          <div class="line-bar">
            <div class="circle-node"></div>
            <div class="line"></div>
            <div class="plane-mini-container">
              <i data-lucide="plane" class="plane-mini" size="12"></i>
            </div>
            <div class="line"></div>
            <div class="circle-node"></div>
          </div>
          <span class="transit-text">${flight.stops === 0 ? 'Langsung' : `${flight.stops} Transit`}</span>
        </div>

        <div class="time-node arrival">
          <span class="time">${flight.arrivalTime}</span>
          <span class="airport-code-label">${flight.toCode}</span>
        </div>
      </div>

      <div class="flight-price-action">
        <div class="price-detail">
          <span class="price-tag">${formatCurrency(flight.price)}</span>
          <span class="price-info">/ pax</span>
        </div>
        <button class="btn btn-primary select-btn">
          <span>Pilih</span>
          <i data-lucide="chevron-right" size="16"></i>
        </button>
      </div>
    `;

    card.querySelector('.select-btn').addEventListener('click', () => {
      if (step === 'outbound') {
        outboundFlight = flight;
        if (searchParams.isRoundTrip) {
          step = 'inbound';
          renderView();
        } else {
          // If not logged in, prompt to login before proceeding
          if (!currentUser) {
            alert('Silakan masuk ke akun Anda terlebih dahulu untuk melanjutkan pemesanan.');
            openLoginModal(() => {
              step = 'passengers';
              renderView();
            });
            return;
          }
          step = 'passengers';
          renderView();
        }
      } else {
        inboundFlight = flight;
        // If not logged in, prompt to login before proceeding
        if (!currentUser) {
          alert('Silakan masuk ke akun Anda terlebih dahulu untuk melanjutkan pemesanan.');
          openLoginModal(() => {
            step = 'passengers';
            renderView();
          });
          return;
        }
        step = 'passengers';
        renderView();
      }
    });

    wrapper.appendChild(card);
  });

  lucide.createIcons();
}

// Render Passenger & Seat Selection Details
function renderPassengerPage() {
  const container = document.getElementById('passengers-inputs-container');
  container.innerHTML = '';

  const isInternational = ['SIN', 'HND', 'SYD'].includes(outboundFlight.fromCode) || ['SIN', 'HND', 'SYD'].includes(outboundFlight.toCode);

  passengers.forEach((p, idx) => {
    const block = document.createElement('div');
    block.className = 'passenger-form-block';
    block.innerHTML = `
      <div class="block-title">
        <span class="passenger-num">#${idx + 1}</span>
        <h4>Penumpang ${idx + 1}</h4>
      </div>

      <div class="passenger-fields">
        <div class="form-group-row">
          <div class="form-group title-group">
            <label class="form-label">Gelar</label>
            <select class="form-input select-input" id="p-title-${idx}">
              <option value="Mr" ${p.title === 'Mr' ? 'selected' : ''}>Tuan (Mr)</option>
              <option value="Mrs" ${p.title === 'Mrs' ? 'selected' : ''}>Nyonya (Mrs)</option>
              <option value="Ms" ${p.title === 'Ms' ? 'selected' : ''}>Nona (Ms)</option>
              <option value="Mstr" ${p.title === 'Mstr' ? 'selected' : ''}>Anak (Mstr)</option>
            </select>
          </div>

          <div class="form-group name-group">
            <label class="form-label">Nama Lengkap (sesuai ID)</label>
            <input type="text" class="form-input" id="p-name-${idx}" value="${p.fullName}" placeholder="Contoh: Hisyam Yassar" required>
          </div>
        </div>

        <div class="form-group-row">
          <div class="form-group">
            <label class="form-label">Kewarganegaraan</label>
            <input type="text" class="form-input" id="p-nat-${idx}" value="${p.nationality}" required>
          </div>

          <div class="form-group ${isInternational ? '' : 'hidden'}">
            <label class="form-label">Nomor Passport</label>
            <input type="text" class="form-input" id="p-pass-${idx}" value="${p.passportNumber || ''}" placeholder="Axxxxxxx" required>
          </div>
        </div>
      </div>
    `;

    // Connect text changes back to passenger details
    block.querySelector(`#p-name-${idx}`).addEventListener('input', (e) => {
      passengers[idx].fullName = e.target.value;
      // Refresh seat tabs labels
      renderSeatTabs();
    });

    container.appendChild(block);
  });

  // Render Seat Map tabs & Grid kabin
  renderSeatTabs();
  renderSeatGrid();
}

function renderSeatTabs() {
  const tabs = document.getElementById('seat-passenger-tabs');
  tabs.innerHTML = '';

  passengers.forEach((p, idx) => {
    const activeClass = currentPassengerIndex === idx ? 'active' : '';
    const seatId = selectedSeats[idx];
    const badge = seatId ? `<span class="assigned-seat-badge">${seatId}</span>` : '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `passenger-tab-btn ${activeClass}`;
    btn.innerHTML = `
      <div class="tab-passenger-info">
        <span class="tab-label">Penumpang ${idx + 1}</span>
        <span class="tab-name">${p.fullName || 'Belum diisi'}</span>
      </div>
      ${badge}
    `;

    btn.addEventListener('click', () => {
      currentPassengerIndex = idx;
      renderSeatTabs();
      renderSeatGrid();
    });

    tabs.appendChild(btn);
  });
}

function renderSeatGrid() {
  const grid = document.getElementById('seat-cabin-grid');
  grid.innerHTML = `
    <div class="cabin-header">
      <span>DEPAN</span>
      <div class="cockpit-divider"></div>
    </div>
  `;

  const classType = outboundFlight.classType;
  const rows = classType === 'Business' ? [1, 2, 3] : [4, 5, 6, 7, 8, 9, 10];
  const cols = classType === 'Business' ? ['A', 'B', 'E', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];

  const getSeatType = (c) => {
    if (c === 'A' || c === 'F') return 'window';
    if (c === 'C' || c === 'D') return 'aisle';
    return 'middle';
  };

  const getSeatPriceAdd = (r, c) => {
    let add = 0;
    if (r === 1 || r === 4) add += 150000;
    if (c === 'A' || c === 'F') add += 50000;
    return add;
  };

  const isOccupiedVal = (r, c) => {
    return (r * 7 + c.charCodeAt(0)) % 5 === 0; // 20% deterministic occupied
  };

  rows.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'seat-row';
    
    // Label Row
    rowDiv.innerHTML = `<span class="row-number">${row}</span>`;

    // Column Left Group
    const leftCol = document.createElement('div');
    leftCol.className = 'col-group';
    cols.slice(0, cols.length / 2).forEach(col => {
      const seatId = `${row}${col}`;
      const seatEl = drawSeatButton(seatId, row, col);
      leftCol.appendChild(seatEl);
    });
    rowDiv.appendChild(leftCol);

    // Aisle Gangway
    const aisle = document.createElement('div');
    aisle.className = 'aisle-space';
    aisle.textContent = 'GANG';
    rowDiv.appendChild(aisle);

    // Column Right Group
    const rightCol = document.createElement('div');
    rightCol.className = 'col-group';
    cols.slice(cols.length / 2).forEach(col => {
      const seatId = `${row}${col}`;
      const seatEl = drawSeatButton(seatId, row, col);
      rightCol.appendChild(seatEl);
    });
    rowDiv.appendChild(rightCol);

    grid.appendChild(rowDiv);
  });

  // Append footer
  const footer = document.createElement('div');
  footer.className = 'cabin-footer';
  footer.innerHTML = `
    <div class="cockpit-divider"></div>
    <span>BELAKANG</span>
  `;
  grid.appendChild(footer);

  lucide.createIcons();

  function drawSeatButton(seatId, r, c) {
    const occupied = isOccupiedVal(r, c);
    
    // Check selection mappings
    let selIdx = -1;
    Object.entries(selectedSeats).forEach(([idx, id]) => {
      if (id === seatId) selIdx = Number(idx);
    });

    const isCurrent = selIdx === currentPassengerIndex;
    const isOtherSelected = selIdx !== -1 && !isCurrent;

    const seatBtn = document.createElement('button');
    seatBtn.type = 'button';
    seatBtn.disabled = occupied || isOtherSelected;
    
    const seatType = getSeatType(c);
    const priceAdd = getSeatPriceAdd(r, c);

    seatBtn.className = `seat-btn ${occupied ? 'occupied' : ''} ${isCurrent ? 'selected' : ''} ${isOtherSelected ? 'selected-other' : ''} ${seatType}`;
    seatBtn.title = `Kursi ${seatId} (${seatType}) ${priceAdd > 0 ? `+Rp ${priceAdd.toLocaleString()}` : ''}`;
    seatBtn.innerHTML = `
      <i data-lucide="armchair" size="18"></i>
      <span class="seat-label-inside">${seatId}</span>
    `;

    if (!occupied && !isOtherSelected) {
      seatBtn.addEventListener('click', () => {
        selectedSeats[currentPassengerIndex] = seatId;
        renderSeatTabs();
        renderSeatGrid();
      });
    }

    return seatBtn;
  }
}

// Render Checkout Page details
function renderCheckoutPage() {
  // Flights summary blocks
  const flightsDiv = document.getElementById('checkout-flights-summary');
  flightsDiv.innerHTML = `
    <div class="flight-summary-block">
      <span class="summary-badge">Pergi</span>
      <div class="summary-route-times">
        <div class="summary-airline">
          <span class="airline-name-bold">${outboundFlight.airlineName}</span>
          <span class="flight-num">${outboundFlight.flightNumber}</span>
        </div>
        <div class="summary-cities">
          <span>${outboundFlight.from} (${outboundFlight.fromCode})</span>
          <i data-lucide="arrow-right" class="arrow-sep" size="14"></i>
          <span>${outboundFlight.to} (${outboundFlight.toCode})</span>
        </div>
        <div class="summary-schedule-info">
          <span>${outboundFlight.date} • ${outboundFlight.departureTime} - ${outboundFlight.arrivalTime}</span>
        </div>
      </div>
    </div>
  `;

  if (inboundFlight) {
    flightsDiv.innerHTML += `
      <div class="flight-summary-block border-top">
        <span class="summary-badge return">Pulang</span>
        <div class="summary-route-times">
          <div class="summary-airline">
            <span class="airline-name-bold">${inboundFlight.airlineName}</span>
            <span class="flight-num">${inboundFlight.flightNumber}</span>
          </div>
          <div class="summary-cities">
            <span>${inboundFlight.from} (${inboundFlight.fromCode})</span>
            <i data-lucide="arrow-right" class="arrow-sep" size="14"></i>
            <span>${inboundFlight.to} (${inboundFlight.toCode})</span>
          </div>
          <div class="summary-schedule-info">
            <span>${inboundFlight.date} • ${inboundFlight.departureTime} - ${inboundFlight.arrivalTime}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Passengers list summaries
  const passDiv = document.getElementById('checkout-passengers-summary');
  passDiv.innerHTML = '';
  passengers.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'p-summary-item';
    item.innerHTML = `
      <span class="p-number">P${idx + 1}</span>
      <div class="p-details">
        <span class="p-name">${p.title}. ${p.fullName}</span>
        <span class="p-nationality">${p.nationality} ${p.passportNumber ? `• Passport: ${p.passportNumber}` : ''}</span>
      </div>
      <div class="p-seat">
        <span class="seat-summary-label">Kursi</span>
        <span class="seat-summary-val">${p.seatNumber}</span>
      </div>
    `;
    passDiv.appendChild(item);
  });

  // Calculate seat selection pricing
  const getSeatPriceAdd = (seatId) => {
    if (!seatId) return 0;
    const r = parseInt(seatId);
    const c = seatId.replace(/[0-9]/g, '');
    let add = 0;
    if (r === 1 || r === 4) add += 150000;
    if (c === 'A' || c === 'F') add += 50000;
    return add;
  };
  const seatFees = passengers.reduce((sum, p) => sum + getSeatPriceAdd(p.seatId), 0);

  const outTicketCost = outboundFlight.price * passengers.length;
  const inTicketCost = inboundFlight ? inboundFlight.price * passengers.length : 0;
  const subtotal = outTicketCost + inTicketCost + seatFees;
  const taxFee = Math.round(subtotal * 0.11);
  const serviceFee = 15000;
  const discountAmount = promoApplied ? Math.round(subtotal * (discountPercent / 100)) : 0;
  const finalPrice = subtotal + taxFee + serviceFee - discountAmount;

  // Render pricing details table rows
  const pricingDiv = document.getElementById('checkout-price-rows');
  pricingDiv.innerHTML = `
    <div class="price-row">
      <span>Penerbangan Pergi (x${passengers.length})</span>
      <span>${formatCurrency(outTicketCost)}</span>
    </div>
  `;

  if (inboundFlight) {
    pricingDiv.innerHTML += `
      <div class="price-row">
        <span>Penerbangan Pulang (x${passengers.length})</span>
        <span>${formatCurrency(inTicketCost)}</span>
      </div>
    `;
  }

  pricingDiv.innerHTML += `
    <div class="price-row">
      <span>Biaya Pemilihan Kursi (${passengers.length} Kursi)</span>
      <span>${formatCurrency(seatFees)}</span>
    </div>
    <div class="price-row">
      <span>Pajak (PPN 11%)</span>
      <span>${formatCurrency(taxFee)}</span>
    </div>
    <div class="price-row">
      <span>Biaya Layanan</span>
      <span>${formatCurrency(serviceFee)}</span>
    </div>
  `;

  if (promoApplied) {
    pricingDiv.innerHTML += `
      <div class="price-row discount-row">
        <span>Diskon Promo (${discountPercent}%)</span>
        <span>-${formatCurrency(discountAmount)}</span>
      </div>
    `;
    document.getElementById('promo-badge').classList.remove('hidden');
    document.getElementById('promo-badge').textContent = `Promo Berhasil Digunakan (${discountPercent}% Diskon)`;
    document.getElementById('input-promo-code').disabled = true;
    document.getElementById('btn-apply-promo').disabled = true;
  } else {
    document.getElementById('promo-badge').classList.add('hidden');
    document.getElementById('input-promo-code').disabled = false;
    document.getElementById('btn-apply-promo').disabled = false;
  }

  pricingDiv.innerHTML += `
    <div class="price-row total-row border-top">
      <span>Total Pembayaran</span>
      <span class="final-total">${formatCurrency(finalPrice)}</span>
    </div>
  `;

  // Submit button label update
  document.getElementById('btn-pay-now').textContent = `Bayar Sekarang - ${formatCurrency(finalPrice)}`;

  lucide.createIcons();
}

// Generate finalized booking object & localStore update
function generateFinalBooking() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let refCode = '';
  for (let i = 0; i < 6; i++) {
    refCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Calculate pricing total for object
  const getSeatPriceAdd = (seatId) => {
    if (!seatId) return 0;
    const r = parseInt(seatId);
    const c = seatId.replace(/[0-9]/g, '');
    let add = 0;
    if (r === 1 || r === 4) add += 150000;
    if (c === 'A' || c === 'F') add += 50000;
    return add;
  };
  const seatFees = passengers.reduce((sum, p) => sum + getSeatPriceAdd(p.seatId), 0);
  const outTicketCost = outboundFlight.price * passengers.length;
  const inTicketCost = inboundFlight ? inboundFlight.price * passengers.length : 0;
  const subtotal = outTicketCost + inTicketCost + seatFees;
  const taxFee = Math.round(subtotal * 0.11);
  const serviceFee = 15000;
  const discountAmount = promoApplied ? Math.round(subtotal * (discountPercent / 100)) : 0;
  const finalPrice = subtotal + taxFee + serviceFee - discountAmount;

  let payMethodText = 'Kartu Kredit';
  if (checkoutPaymentMethod === 'qris') payMethodText = 'QRIS';
  if (checkoutPaymentMethod === 'va') payMethodText = 'Virtual Account';

  currentBooking = {
    id: refCode,
    flightId: outboundFlight.id,
    returnFlightId: inboundFlight ? inboundFlight.id : undefined,
    passengers: [...passengers],
    contactEmail,
    contactPhone,
    totalPrice: finalPrice,
    paymentMethod: payMethodText,
    paymentStatus: 'success',
    bookingDate: new Date().toISOString().split('T')[0],
    flightDetails: outboundFlight,
    returnFlightDetails: inboundFlight || undefined,
    status: 'active'
  };

  // Prepend to database
  bookings = [currentBooking, ...bookings];
  localStorage.setItem('flyease_bookings', JSON.stringify(bookings));

  step = 'ticket_display';
  renderView();
}

// Draw printed tickets Boarding Pass page
function renderTicketPage() {
  document.getElementById('ticket-booking-id').textContent = currentBooking.id;

  const stack = document.getElementById('ticket-boarding-cards-container');
  stack.innerHTML = '';

  currentBooking.passengers.forEach((passenger, idx) => {
    const card = document.createElement('div');
    card.className = 'boarding-pass-card';
    card.innerHTML = `
      <div class="pass-main">
        <div class="pass-header">
          <div class="pass-airline">
            <div class="airline-logo-circle-mini" style="background-color: ${currentBooking.flightDetails.airlineId === 'GA' ? '#005C8A' : 
                                          currentBooking.flightDetails.airlineId === 'SQ' ? '#F5A623' : 
                                          currentBooking.flightDetails.airlineId === 'ID' ? '#A81C25' : 
                                          currentBooking.flightDetails.airlineId === 'QG' ? '#4A90E2' : 
                                          currentBooking.flightDetails.airlineId === 'JL' ? '#E60012' : '#E01933'}">
              <i data-lucide="plane" class="airline-plane-icon" size="14"></i>
            </div>
            <span class="pass-airline-name">${currentBooking.flightDetails.airlineName}</span>
          </div>
          <div class="pass-class-badge">${currentBooking.flightDetails.classType}</div>
        </div>

        <div class="pass-body">
          <div class="pass-route-row">
            <div class="route-node">
              <span class="pass-city">${currentBooking.flightDetails.from}</span>
              <span class="pass-code">${currentBooking.flightDetails.fromCode}</span>
            </div>
            <div class="route-connector">
              <i data-lucide="plane" class="connector-plane" size="16"></i>
              <div class="connector-dash-line"></div>
            </div>
            <div class="route-node text-right">
              <span class="pass-city">${currentBooking.flightDetails.to}</span>
              <span class="pass-code">${currentBooking.flightDetails.toCode}</span>
            </div>
          </div>

          <div class="pass-details-grid">
            <div class="grid-item">
              <span class="grid-label">NAMA PENUMPANG</span>
              <span class="grid-val">${passenger.title}. ${passenger.fullName}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">NOMOR PENERBANGAN</span>
              <span class="grid-val">${currentBooking.flightDetails.flightNumber}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">TANGGAL TERBANG</span>
              <span class="grid-val">${currentBooking.flightDetails.date}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">JAM KEBERANGKATAN</span>
              <span class="grid-val">${currentBooking.flightDetails.departureTime}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">BOARDING TIME</span>
              <span class="grid-val">${calculateBoardingTime(currentBooking.flightDetails.departureTime)}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">GATE</span>
              <span class="grid-val">G-${2 + (idx % 4)}</span>
            </div>
          </div>
        </div>

        <div class="pass-footer">
          <div class="barcode-mock-container">
            <div class="barcode-lines"></div>
            <span class="barcode-digits">FE-${currentBooking.id}-${idx + 1}</span>
          </div>
        </div>
      </div>

      <div class="pass-separator">
        <div class="tear-circle top"></div>
        <div class="dashed-line"></div>
        <div class="tear-circle bottom"></div>
      </div>

      <div class="pass-stub">
        <div class="stub-header">
          <span class="stub-title">BOARDING PASS STUB</span>
        </div>
        <div class="stub-body">
          <div class="stub-cities-row">
            <span>${currentBooking.flightDetails.fromCode}</span>
            <i data-lucide="arrow-right" size="12"></i>
            <span>${currentBooking.flightDetails.toCode}</span>
          </div>
          
          <div class="stub-details">
            <div class="stub-item">
              <span class="stub-label">SEAT</span>
              <span class="stub-val-highlight">${passenger.seatNumber}</span>
            </div>
            <div class="stub-item">
              <span class="stub-label">FLIGHT</span>
              <span class="stub-val">${currentBooking.flightDetails.flightNumber}</span>
            </div>
            <div class="stub-item text-ellipsis">
              <span class="stub-label">PASSENGER</span>
              <span class="stub-val-name" title="${passenger.fullName}">${passenger.fullName}</span>
            </div>
            <div class="stub-item">
              <span class="stub-label">CLASS</span>
              <span class="stub-val">${currentBooking.flightDetails.classType}</span>
            </div>
          </div>

          <div class="stub-qr-mock">
            <svg viewBox="0 0 100 100" class="stub-qr-svg">
              <path d="M10 10h20v20h-20zm0 40h20v20h-20zm40-40h20v20h-20zm10 30h10v10h-10zm10 10h10v10h-10zm-20 10h10v10h-10z" fill="white" />
            </svg>
          </div>
        </div>
      </div>
    `;
    stack.appendChild(card);
  });

  // Return boarding ticket draw if exists
  if (currentBooking.returnFlightDetails) {
    const divider = document.createElement('h3');
    divider.className = 'section-title-label return-title-label';
    divider.textContent = 'E-Ticket & Boarding Pass (Kepulangan)';
    stack.appendChild(divider);

    currentBooking.passengers.forEach((passenger, idx) => {
      const card = document.createElement('div');
      card.className = 'boarding-pass-card return-pass';
      
      const rSeatNumber = `${parseInt(passenger.seatNumber) + 1}${passenger.seatNumber.replace(/[0-9]/g, '')}`;

      card.innerHTML = `
        <div class="pass-main">
          <div class="pass-header">
            <div class="pass-airline">
              <div class="airline-logo-circle-mini return-bg" style="background-color: ${currentBooking.returnFlightDetails.airlineId === 'GA' ? '#005C8A' : 
                                            currentBooking.returnFlightDetails.airlineId === 'SQ' ? '#F5A623' : 
                                            currentBooking.returnFlightDetails.airlineId === 'ID' ? '#A81C25' : 
                                            currentBooking.returnFlightDetails.airlineId === 'QG' ? '#4A90E2' : 
                                            currentBooking.returnFlightDetails.airlineId === 'JL' ? '#E60012' : '#E01933'}">
                <i data-lucide="plane" class="airline-plane-icon" size="14"></i>
              </div>
              <span class="pass-airline-name">${currentBooking.returnFlightDetails.airlineName}</span>
            </div>
            <div class="pass-class-badge">${currentBooking.returnFlightDetails.classType}</div>
          </div>

          <div class="pass-body">
            <div class="pass-route-row">
              <div class="route-node">
                <span class="pass-city">${currentBooking.returnFlightDetails.from}</span>
                <span class="pass-code">${currentBooking.returnFlightDetails.fromCode}</span>
              </div>
              <div class="route-connector">
                <i data-lucide="plane" class="connector-plane" size="16"></i>
                <div class="connector-dash-line"></div>
              </div>
              <div class="route-node text-right">
                <span class="pass-city">${currentBooking.returnFlightDetails.to}</span>
                <span class="pass-code">${currentBooking.returnFlightDetails.toCode}</span>
              </div>
            </div>

            <div class="pass-details-grid">
              <div class="grid-item">
                <span class="grid-label">NAMA PENUMPANG</span>
                <span class="grid-val">${passenger.title}. ${passenger.fullName}</span>
              </div>
              <div class="grid-item">
                <span class="grid-label">NOMOR PENERBANGAN</span>
                <span class="grid-val">${currentBooking.returnFlightDetails.flightNumber}</span>
              </div>
              <div class="grid-item">
                <span class="grid-label">TANGGAL TERBANG</span>
                <span class="grid-val">${currentBooking.returnFlightDetails.date}</span>
              </div>
              <div class="grid-item">
                <span class="grid-label">JAM KEBERANGKATAN</span>
                <span class="grid-val">${currentBooking.returnFlightDetails.departureTime}</span>
              </div>
              <div class="grid-item">
                <span class="grid-label">BOARDING TIME</span>
                <span class="grid-val">${calculateBoardingTime(currentBooking.returnFlightDetails.departureTime)}</span>
              </div>
              <div class="grid-item">
                <span class="grid-label">GATE</span>
                <span class="grid-val">G-${5 + (idx % 4)}</span>
              </div>
            </div>
          </div>

          <div class="pass-footer">
            <div class="barcode-mock-container">
              <div class="barcode-lines"></div>
              <span class="barcode-digits">FE-${currentBooking.id}-RET-${idx + 1}</span>
            </div>
          </div>
        </div>

        <div class="pass-separator">
          <div class="tear-circle top"></div>
          <div class="dashed-line"></div>
          <div class="tear-circle bottom"></div>
        </div>

        <div class="pass-stub">
          <div class="stub-header">
            <span class="stub-title">BOARDING PASS STUB</span>
          </div>
          <div class="stub-body">
            <div class="stub-cities-row">
              <span>${currentBooking.returnFlightDetails.fromCode}</span>
              <i data-lucide="arrow-right" size="12"></i>
              <span>${currentBooking.returnFlightDetails.toCode}</span>
            </div>
            
            <div class="stub-details">
              <div class="stub-item">
                <span class="stub-label">SEAT</span>
                <span class="stub-val-highlight">${rSeatNumber}</span>
              </div>
              <div class="stub-item">
                <span class="stub-label">FLIGHT</span>
                <span class="stub-val">${currentBooking.returnFlightDetails.flightNumber}</span>
              </div>
              <div class="stub-item text-ellipsis">
                <span class="stub-label">PASSENGER</span>
                <span class="stub-val-name" title="${passenger.fullName}">${passenger.fullName}</span>
              </div>
              <div class="stub-item">
                <span class="stub-label">CLASS</span>
                <span class="stub-val">${currentBooking.returnFlightDetails.classType}</span>
              </div>
            </div>

            <div class="stub-qr-mock">
              <svg viewBox="0 0 100 100" class="stub-qr-svg">
                <path d="M10 10h20v20h-20zm0 40h20v20h-20zm40-40h20v20h-20zm10 30h10v10h-10zm10 10h10v10h-10zm-20 10h10v10h-10z" fill="white" />
              </svg>
            </div>
          </div>
        </div>
      `;
      stack.appendChild(card);
    });
  }

  lucide.createIcons();
}

function calculateBoardingTime(depTime) {
  const [h, m] = depTime.split(':').map(Number);
  const bh = m < 30 ? (h - 1 + 24) % 24 : h;
  const bm = (m - 30 + 60) % 60;
  return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`;
}

// Render Bookings history view
function renderBookingsHistory() {
  const emptyState = document.getElementById('bookings-empty-state');
  const placeholder = document.getElementById('bookings-list-placeholder');
  const searchContainer = document.getElementById('history-search-container');

  placeholder.innerHTML = '';

  // Auth requirement for viewing bookings
  if (!currentUser) {
    emptyState.classList.remove('hidden');
    placeholder.classList.add('hidden');
    if (searchContainer) searchContainer.classList.add('hidden');
    
    emptyState.innerHTML = `
      <i data-lucide="lock" class="empty-icon" size="54"></i>
      <h3>Akses Riwayat Dibatasi</h3>
      <p>Silakan masuk ke akun Anda terlebih dahulu untuk melihat daftar pesanan tiket Anda.</p>
      <button class="btn btn-primary empty-cta-btn" id="btn-bookings-login-cta" style="margin-top: 16px;">
        Masuk / Daftar Akun
      </button>
    `;
    
    document.getElementById('btn-bookings-login-cta').addEventListener('click', () => {
      openLoginModal();
    });
    
    lucide.createIcons();
    return;
  }

  // User is logged in
  if (searchContainer) searchContainer.classList.remove('hidden');

  // Filter bookings to show only currentUser bookings
  let userBookings = bookings.filter(b => b.contactEmail.toLowerCase() === currentUser.email.toLowerCase());

  // Apply search query filter if typing
  const query = searchQuery.trim().toLowerCase();
  if (query) {
    userBookings = userBookings.filter(b => {
      const matchId = b.id.toLowerCase().includes(query);
      const matchRoute = b.flightDetails.fromCode.toLowerCase().includes(query) || 
                         b.flightDetails.toCode.toLowerCase().includes(query) ||
                         b.flightDetails.from.toLowerCase().includes(query) ||
                         b.flightDetails.to.toLowerCase().includes(query);
      const matchAirline = b.flightDetails.airlineName.toLowerCase().includes(query);
      const matchPassenger = b.passengers.some(p => p.fullName.toLowerCase().includes(query));
      
      return matchId || matchRoute || matchAirline || matchPassenger;
    });
  }

  if (userBookings.length === 0) {
    emptyState.classList.remove('hidden');
    placeholder.classList.add('hidden');
    
    if (query) {
      emptyState.innerHTML = `
        <i data-lucide="search" class="empty-icon" size="54"></i>
        <h3>Hasil Pencarian Kosong</h3>
        <p>Tidak ditemukan pesanan tiket yang cocok dengan kata kunci "${query}".</p>
      `;
    } else {
      emptyState.innerHTML = `
        <i data-lucide="ticket" class="empty-icon" size="54"></i>
        <h3>Belum Ada Tiket yang Dipesan</h3>
        <p>Anda belum memesan tiket pesawat. Cari rute liburan Anda berikutnya sekarang!</p>
        <button class="btn btn-primary empty-cta-btn" id="btn-bookings-empty-cta-dynamic">
          Cari Tiket Pesawat
        </button>
      `;
      document.getElementById('btn-bookings-empty-cta-dynamic').addEventListener('click', () => {
        activeTab = 'home';
        step = 'search';
        document.getElementById('btn-tab-home').classList.add('active');
        document.getElementById('btn-tab-bookings').classList.remove('active');
        renderView();
      });
    }
    
    lucide.createIcons();
    return;
  }

  emptyState.classList.add('hidden');
  placeholder.classList.remove('hidden');

  userBookings.forEach(booking => {
    const card = document.createElement('div');
    card.className = 'booking-history-card glass-card';

    const pNames = booking.passengers.map(p => p.fullName).join(', ');
    const isRound = !!booking.returnFlightDetails;

    card.innerHTML = `
      <div class="card-top-row">
        <div class="booking-code-info">
          <span class="booking-ref-label">KODE BOOKING</span>
          <span class="booking-ref-val">${booking.id}</span>
        </div>
        
        <div class="booking-status-badges">
          <span class="status-badge ${booking.status === 'active' ? 'active' : 'cancelled'}">
            ${booking.status === 'active' ? 'Aktif' : 'Dibatalkan'}
          </span>
          <span class="payment-status-badge">Lunas (${booking.paymentMethod})</span>
        </div>
      </div>

      <div class="booking-route-summary">
        <div class="route-block">
          <div class="route-airline-mini">
            <i data-lucide="plane" class="plane-rot"></i>
            <span>${booking.flightDetails.airlineName} (${booking.flightDetails.flightNumber})</span>
          </div>
          <div class="route-cities-row">
            <span class="city-code">${booking.flightDetails.fromCode}</span>
            <i data-lucide="arrow-right" class="arrow-sep"></i>
            <span class="city-code">${booking.flightDetails.toCode}</span>
          </div>
          <span class="flight-date-info">${booking.flightDetails.date} • ${booking.flightDetails.departureTime}</span>
        </div>

        ${isRound ? `
          <div class="route-block border-left">
            <div class="route-airline-mini return-mini">
              <i data-lucide="plane" class="plane-rot-return"></i>
              <span>${booking.returnFlightDetails.airlineName} (${booking.returnFlightDetails.flightNumber})</span>
            </div>
            <div class="route-cities-row">
              <span class="city-code">${booking.returnFlightDetails.fromCode}</span>
              <i data-lucide="arrow-right" class="arrow-sep"></i>
              <span class="city-code">${booking.returnFlightDetails.toCode}</span>
            </div>
            <span class="flight-date-info">${booking.returnFlightDetails.date} • ${booking.returnFlightDetails.departureTime}</span>
          </div>
        ` : ''}
      </div>

      <div class="card-bottom-row">
        <div class="booking-passengers-summary">
          <span class="summary-lbl">PENUMPANG (${booking.passengers.length})</span>
          <span class="summary-val-passengers" title="${pNames}">${pNames}</span>
        </div>

        <div class="booking-total-price">
          <span class="summary-lbl">TOTAL BIAYA</span>
          <span class="total-val">${formatCurrency(booking.totalPrice)}</span>
        </div>

        <div class="booking-actions">
          ${booking.status === 'active' ? `
            <button class="btn btn-outline action-btn btn-view-ticket-history">
              <i data-lucide="eye" size="14"></i>
              <span>Lihat E-Ticket</span>
            </button>
            <button class="btn btn-outline action-btn btn-edit-booking-history" style="border-color: var(--accent-secondary); color: var(--accent-secondary);">
              <i data-lucide="edit" size="14"></i>
              <span>Edit Detail</span>
            </button>
            <button class="btn btn-secondary cancel-btn-action btn-cancel-history">
              <i data-lucide="trash-2" size="14"></i>
              <span>Batalkan</span>
            </button>
          ` : `
            <div class="cancelled-message">
              <i data-lucide="shield-alert" size="14"></i>
              <span>Penerbangan Dibatalkan</span>
            </div>
            <button class="btn btn-secondary cancel-btn-action btn-delete-history" style="background: rgba(239, 68, 68, 0.2); color: var(--state-error); border: 1px solid var(--state-error);">
              <i data-lucide="trash" size="14"></i>
              <span>Hapus Permanen</span>
            </button>
          `}
        </div>
      </div>
    `;

    // Event hooks
    if (booking.status === 'active') {
      card.querySelector('.btn-view-ticket-history').addEventListener('click', () => {
        currentBooking = booking;
        step = 'ticket_display';
        activeTab = 'home';
        document.getElementById('btn-tab-home').classList.add('active');
        document.getElementById('btn-tab-bookings').classList.remove('active');
        renderView();
      });

      card.querySelector('.btn-edit-booking-history').addEventListener('click', () => {
        openEditBookingModal(booking);
      });

      card.querySelector('.btn-cancel-history').addEventListener('click', () => {
        if (window.confirm('Apakah Anda yakin ingin membatalkan pesanan tiket ini? Uang Anda akan direfund sesuai ketentuan.')) {
          booking.status = 'cancelled';
          localStorage.setItem('flyease_bookings', JSON.stringify(bookings));
          renderBookingsHistory();
        }
      });
    } else {
      card.querySelector('.btn-delete-history').addEventListener('click', () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pesanan ini secara permanen dari riwayat? Tindakan ini tidak dapat dibatalkan.')) {
          bookings = bookings.filter(b => b.id !== booking.id);
          localStorage.setItem('flyease_bookings', JSON.stringify(bookings));
          renderBookingsHistory();
        }
      });
    }

    placeholder.appendChild(card);
  });

  lucide.createIcons();
}

// Utility: Currency formatter IDR
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

// ==========================================================================
// NEW AUTHENTICATION & CRUD UTILITIES FUNCTIONS
// ==========================================================================

// Input validation helpers
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  const re = /^\+?[0-9\s-]{10,14}$/;
  return re.test(phone);
}

function validateName(name) {
  const re = /^[a-zA-Z\s]{3,50}$/;
  return re.test(name.trim());
}

function validatePassword(password) {
  return password.length >= 6;
}

function toggleInputValidation(inputEl, errorEl, isValid) {
  if (isValid) {
    inputEl.classList.remove('input-invalid');
    inputEl.classList.add('input-valid');
    if (errorEl) errorEl.classList.remove('visible');
  } else {
    inputEl.classList.add('input-invalid');
    inputEl.classList.remove('input-valid');
    if (errorEl) errorEl.classList.add('visible');
  }
}

// Navbar rendering trigger
function renderNavbarProfile() {
  const container = document.getElementById('navbar-profile-container');
  if (!container) return;
  
  if (currentUser) {
    container.innerHTML = `
      <div class="profile-dropdown-container" id="profile-dropdown-trigger">
        <div class="profile-badge">
          <i data-lucide="user" class="profile-icon" size="16"></i>
          <span class="profile-name">${currentUser.name}</span>
          <i data-lucide="chevron-down" size="12" style="margin-left: 4px;"></i>
        </div>
        <div class="profile-dropdown-menu">
          <div class="dropdown-item" style="border-bottom: 1px solid var(--glass-border); pointer-events: none; font-weight: 600; font-size: 12px; color: var(--text-muted);">
            ${currentUser.email}
          </div>
          <button class="dropdown-item" id="btn-dropdown-my-bookings">
            <i data-lucide="ticket" size="14"></i>
            <span>Pesanan Saya</span>
          </button>
          <button class="dropdown-item dropdown-item-danger" id="btn-dropdown-logout">
            <i data-lucide="log-out" size="14"></i>
            <span>Keluar</span>
          </button>
        </div>
      </div>
    `;
    
    // Bind triggers
    document.getElementById('btn-dropdown-my-bookings').addEventListener('click', (e) => {
      e.stopPropagation();
      activeTab = 'bookings';
      document.getElementById('btn-tab-home').classList.remove('active');
      document.getElementById('btn-tab-bookings').classList.add('active');
      renderView();
    });
    
    document.getElementById('btn-dropdown-logout').addEventListener('click', (e) => {
      e.stopPropagation();
      handleLogout();
    });
  } else {
    container.innerHTML = `
      <button class="btn-nav-login" id="btn-nav-login">
        <i data-lucide="log-in" size="16"></i>
        <span>Masuk / Daftar</span>
      </button>
    `;
    
    document.getElementById('btn-nav-login').addEventListener('click', () => {
      openLoginModal();
    });
  }
  lucide.createIcons();
}

// Modal open/close actions
let loginSuccessCallback = null;

function openLoginModal(callback = null) {
  loginSuccessCallback = callback;
  loginModalMode = 'login';
  resetLoginForm();
  document.getElementById('login-modal').classList.add('active');
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
  loginSuccessCallback = null;
}

function resetLoginForm() {
  document.getElementById('login-form').reset();
  
  if (loginModalMode === 'login') {
    document.getElementById('login-modal-title').textContent = 'Masuk ke FlyEase';
    document.getElementById('login-modal-subtitle').textContent = 'Gunakan akun Anda untuk menikmati pemesanan tiket instan';
    document.getElementById('login-group-name').classList.add('hidden');
    document.getElementById('btn-submit-login').textContent = 'Masuk';
    document.getElementById('login-toggle-desc').textContent = 'Belum punya akun?';
    document.getElementById('login-toggle-link').textContent = 'Daftar Sekarang';
  } else {
    document.getElementById('login-modal-title').textContent = 'Daftar Akun FlyEase';
    document.getElementById('login-modal-subtitle').textContent = 'Daftar sekarang untuk mulai memesan tiket pesawat premium';
    document.getElementById('login-group-name').classList.remove('hidden');
    document.getElementById('btn-submit-login').textContent = 'Daftar';
    document.getElementById('login-toggle-desc').textContent = 'Sudah punya akun?';
    document.getElementById('login-toggle-link').textContent = 'Masuk Sekarang';
  }
  
  document.querySelectorAll('#login-modal .input-error-msg').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('#login-modal .form-input').forEach(el => el.classList.remove('input-invalid', 'input-valid'));
}

// Submit handlers
function handleLoginSubmit(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('login-input-email');
  const passwordInput = document.getElementById('login-input-password');
  
  const emailVal = emailInput.value.trim();
  const passwordVal = passwordInput.value;
  
  const isEmailValid = validateEmail(emailVal);
  const isPasswordValid = validatePassword(passwordVal);
  
  toggleInputValidation(emailInput, document.getElementById('error-login-email'), isEmailValid);
  toggleInputValidation(passwordInput, document.getElementById('error-login-password'), isPasswordValid);
  
  if (loginModalMode === 'login') {
    if (!isEmailValid || !isPasswordValid) return;
    
    const accounts = JSON.parse(localStorage.getItem('flyease_accounts') || '[]');
    const user = accounts.find(acc => acc.email.toLowerCase() === emailVal.toLowerCase());
    
    if (user && user.password === passwordVal) {
      currentUser = { name: user.name, email: user.email };
      localStorage.setItem('flyease_user', JSON.stringify(currentUser));
      
      renderNavbarProfile();
      closeLoginModal();
      
      if (loginSuccessCallback) {
        loginSuccessCallback();
      }
      
      if (activeTab === 'bookings') {
        renderBookingsHistory();
      }
      alert(`Selamat datang kembali, ${currentUser.name}!`);
    } else {
      alert('Email atau Password salah! (Gunakan email: hisyam.yassar@gmail.com / pass: password123)');
    }
  } else {
    // Register
    const nameInput = document.getElementById('login-input-name');
    const nameVal = nameInput.value.trim();
    const isNameValid = validateName(nameVal);
    
    toggleInputValidation(nameInput, document.getElementById('error-login-name'), isNameValid);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid) return;
    
    const accounts = JSON.parse(localStorage.getItem('flyease_accounts') || '[]');
    const emailExists = accounts.some(acc => acc.email.toLowerCase() === emailVal.toLowerCase());
    
    if (emailExists) {
      alert('Email ini sudah terdaftar! Silakan login.');
      return;
    }
    
    const newAccount = { name: nameVal, email: emailVal, password: passwordVal };
    accounts.push(newAccount);
    localStorage.setItem('flyease_accounts', JSON.stringify(accounts));
    
    currentUser = { name: nameVal, email: emailVal };
    localStorage.setItem('flyease_user', JSON.stringify(currentUser));
    
    renderNavbarProfile();
    closeLoginModal();
    
    if (loginSuccessCallback) {
      loginSuccessCallback();
    }
    
    if (activeTab === 'bookings') {
      renderBookingsHistory();
    }
    alert(`Pendaftaran berhasil! Selamat datang, ${currentUser.name}!`);
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('flyease_user');
  renderNavbarProfile();
  
  if (activeTab === 'bookings') {
    renderBookingsHistory();
  }
  
  if (step !== 'search' && step !== 'outbound' && step !== 'inbound') {
    step = 'search';
    renderView();
  }
  alert('Anda telah berhasil keluar.');
}

// Edit Booking CRUD update logic
function openEditBookingModal(booking) {
  bookingToEdit = booking;
  document.getElementById('edit-booking-code').textContent = booking.id;
  document.getElementById('edit-contact-email').value = booking.contactEmail;
  document.getElementById('edit-contact-phone').value = booking.contactPhone;
  
  document.querySelectorAll('#edit-booking-modal .form-input').forEach(el => el.classList.remove('input-invalid', 'input-valid'));
  document.querySelectorAll('#edit-booking-modal .input-error-msg').forEach(el => el.classList.remove('visible'));
  
  const container = document.getElementById('edit-passengers-container');
  container.innerHTML = '';
  
  booking.passengers.forEach((p, idx) => {
    const block = document.createElement('div');
    block.className = 'passenger-edit-block';
    block.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 12px;';
    
    const isInternational = ['SIN', 'HND', 'SYD'].includes(booking.flightDetails.fromCode) || ['SIN', 'HND', 'SYD'].includes(booking.flightDetails.toCode);
    
    block.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 10px; display: flex; justify-content: space-between; font-size: 14px;">
        <span>Penumpang #${idx + 1}</span>
        <span style="color: var(--accent-secondary); font-size: 12px; font-weight: 600;">Kursi: ${p.seatNumber}</span>
      </div>
      <div class="form-group-row" style="display: grid; grid-template-columns: 80px 1fr; gap: 12px; margin-bottom: 10px;">
        <div class="form-group">
          <label class="form-label" style="font-size: 11px;">Gelar</label>
          <select class="form-input select-input" id="edit-p-title-${idx}" style="padding: 8px; font-size: 13px;">
            <option value="Mr" ${p.title === 'Mr' ? 'selected' : ''}>Mr</option>
            <option value="Mrs" ${p.title === 'Mrs' ? 'selected' : ''}>Mrs</option>
            <option value="Ms" ${p.title === 'Ms' ? 'selected' : ''}>Ms</option>
            <option value="Mstr" ${p.title === 'Mstr' ? 'selected' : ''}>Mstr</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size: 11px;">Nama Lengkap (sesuai ID)</label>
          <input type="text" class="form-input" id="edit-p-name-${idx}" value="${p.fullName}" style="padding: 8px; font-size: 13px;" required>
          <div class="input-error-msg" id="error-edit-p-name-${idx}">
            <i data-lucide="alert-circle" size="10"></i> Nama tidak valid (huruf saja, min 3 karakter).
          </div>
        </div>
      </div>
      <div class="form-group-row" style="display: grid; grid-template-columns: 1fr ${isInternational ? '1fr' : '0fr'}; gap: 12px;">
        <div class="form-group">
          <label class="form-label" style="font-size: 11px;">Kewarganegaraan</label>
          <input type="text" class="form-input" id="edit-p-nat-${idx}" value="${p.nationality}" style="padding: 8px; font-size: 13px;" required>
        </div>
        <div class="form-group ${isInternational ? '' : 'hidden'}">
          <label class="form-label" style="font-size: 11px;">Nomor Paspor</label>
          <input type="text" class="form-input" id="edit-p-pass-${idx}" value="${p.passportNumber || ''}" placeholder="Axxxxxxx" style="padding: 8px; font-size: 13px;" required>
          <div class="input-error-msg" id="error-edit-p-pass-${idx}">
            <i data-lucide="alert-circle" size="10"></i> Paspor wajib diisi.
          </div>
        </div>
      </div>
    `;
    container.appendChild(block);
  });
  
  document.getElementById('edit-booking-modal').classList.add('active');
  lucide.createIcons();
}

function closeEditBookingModal() {
  document.getElementById('edit-booking-modal').classList.remove('active');
  bookingToEdit = null;
}

function handleEditBookingSubmit(e) {
  e.preventDefault();
  if (!bookingToEdit) return;
  
  const emailInput = document.getElementById('edit-contact-email');
  const phoneInput = document.getElementById('edit-contact-phone');
  
  const emailVal = emailInput.value.trim();
  const phoneVal = phoneInput.value.trim();
  
  const isEmailValid = validateEmail(emailVal);
  const isPhoneValid = validatePhone(phoneVal);
  
  toggleInputValidation(emailInput, document.getElementById('error-edit-email'), isEmailValid);
  toggleInputValidation(phoneInput, document.getElementById('error-edit-phone'), isPhoneValid);
  
  let allValid = isEmailValid && isPhoneValid;
  
  const updatedPassengers = [];
  bookingToEdit.passengers.forEach((p, idx) => {
    const titleVal = document.getElementById(`edit-p-title-${idx}`).value;
    
    const nameInput = document.getElementById(`edit-p-name-${idx}`);
    const nameVal = nameInput.value.trim();
    const isNameValid = validateName(nameVal);
    toggleInputValidation(nameInput, document.getElementById(`error-edit-p-name-${idx}`), isNameValid);
    
    const natVal = document.getElementById(`edit-p-nat-${idx}`).value.trim();
    
    let passVal = '';
    let isPassValid = true;
    const isInternational = ['SIN', 'HND', 'SYD'].includes(bookingToEdit.flightDetails.fromCode) || ['SIN', 'HND', 'SYD'].includes(bookingToEdit.flightDetails.toCode);
    if (isInternational) {
      const passInput = document.getElementById(`edit-p-pass-${idx}`);
      passVal = passInput.value.trim();
      isPassValid = passVal.length > 0;
      toggleInputValidation(passInput, document.getElementById(`error-edit-p-pass-${idx}`), isPassValid);
    }
    
    if (!isNameValid || !isPassValid) {
      allValid = false;
    }
    
    updatedPassengers.push({
      ...p,
      title: titleVal,
      fullName: nameVal,
      nationality: natVal,
      passportNumber: isInternational ? passVal : undefined
    });
  });
  
  if (!allValid) return;
  
  bookings = bookings.map(b => {
    if (b.id === bookingToEdit.id) {
      return {
        ...b,
        contactEmail: emailVal,
        contactPhone: phoneVal,
        passengers: updatedPassengers
      };
    }
    return b;
  });
  
  localStorage.setItem('flyease_bookings', JSON.stringify(bookings));
  closeEditBookingModal();
  renderBookingsHistory();
  alert('Detail pesanan berhasil diperbarui!');
}
