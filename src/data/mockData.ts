import { Airport, Airline, Flight, ClassType } from '../types';

export const airports: Airport[] = [
  // ── Indonesia ─────────────────────────────────────────────────────────────
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International Airport', country: 'Indonesia' },
  { code: 'DPS', city: 'Bali', name: 'I Gusti Ngurah Rai International Airport', country: 'Indonesia' },
  { code: 'SUB', city: 'Surabaya', name: 'Juanda International Airport', country: 'Indonesia' },
  { code: 'KNO', city: 'Medan', name: 'Kualanamu International Airport', country: 'Indonesia' },
  { code: 'YIA', city: 'Yogyakarta', name: 'Yogyakarta International Airport', country: 'Indonesia' },
  { code: 'BDO', city: 'Bandung', name: 'Husein Sastranegara International Airport', country: 'Indonesia' },
  { code: 'LOP', city: 'Lombok', name: 'Lombok International Airport', country: 'Indonesia' },
  { code: 'UPG', city: 'Makassar', name: 'Sultan Hasanuddin International Airport', country: 'Indonesia' },
  { code: 'SRG', city: 'Semarang', name: 'Jenderal Ahmad Yani International Airport', country: 'Indonesia' },
  { code: 'BPN', city: 'Balikpapan', name: 'Sultan Aji Muhammad Sulaiman Sepinggan Airport', country: 'Indonesia' },
  { code: 'PLM', city: 'Palembang', name: 'Sultan Mahmud Badaruddin II Airport', country: 'Indonesia' },
  { code: 'PKU', city: 'Pekanbaru', name: 'Sultan Syarif Kasim II Airport', country: 'Indonesia' },
  { code: 'MDC', city: 'Manado', name: 'Sam Ratulangi International Airport', country: 'Indonesia' },
  { code: 'DJJ', city: 'Jayapura', name: 'Dortheys Hiyo Eluay International Airport', country: 'Indonesia' },
  // ── Asia Tenggara & Asia ──────────────────────────────────────────────────
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport', country: 'China' },
  // ── Timur Tengah & Eropa ──────────────────────────────────────────────────
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  // ── Australia & Amerika ───────────────────────────────────────────────────
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA' },
];

export const airlines: Airline[] = [
  // ── Maskapai Indonesia ────────────────────────────────────────────────────
  { id: 'GA',  name: 'Garuda Indonesia',      code: 'GA',  logoColor: '#005C8A' },
  { id: 'ID',  name: 'Batik Air',             code: 'ID',  logoColor: '#A81C25' },
  { id: 'JT',  name: 'Lion Air',              code: 'JT',  logoColor: '#FF6B00' },
  { id: 'QG',  name: 'Citilink',              code: 'QG',  logoColor: '#00B050' },
  { id: 'IW',  name: 'Wings Air',             code: 'IW',  logoColor: '#E84A2F' },
  { id: 'IN',  name: 'Nam Air',               code: 'IN',  logoColor: '#0066CC' },
  { id: '3N',  name: 'TransNusa',             code: '3N',  logoColor: '#C8102E' },
  { id: 'TN',  name: 'Super Air Jet',         code: 'TN',  logoColor: '#FF4500' },
  // ── Asia Tenggara ─────────────────────────────────────────────────────────
  { id: 'SQ',  name: 'Singapore Airlines',    code: 'SQ',  logoColor: '#F5A623' },
  { id: 'AK',  name: 'AirAsia',              code: 'AK',  logoColor: '#FF0000' },
  { id: 'MH',  name: 'Malaysia Airlines',     code: 'MH',  logoColor: '#CC0001' },
  { id: 'TG',  name: 'Thai Airways',          code: 'TG',  logoColor: '#6B2D8B' },
  { id: 'VN',  name: 'Vietnam Airlines',      code: 'VN',  logoColor: '#004B87' },
  { id: 'PR',  name: 'Philippine Airlines',   code: 'PR',  logoColor: '#0038A8' },
  // ── Asia Timur ────────────────────────────────────────────────────────────
  { id: 'JL',  name: 'Japan Airlines',        code: 'JL',  logoColor: '#E60012' },
  { id: 'NH',  name: 'All Nippon Airways',    code: 'NH',  logoColor: '#13448F' },
  { id: 'KE',  name: 'Korean Air',            code: 'KE',  logoColor: '#00256C' },
  { id: 'CX',  name: 'Cathay Pacific',        code: 'CX',  logoColor: '#007B5E' },
  { id: 'BR',  name: 'Eva Air',               code: 'BR',  logoColor: '#007B40' },
  { id: 'CA',  name: 'Air China',             code: 'CA',  logoColor: '#C8102E' },
  // ── Timur Tengah ──────────────────────────────────────────────────────────
  { id: 'EK',  name: 'Emirates',              code: 'EK',  logoColor: '#C8102E' },
  { id: 'EY',  name: 'Etihad Airways',        code: 'EY',  logoColor: '#9B7D46' },
  // ── Eropa ─────────────────────────────────────────────────────────────────
  { id: 'KL',  name: 'KLM',                   code: 'KL',  logoColor: '#00A1DE' },
  { id: 'AF',  name: 'Air France',            code: 'AF',  logoColor: '#002157' },
  { id: 'LH',  name: 'Lufthansa',             code: 'LH',  logoColor: '#05164D' },
  { id: 'TK',  name: 'Turkish Airlines',      code: 'TK',  logoColor: '#C8102E' },
  // ── Australia & Amerika ───────────────────────────────────────────────────
  { id: 'QF',  name: 'Qantas',               code: 'QF',  logoColor: '#E01933' },
  { id: 'AA',  name: 'American Airlines',     code: 'AA',  logoColor: '#0078D2' },
  { id: 'DL',  name: 'Delta Air Lines',       code: 'DL',  logoColor: '#003A70' },
  { id: 'UA',  name: 'United Airlines',       code: 'UA',  logoColor: '#002244' },
];

// Helper to calculate price factor based on class type
const getClassPriceMultiplier = (classType: ClassType): number => {
  switch (classType) {
    case 'Business': return 2.5;
    case 'First': return 5;
    default: return 1;
  }
};

// Generates stable pseudo-random numbers based on a string seed
function seedRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

export function generateFlights(
  fromCode: string,
  toCode: string,
  dateStr: string,
  classType: ClassType
): Flight[] {
  // If destination is same as origin, return empty list
  if (fromCode === toCode) return [];

  const fromAirport = airports.find(a => a.code === fromCode);
  const toAirport = airports.find(a => a.code === toCode);
  if (!fromAirport || !toAirport) return [];

  // Seed for reproducible results based on date, from, to, and class
  const seedKey = `${fromCode}-${toCode}-${dateStr}-${classType}`;
  const random = seedRandom(seedKey);

  // Determine distance factor based on airports
  let baseDurationMinutes = 90; // default short flight
  let basePrice = 850000; // in IDR

  // Simple distance logic based on codes
  const routeKey = [fromCode, toCode].sort().join('-');
  switch (routeKey) {
    case 'CGK-DPS': // Jakarta to Bali
      baseDurationMinutes = 110;
      basePrice = 1100000;
      break;
    case 'CGK-SIN': // Jakarta to Singapore
      baseDurationMinutes = 105;
      basePrice = 1600000;
      break;
    case 'CGK-HND': // Jakarta to Tokyo
      baseDurationMinutes = 430;
      basePrice = 7500000;
      break;
    case 'CGK-SYD': // Jakarta to Sydney
      baseDurationMinutes = 480;
      basePrice = 8200000;
      break;
    case 'DPS-SIN': // Bali to Singapore
      baseDurationMinutes = 150;
      basePrice = 2200000;
      break;
    case 'DPS-HND': // Bali to Tokyo
      baseDurationMinutes = 450;
      basePrice = 8500000;
      break;
    case 'DPS-SYD': // Bali to Sydney
      baseDurationMinutes = 360;
      basePrice = 5800000;
      break;
    case 'HND-SIN': // Tokyo to Singapore
      baseDurationMinutes = 410;
      basePrice = 7200000;
      break;
    case 'SIN-SYD': // Singapore to Sydney
      baseDurationMinutes = 490;
      basePrice = 8900000;
      break;
    case 'CGK-SUB': // Jakarta to Surabaya
      baseDurationMinutes = 90;
      basePrice = 850000;
      break;
    case 'CGK-KNO': // Jakarta to Medan
      baseDurationMinutes = 140;
      basePrice = 1450000;
      break;
    default:
      // Random fallback duration & price
      baseDurationMinutes = 180 + Math.floor(random() * 120);
      basePrice = 1800000 + Math.floor(random() * 2000000);
      break;
  }

  // Adjust base price based on class type
  basePrice = basePrice * getClassPriceMultiplier(classType);

  // Generate 5 flights for this route
  const flights: Flight[] = [];
  const scheduleTimes = [
    { dep: '05:30', arr_offset: 0 },
    { dep: '08:45', arr_offset: 0 },
    { dep: '13:15', arr_offset: 0 },
    { dep: '17:30', arr_offset: 0 },
    { dep: '21:00', arr_offset: 1 } // Overnight flight
  ];

  scheduleTimes.forEach((time, index) => {
    // Tentukan maskapai berdasarkan tipe rute
    const domesticCodes   = ['CGK','DPS','SUB','KNO','YIA','BDO','LOP','UPG','SRG','BPN','PLM','PKU','MDC','DJJ'];
    const seAsiaCodes     = ['SIN','KUL','BKK','VN','PR'];
    const eastAsiaCodes   = ['HND','ICN','HKG','PEK'];
    const middleEastCodes = ['DXB'];
    const europeCodes     = ['AMS','LHR','CDG','FRA'];
    const americaCodes    = ['JFK','LAX','SYD'];

    const isDomestic    = domesticCodes.includes(fromCode) && domesticCodes.includes(toCode);
    const isSEAsia      = seAsiaCodes.includes(fromCode) || seAsiaCodes.includes(toCode);
    const isEastAsia    = eastAsiaCodes.includes(fromCode) || eastAsiaCodes.includes(toCode);
    const isMiddleEast  = middleEastCodes.includes(fromCode) || middleEastCodes.includes(toCode);
    const isEurope      = europeCodes.includes(fromCode) || europeCodes.includes(toCode);
    const isAmerica     = americaCodes.includes(fromCode) || americaCodes.includes(toCode);

    let availableAirlines = airlines;
    if (isDomestic) {
      availableAirlines = airlines.filter(a => ['GA','ID','JT','QG','IW','IN','3N','TN'].includes(a.id));
    } else if (isSEAsia) {
      availableAirlines = airlines.filter(a => ['GA','SQ','AK','MH','TG','VN','PR','ID'].includes(a.id));
    } else if (isEastAsia) {
      availableAirlines = airlines.filter(a => ['GA','SQ','JL','NH','KE','CX','BR','CA','AK'].includes(a.id));
    } else if (isMiddleEast) {
      availableAirlines = airlines.filter(a => ['GA','SQ','EK','EY','TK'].includes(a.id));
    } else if (isEurope) {
      availableAirlines = airlines.filter(a => ['GA','SQ','EK','KL','AF','LH','TK'].includes(a.id));
    } else if (isAmerica) {
      availableAirlines = airlines.filter(a => ['GA','SQ','QF','AA','DL','UA','EK'].includes(a.id));
    }

    const airlineIndex = Math.floor(random() * availableAirlines.length);
    const airline = availableAirlines[airlineIndex] || airlines[0];

    // Calculate dynamic flight duration (base duration +/- 15 mins)
    const durationVar = Math.floor(random() * 30) - 15;
    const finalDurationMinutes = baseDurationMinutes + durationVar;
    const hours = Math.floor(finalDurationMinutes / 60);
    const minutes = finalDurationMinutes % 60;
    const durationStr = `${hours}j ${minutes}m`;

    // Calculate arrival time
    const [depHours, depMins] = time.dep.split(':').map(Number);
    let arrHours = depHours + hours;
    let arrMins = depMins + minutes;
    if (arrMins >= 60) {
      arrHours += Math.floor(arrMins / 60);
      arrMins = arrMins % 60;
    }
    arrHours = arrHours % 24;
    const arrHoursStr = String(arrHours).padStart(2, '0');
    const arrMinsStr = String(arrMins).padStart(2, '0');
    const arrivalTime = `${arrHoursStr}:${arrMinsStr}`;

    // Price variation (+/- 15%)
    const priceVar = 1 + (random() * 0.3 - 0.15);
    const finalPrice = Math.round((basePrice * priceVar) / 1000) * 1000; // round to nearest thousand

    // Flight number
    const flightNumVal = Math.floor(100 + random() * 899);
    const flightNumber = `${airline.code}-${flightNumVal}`;

    // Stops (penerbangan non-domestik dengan durasi panjang bisa ada transit)
    const stops = !isDomestic && finalDurationMinutes > 300 && random() > 0.6 ? 1 : 0;

    flights.push({
      id: `${flightNumber}-${dateStr}-${index}`,
      flightNumber,
      airlineId: airline.id,
      airlineName: airline.name,
      from: fromAirport.city,
      fromCode,
      to: toAirport.city,
      toCode,
      departureTime: time.dep,
      arrivalTime,
      date: dateStr,
      price: finalPrice,
      duration: durationStr,
      stops,
      classType,
      availableSeats: Math.floor(10 + random() * 40) // 10 to 50 seats available
    });
  });

  // Sort flights by departure time by default
  return flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}
