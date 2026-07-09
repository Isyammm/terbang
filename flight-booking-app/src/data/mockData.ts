import { Airport, Airline, Flight, ClassType } from '../types';

export const airports: Airport[] = [
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International Airport', country: 'Indonesia' },
  { code: 'DPS', city: 'Bali', name: 'I Gusti Ngurah Rai International Airport', country: 'Indonesia' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia' },
  { code: 'SUB', city: 'Surabaya', name: 'Juanda International Airport', country: 'Indonesia' },
  { code: 'KNO', city: 'Medan', name: 'Kualanamu International Airport', country: 'Indonesia' }
];

export const airlines: Airline[] = [
  { id: 'GA', name: 'Garuda Indonesia', code: 'GA', logoColor: '#005C8A' },
  { id: 'SQ', name: 'Singapore Airlines', code: 'SQ', logoColor: '#F5A623' },
  { id: 'ID', name: 'Batik Air', code: 'ID', logoColor: '#A81C25' },
  { id: 'QG', name: 'Citilink', code: 'QG', logoColor: '#4A90E2' },
  { id: 'JL', name: 'Japan Airlines', code: 'JL', logoColor: '#E60012' },
  { id: 'QF', name: 'Qantas', code: 'QF', logoColor: '#E01933' }
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
    // Select airline based on route and random index
    // Long-haul international route: GA, SQ, JL, QF
    // Domestic/regional: GA, ID, QG, SQ
    const isInternational = ['SIN', 'HND', 'SYD'].includes(fromCode) || ['SIN', 'HND', 'SYD'].includes(toCode);
    let availableAirlines = airlines;
    if (isInternational) {
      availableAirlines = airlines.filter(a => ['GA', 'SQ', 'JL', 'QF'].includes(a.id));
    } else {
      availableAirlines = airlines.filter(a => ['GA', 'ID', 'QG', 'SQ'].includes(a.id));
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

    // Stops
    const stops = isInternational && finalDurationMinutes > 300 && random() > 0.6 ? 1 : 0;

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
