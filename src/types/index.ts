export interface Airline {
  id: string;
  name: string;
  code: string;
  logoColor: string; // fallback if no image, to make colorful UI
}

export type ClassType = 'Economy' | 'Business' | 'First';

export interface Flight {
  id: string;
  flightNumber: string;
  airlineId: string;
  airlineName: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string; // "08:30"
  arrivalTime: string;   // "11:45"
  date: string;          // "YYYY-MM-DD"
  price: number;
  duration: string;      // "3j 15m"
  stops: number;         // 0 for direct, 1, 2
  classType: ClassType;
  availableSeats: number;
}

export interface Seat {
  id: string; // e.g. "12A"
  row: number;
  col: string; // "A", "B", "C", "D", "E", "F"
  type: 'window' | 'aisle' | 'middle';
  classType: 'Economy' | 'Business';
  status: 'available' | 'occupied' | 'selected';
  priceAddition: number;
}

export interface Passenger {
  id: string;
  title: 'Mr' | 'Mrs' | 'Ms' | 'Mstr';
  fullName: string;
  nationality: string;
  passportNumber?: string;
  seatId?: string;
  seatNumber?: string;
}

export interface Booking {
  id: string;
  flightId: string;
  returnFlightId?: string;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  bookingDate: string;
  flightDetails: Flight;
  returnFlightDetails?: Flight;
  status: 'active' | 'cancelled';
}

export interface SearchParams {
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  classType: ClassType;
  isRoundTrip: boolean;
}

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}
