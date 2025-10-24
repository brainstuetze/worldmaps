import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryObject, Topology } from 'topojson-specification';
import worldData from 'world-atlas/countries-110m.json';
import { COUNTRY_CONTINENT_MAP } from './country-continent-map';

export type Continent =
  | 'Africa'
  | 'Antarctica'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'Oceania'
  | 'South America';

export interface CountryProperties {
  id: number | string;
  name: string;
  continent: Continent;
  isoA3?: string;
}

export type CountryFeature = Feature<Geometry, CountryProperties>;

type CountriesObject = {
  type: 'GeometryCollection';
  geometries: GeometryObject[];
};

type World110m = Topology<{ countries: CountriesObject }> & {
  objects: {
    countries: CountriesObject;
  };
};

const world110m = worldData as World110m;
const rawCountries = feature(world110m, world110m.objects.countries) as FeatureCollection<
  Geometry,
  { name?: string }
>;

const getContinentForName = (name: string | undefined): Continent => {
  if (!name) {
    return 'Europe';
  }

  return (COUNTRY_CONTINENT_MAP as Record<string, Continent>)[name] ?? 'Europe';
};

export const countries: CountryFeature[] = rawCountries.features
  .filter((featureItem): featureItem is Feature<Geometry, { name?: string }> => featureItem.geometry !== null)
  .map((featureItem) => {
    const name = featureItem.properties?.name ?? 'Unknown';
    const continent = getContinentForName(name);
    const id = featureItem.id ?? name;

    const countryFeature: CountryFeature = {
      type: 'Feature',
      geometry: featureItem.geometry,
      properties: {
        id,
        name,
        continent,
      },
    };

    if (featureItem.bbox) {
      countryFeature.bbox = featureItem.bbox;
    }

    countryFeature.id = id;

    return countryFeature;
  });

export const continents: Continent[] = Array.from(
  new Set(countries.map((country) => country.properties.continent)),
).sort((a, b) => a.localeCompare(b));

export const countriesByContinent = continents.reduce<Record<Continent, CountryFeature[]>>(
  (accumulator, continent) => {
    accumulator[continent] = countries
      .filter((country) => country.properties.continent === continent)
      .sort((a, b) => a.properties.name.localeCompare(b.properties.name));
    return accumulator;
  },
  {} as Record<Continent, CountryFeature[]>,
);
