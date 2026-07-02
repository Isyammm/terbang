const pool = require('./db');

const airports = [
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International Airport', country: 'Indonesia' },
  { code: 'DPS', city: 'Bali', name: 'I Gusti Ngurah Rai International Airport', country: 'Indonesia' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia' },
  { code: 'SUB', city: 'Surabaya', name: 'Juanda International Airport', country: 'Indonesia' },
  { code: 'KNO', city: 'Medan', name: 'Kualanamu International Airport', country: 'Indonesia' },
  { code: 'YIA', city: 'Yogyakarta', name: 'Yogyakarta International Airport', country: 'Indonesia' },
  { code: 'BDO', city: 'Bandung', name: 'Husein Sastranegara International Airport', country: 'Indonesia' },
  { code: 'LOP', city: 'Lombok', name: 'Lombok International Airport', country: 'Indonesia' },
  { code: 'UPG', city: 'Makassar', name: 'Sultan Hasanuddin International Airport', country: 'Indonesia' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
  { code: 'SRG', city: 'Semarang', name: 'Jenderal Ahmad Yani International Airport', country: 'Indonesia' },
  { code: 'BPN', city: 'Balikpapan', name: 'Sultan Aji Muhammad Sulaiman Sepinggan Airport', country: 'Indonesia' },
  { code: 'PLM', city: 'Palembang', name: 'Sultan Mahmud Badaruddin II Airport', country: 'Indonesia' },
  { code: 'PKU', city: 'Pekanbaru', name: 'Sultan Syarif Kasim II Airport', country: 'Indonesia' },
  { code: 'MDC', city: 'Manado', name: 'Sam Ratulangi International Airport', country: 'Indonesia' },
  { code: 'DJJ', city: 'Jayapura', name: 'Dortheys Hiyo Eluay International Airport', country: 'Indonesia' },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport', country: 'China' }
];

const airlines = [
  { id: 'GA', name: 'Garuda Indonesia', code: 'GA' },
  { id: 'SQ', name: 'Singapore Airlines', code: 'SQ' },
  { id: 'ID', name: 'Batik Air', code: 'ID' },
  { id: 'QG', name: 'Citilink', code: 'QG' },
  { id: 'JL', name: 'Japan Airlines', code: 'JL' },
  { id: 'QF', name: 'Qantas', code: 'QF' }
];

function seedRandom(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

const getClassPriceMultiplier = (classType) => {
  switch (classType) {
    case 'Business': return 2.5;
    case 'First': return 5;
    default: return 1;
  }
};

function generateFlightsForRoute(fromAir, toAir, dateStr, classType) {
  const fromCode = fromAir.code;
  const toCode = toAir.code;
  if (fromCode === toCode) return [];

  const seedKey = `${fromCode}-${toCode}-${dateStr}-${classType}`;
  const random = seedRandom(seedKey);

  let baseDurationMinutes = 90;
  let basePrice = 850000;

  const routeKey = [fromCode, toCode].sort().join('-');
  switch (routeKey) {
    case 'CGK-DPS': baseDurationMinutes = 110; basePrice = 1100000; break;
    case 'CGK-SIN': baseDurationMinutes = 105; basePrice = 1600000; break;
    case 'CGK-HND': baseDurationMinutes = 430; basePrice = 7500000; break;
    case 'CGK-SYD': baseDurationMinutes = 480; basePrice = 8200000; break;
    case 'DPS-SIN': baseDurationMinutes = 150; basePrice = 2200000; break;
    case 'DPS-HND': baseDurationMinutes = 450; basePrice = 8500000; break;
    case 'DPS-SYD': baseDurationMinutes = 360; basePrice = 5800000; break;
    case 'HND-SIN': baseDurationMinutes = 410; basePrice = 7200000; break;
    case 'SIN-SYD': baseDurationMinutes = 490; basePrice = 8900000; break;
    case 'CGK-SUB': baseDurationMinutes = 90; basePrice = 850000; break;
    case 'CGK-KNO': baseDurationMinutes = 140; basePrice = 1450000; break;
    default:
      baseDurationMinutes = 180 + Math.floor(random() * 120);
      basePrice = 1800000 + Math.floor(random() * 2000000);
      break;
  }

  basePrice = basePrice * getClassPriceMultiplier(classType);
  const flights = [];
  const scheduleTimes = [
    { dep: '05:30' }, { dep: '08:45' }, { dep: '13:15' }, { dep: '17:30' }, { dep: '21:00' }
  ];

  scheduleTimes.forEach((time, index) => {
    const isInternational = ['SIN', 'HND', 'SYD', 'KUL', 'BKK', 'HKG', 'ICN', 'DXB', 'AMS'].includes(fromCode) || 
                            ['SIN', 'HND', 'SYD', 'KUL', 'BKK', 'HKG', 'ICN', 'DXB', 'AMS'].includes(toCode);
    let availableAirlines = airlines;
    if (isInternational) {
      availableAirlines = airlines.filter(a => ['GA', 'SQ', 'JL', 'QF'].includes(a.id));
    } else {
      availableAirlines = airlines.filter(a => ['GA', 'ID', 'QG', 'SQ'].includes(a.id));
    }

    const airlineIndex = Math.floor(random() * availableAirlines.length);
    const airline = availableAirlines[airlineIndex] || airlines[0];

    const durationVar = Math.floor(random() * 30) - 15;
    const finalDurationMinutes = baseDurationMinutes + durationVar;
    const hours = Math.floor(finalDurationMinutes / 60);
    const minutes = finalDurationMinutes % 60;
    const durationStr = `${hours}j ${minutes}m`;

    const [depHours, depMins] = time.dep.split(':').map(Number);
    let arrHours = depHours + hours;
    let arrMins = depMins + minutes;
    if (arrMins >= 60) {
      arrHours += Math.floor(arrMins / 60);
      arrMins = arrMins % 60;
    }
    arrHours = arrHours % 24;
    const arrivalTime = `${String(arrHours).padStart(2, '0')}:${String(arrMins).padStart(2, '0')}`;

    const priceVar = 1 + (random() * 0.3 - 0.15);
    const finalPrice = Math.round((basePrice * priceVar) / 1000) * 1000;

    const flightNumVal = Math.floor(100 + random() * 899);
    const flightNumber = `${airline.code}-${flightNumVal}`;
    const stops = isInternational && finalDurationMinutes > 300 && random() > 0.6 ? 1 : 0;

    flights.push({
      id: `${flightNumber}-${dateStr}-${index}-${classType}`,
      flightNumber,
      airlineId: airline.id,
      airlineName: airline.name,
      fromCity: fromAir.city,
      fromCode,
      toCity: toAir.city,
      toCode,
      departureTime: time.dep,
      arrivalTime,
      date: dateStr,
      price: finalPrice,
      duration: durationStr,
      stops,
      classType,
      availableSeats: Math.floor(10 + random() * 40)
    });
  });

  return flights;
}

async function seed() {
  try {
    console.log('Seeding airports...');
    for (const a of airports) {
      await pool.query(
        'INSERT IGNORE INTO airports (code, city, name, country) VALUES (?, ?, ?, ?)',
        [a.code, a.city, a.name, a.country]
      );
    }
    
    console.log('Generating massive flight data...');
    // Generate dates: today to +7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const classes = ['Economy', 'Business', 'First'];
    let allFlights = [];

    // To prevent infinite generation, we'll pick popular routes instead of ALL pairs
    // because 17 * 16 pairs * 7 days * 3 classes = 5,712 combinations * 5 flights = ~28,560 flights
    // Which is fine to insert in bulk, let's do it!

    console.log('Building array...');
    for (const date of dates) {
      for (const fromAir of airports) {
        for (const toAir of airports) {
          if (fromAir.code === toAir.code) continue;
          for (const c of classes) {
            const flights = generateFlightsForRoute(fromAir, toAir, date, c);
            allFlights = allFlights.concat(flights);
          }
        }
      }
    }

    console.log(`Generated ${allFlights.length} flights! Inserting into database...`);
    
    // Clear old flights first just in case to avoid duplicates
    await pool.query('DELETE FROM flights');

    // Batch insert
    const batchSize = 1000;
    for (let i = 0; i < allFlights.length; i += batchSize) {
      const batch = allFlights.slice(i, i + batchSize);
      const values = batch.map(f => [
        f.id, f.flightNumber, f.airlineId, f.airlineName, f.fromCity, f.fromCode,
        f.toCity, f.toCode, f.departureTime, f.arrivalTime, f.date, f.price,
        f.duration, f.stops, f.classType, f.availableSeats
      ]);
      
      await pool.query(
        `INSERT IGNORE INTO flights 
        (id, flightNumber, airlineId, airlineName, fromCity, fromCode, toCity, toCode, departureTime, arrivalTime, date, price, duration, stops, classType, availableSeats) 
        VALUES ?`,
        [values]
      );
      process.stdout.write(`\rInserted ${Math.min(i + batchSize, allFlights.length)} / ${allFlights.length}`);
    }
    console.log('\nSeeding done!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
