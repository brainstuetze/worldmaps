declare module 'geojson' {
  export type Position = number[];

  export interface Geometry {
    type: string;
    coordinates: unknown;
  }

  export interface Feature<G extends Geometry = Geometry, P = Record<string, unknown>> {
    type: 'Feature';
    id?: string | number;
    geometry: G | null;
    properties: P | null;
  }

  export interface FeatureCollection<G extends Geometry = Geometry, P = Record<string, unknown>> {
    type: 'FeatureCollection';
    features: Array<Feature<G, P>>;
  }
}
