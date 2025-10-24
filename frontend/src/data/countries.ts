import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryObject, Topology } from 'topojson-specification';
import worldData from 'world-atlas/countries-110m.json';

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

interface RawCountryProperties {
  name: string;
  name_long?: string;
  iso_a3?: string;
  continent?: string;
  region_un?: string;
  subregion?: string;
  [key: string]: unknown;
}

type CountriesObject = {
  type: 'GeometryCollection';
  geometries: GeometryObject[];
};

type World110m = Topology<{ countries: CountriesObject; ne_110m_admin_0_countries: CountriesObject }> & {
  objects: {
    countries: CountriesObject;
    ne_110m_admin_0_countries: CountriesObject;
  };
};

const normaliseProperties = (properties: RawCountryProperties): RawCountryProperties => {
  const result: RawCountryProperties = { ...properties };

  for (const [key, value] of Object.entries(properties)) {
    const lowerKey = key.toLowerCase();
    if (!(lowerKey in result)) {
      (result as Record<string, unknown>)[lowerKey] = value;
    }
  }

  return result;
};

const CONTINENT_NORMALISATION: Record<string, Continent> = {
  africa: 'Africa',
  antarctica: 'Antarctica',
  asia: 'Asia',
  europe: 'Europe',
  oceania: 'Oceania',
  australia: 'Oceania',
  'north america': 'North America',
  'south america': 'South America',
  americas: 'North America',
  'seven seas (open ocean)': 'Oceania',
};

const SUBREGION_FALLBACKS: Record<string, Continent> = {
  caribbean: 'North America',
  'central america': 'North America',
  'northern america': 'North America',
  'south america': 'South America',
  'western asia': 'Asia',
  'middle africa': 'Africa',
  'eastern africa': 'Africa',
  'northern africa': 'Africa',
  'southern africa': 'Africa',
  'western africa': 'Africa',
  'central asia': 'Asia',
  'southern asia': 'Asia',
  'eastern asia': 'Asia',
  'south-eastern asia': 'Asia',
  'australia and new zealand': 'Oceania',
  'melanesia': 'Oceania',
  'micronesia': 'Oceania',
  'polynesia': 'Oceania',
  'western europe': 'Europe',
  'eastern europe': 'Europe',
  'northern europe': 'Europe',
  'southern europe': 'Europe',
};

const world110m = worldData as World110m;
const rawCountries = feature(world110m, world110m.objects.countries) as FeatureCollection<
  Geometry,
  RawCountryProperties
>;
const rawCountryMetadata = feature(
  world110m,
  world110m.objects.ne_110m_admin_0_countries,
) as FeatureCollection<Geometry, RawCountryProperties>;

const metadataLookup = rawCountryMetadata.features.reduce<Map<string, RawCountryProperties>>(
  (accumulator, metadataFeature) => {
    const properties = normaliseProperties(metadataFeature.properties ?? ({} as RawCountryProperties));
    const keys = new Set<string>();

    if (metadataFeature.id !== null && metadataFeature.id !== undefined) {
      keys.add(String(metadataFeature.id).toLowerCase());
    }
    const candidateKeys = [
      properties.iso_a3,
      (properties as Record<string, unknown>).adm0_a3,
      (properties as Record<string, unknown>).adm0_a3_us,
      properties.name,
      properties.name_long,
      (properties as Record<string, unknown>).formal_en,
      (properties as Record<string, unknown>).geounit,
    ];

    for (const candidate of candidateKeys) {
      if (!candidate || typeof candidate !== 'string') continue;
      keys.add(candidate.toLowerCase());
    }

    for (const key of keys) {
      if (!accumulator.has(key)) {
        accumulator.set(key, properties);
      }
    }

    return accumulator;
  },
  new Map<string, RawCountryProperties>(),
);

const normaliseContinent = (properties: RawCountryProperties): Continent => {
  const candidates = [properties.continent, properties.region_un, properties.subregion, properties.name];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'string') continue;
    const normalised = candidate.toLowerCase();
    if (normalised in CONTINENT_NORMALISATION) {
      const match = CONTINENT_NORMALISATION[normalised];
      if (match === 'North America' && properties.subregion) {
        const subregion = properties.subregion.toLowerCase();
        if (subregion in SUBREGION_FALLBACKS) {
          return SUBREGION_FALLBACKS[subregion];
        }
      }
      if (match === 'Oceania' && properties.subregion) {
        const subregion = properties.subregion.toLowerCase();
        if (subregion in SUBREGION_FALLBACKS) {
          return SUBREGION_FALLBACKS[subregion];
        }
      }
      return match;
    }
    if (normalised in SUBREGION_FALLBACKS) {
      return SUBREGION_FALLBACKS[normalised];
    }
  }

  // Antarctica occasionally appears without continent metadata.
  if (properties.name === 'Antarctica') {
    return 'Antarctica';
  }

  // Default to Europe as it is the most common fallback for missing data in this dataset.
  return 'Europe';
};

export const countries: CountryFeature[] = rawCountries.features
  .filter((featureItem): featureItem is CountryFeature => featureItem.geometry !== null)
  .map((featureItem) => {
    const initialProperties = normaliseProperties(
      featureItem.properties ?? ({} as RawCountryProperties),
    );
    const metadataMatch =
      metadataLookup.get(String(featureItem.id ?? '').toLowerCase()) ??
      (initialProperties.iso_a3
        ? metadataLookup.get(initialProperties.iso_a3.toLowerCase())
        : undefined) ??
      (initialProperties.name
        ? metadataLookup.get(initialProperties.name.toLowerCase())
        : undefined) ??
      (initialProperties.name_long
        ? metadataLookup.get(initialProperties.name_long.toLowerCase())
        : undefined);

    const properties = normaliseProperties(
      metadataMatch ? { ...metadataMatch, ...initialProperties } : initialProperties,
    );

    const continent = normaliseContinent(properties);
    const isoA3 =
      properties.iso_a3 ??
      (properties as Record<string, unknown>).adm0_a3 ??
      (properties as Record<string, unknown>).adm0_a3_us;
    const fallbackName = properties.name_long ?? properties.name ?? 'Unknown';
    const id = featureItem.id ?? (typeof isoA3 === 'string' ? isoA3 : undefined) ?? properties.name ?? fallbackName;

    return {
      ...featureItem,
      id,
      properties: {
        id,
        name: fallbackName,
        continent,
        isoA3: typeof isoA3 === 'string' ? isoA3 : undefined,
      },
    };
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
