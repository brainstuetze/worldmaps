import { memo, useMemo } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { GeoProjection } from 'd3-geo';
import type { Continent, CountryFeature } from '../data/countries';

const WIDTH = 960;
const HEIGHT = 520;

const CONTINENT_COLOURS: Record<Continent, string> = {
  Africa: '#f97316',
  Antarctica: '#94a3b8',
  Asia: '#22c55e',
  Europe: '#38bdf8',
  'North America': '#eab308',
  Oceania: '#a855f7',
  'South America': '#ef4444',
};

interface WorldMapProps {
  countries: CountryFeature[];
  selectedContinent: Continent;
  selectedCountryId?: CountryFeature['properties']['id'];
  onSelectContinent: (continent: Continent) => void;
  onSelectCountry: (country: CountryFeature) => void;
}

export const WorldMap = memo(function WorldMap({
  countries,
  selectedContinent,
  selectedCountryId,
  onSelectContinent,
  onSelectCountry,
}: WorldMapProps) {
  const projection: GeoProjection = useMemo(
    () => geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: 'Sphere' }),
    [],
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  return (
    <svg
      className="world-map"
      role="img"
      aria-label="World map"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width={WIDTH} height={HEIGHT} fill="#0f172a" />
      {countries.map((country) => {
        const isActiveContinent = country.properties.continent === selectedContinent;
        const isSelectedCountry = selectedCountryId === country.properties.id;
        const fill = isActiveContinent ? CONTINENT_COLOURS[country.properties.continent] : '#1e293b';
        const stroke = isSelectedCountry ? '#ffffff' : '#0f172a';
        const strokeWidth = isSelectedCountry ? 2 : 1;
        const d = pathGenerator(country) ?? undefined;

        return (
          <path
            key={country.properties.id}
            d={d}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            className={isSelectedCountry ? 'world-map__country world-map__country--selected' : 'world-map__country'}
            tabIndex={0}
            role="button"
            aria-pressed={isSelectedCountry}
            onClick={() => {
              onSelectContinent(country.properties.continent);
              onSelectCountry(country);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                onSelectContinent(country.properties.continent);
                onSelectCountry(country);
              }
            }}
          >
            <title>{country.properties.name}</title>
          </path>
        );
      })}
    </svg>
  );
});

export default WorldMap;
