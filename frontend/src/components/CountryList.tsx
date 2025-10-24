import { useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Continent, CountryFeature } from '../data/countries';

const OUTLINE_WIDTH = 320;
const OUTLINE_HEIGHT = 200;
const OUTLINE_PADDING = 20;

interface CountryListProps {
  continent: Continent;
  countries: CountryFeature[];
  selectedCountry?: CountryFeature;
  onSelect: (country: CountryFeature) => void;
}

export function CountryList({ continent, countries, selectedCountry, onSelect }: CountryListProps) {
  const outlinePath = useMemo(() => {
    if (!selectedCountry) {
      return undefined;
    }

    const projection = geoMercator().fitSize(
      [OUTLINE_WIDTH - OUTLINE_PADDING * 2, OUTLINE_HEIGHT - OUTLINE_PADDING * 2],
      selectedCountry,
    );
    const path = geoPath(projection);
    return path(selectedCountry) ?? undefined;
  }, [selectedCountry]);

  return (
    <section className="country-list" aria-labelledby="country-list-heading">
      <h2 id="country-list-heading">Countries in {continent}</h2>
      <ol className="country-list__items">
        {countries.map((country) => {
          const isSelected = country.properties.id === selectedCountry?.properties.id;
          return (
            <li key={country.properties.id}>
              <button
                type="button"
                className={isSelected ? 'country-list__button country-list__button--selected' : 'country-list__button'}
                onClick={() => onSelect(country)}
              >
                {country.properties.name}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="country-list__preview" aria-live="polite">
        {selectedCountry ? (
          <svg
            width={OUTLINE_WIDTH}
            height={OUTLINE_HEIGHT}
            viewBox={`0 0 ${OUTLINE_WIDTH} ${OUTLINE_HEIGHT}`}
            role="img"
            aria-label={`${selectedCountry.properties.name} outline`}
          >
            <rect width="100%" height="100%" fill="#0f172a" />
            <g transform={`translate(${OUTLINE_PADDING}, ${OUTLINE_PADDING})`}>
              <path d={outlinePath ?? ''} fill="#38bdf8" stroke="#e2e8f0" strokeWidth={1.5} />
            </g>
          </svg>
        ) : (
          <p className="country-list__placeholder">Select a country to preview its outline.</p>
        )}
      </div>
    </section>
  );
}

export default CountryList;
