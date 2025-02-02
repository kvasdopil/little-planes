// Average daily domestic flights between Swedish airports (2023 data)
// Data is approximate and based on typical schedules
export const dailyFlights: {
  from: string;
  to: string;
  averageFlightsPerDay: number;
}[] = [
  // Arlanda connections
  { from: 'Stockholm Arlanda', to: 'Gothenburg Landvetter', averageFlightsPerDay: 12 },
  { from: 'Stockholm Arlanda', to: 'Malmö', averageFlightsPerDay: 10 },
  { from: 'Stockholm Arlanda', to: 'Luleå', averageFlightsPerDay: 8 },
  { from: 'Stockholm Arlanda', to: 'Umeå', averageFlightsPerDay: 7 },
  { from: 'Stockholm Arlanda', to: 'Åre Östersund', averageFlightsPerDay: 4 },
  { from: 'Stockholm Arlanda', to: 'Visby', averageFlightsPerDay: 3 },
  { from: 'Stockholm Arlanda', to: 'Kiruna', averageFlightsPerDay: 2 },
  
  // Bromma connections
  { from: 'Stockholm Bromma', to: 'Gothenburg Landvetter', averageFlightsPerDay: 8 },
  { from: 'Stockholm Bromma', to: 'Malmö', averageFlightsPerDay: 6 },
  
  // Gothenburg connections
  { from: 'Gothenburg Landvetter', to: 'Malmö', averageFlightsPerDay: 4 },
  { from: 'Gothenburg Landvetter', to: 'Umeå', averageFlightsPerDay: 2 },
  
  // Northern connections
  { from: 'Umeå', to: 'Luleå', averageFlightsPerDay: 2 },
  { from: 'Luleå', to: 'Kiruna', averageFlightsPerDay: 1 }
];

// Helper function to get total daily flights for an airport
export function getTotalDailyFlights(airportName: string): number {
  return dailyFlights.reduce((total, flight) => {
    if (flight.from === airportName || flight.to === airportName) {
      return total + flight.averageFlightsPerDay;
    }
    return total;
  }, 0);
}

// Helper function to get flights between two specific airports
export function getFlightsBetweenAirports(airport1: string, airport2: string): number {
  return dailyFlights.reduce((total, flight) => {
    if ((flight.from === airport1 && flight.to === airport2) ||
        (flight.from === airport2 && flight.to === airport1)) {
      return total + flight.averageFlightsPerDay;
    }
    return total;
  }, 0);
} 