export const airports: {
  name: string;
  coordinates: [number, number];
  size: 'small' | 'medium' | 'large';
}[] = [
  {
    name: 'Stockholm Arlanda Airport',
    coordinates: [17.9186, 59.6498],
    size: 'large',
  },
  {
    name: 'Gothenburg Landvetter Airport',
    coordinates: [12.2798, 57.6688],
    size: 'medium',
  },
  { name: 'Malmö Airport', coordinates: [13.3666, 55.5363], size: 'medium' },
  {
    name: 'Stockholm Bromma Airport',
    coordinates: [17.9465, 59.3544],
    size: 'small',
  },
  { name: 'Luleå Airport', coordinates: [22.121, 65.5438], size: 'small' },
  { name: 'Umeå Airport', coordinates: [20.29, 63.7918], size: 'small' },
  {
    name: 'Åre Östersund Airport',
    coordinates: [14.5013, 63.1944],
    size: 'small',
  },
  { name: 'Visby Airport', coordinates: [18.3462, 57.6628], size: 'small' },
  { name: 'Kiruna Airport', coordinates: [20.3368, 67.822], size: 'small' },
  { name: 'Skavsta Airport', coordinates: [16.9122, 58.7886], size: 'small' },
];
