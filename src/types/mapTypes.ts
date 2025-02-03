export type RouteFeature = {
  type: 'Feature';
  properties: {
    flightsPerDay: number;
    from: string;
    to: string;
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
};

export type Airport = {
  name: string;
  coordinates: [number, number];
  size: 'small' | 'medium' | 'large';
}; 