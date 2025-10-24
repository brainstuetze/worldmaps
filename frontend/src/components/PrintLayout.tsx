import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { CountryFeature } from '../data/countries';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const A4_PADDING = 40;

const PRINT_CONTINENT_COLOURS: Record<CountryFeature['properties']['continent'], string> = {
  Africa: '#f8b13c',
  Antarctica: '#cbd5f5',
  Asia: '#66d39e',
  Europe: '#82c7ff',
  'North America': '#ffd272',
  Oceania: '#d6b0ff',
  'South America': '#ff9b94',
};

type PrintMode = 'current' | 'all';

interface PrintLayoutProps {
  selectedCountry?: CountryFeature;
  countries: CountryFeature[];
}

const createCountryPath = (country: CountryFeature) => {
  const projection = geoMercator().fitSize(
    [A4_WIDTH - A4_PADDING * 2, A4_HEIGHT - A4_PADDING * 2],
    country,
  );
  const path = geoPath(projection);
  const pathData = path(country) ?? '';
  const [centroidX, centroidY] = path.centroid(country);
  return {
    pathData,
    centroid: [centroidX, centroidY] as const,
  };
};

export function PrintLayout({ selectedCountry, countries }: PrintLayoutProps) {
  const [mode, setMode] = useState<PrintMode>('current');
  const [showCountryNames, setShowCountryNames] = useState(false);

  useEffect(() => {
    const handleAfterPrint = () => {
      setMode('current');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('afterprint', handleAfterPrint);
      return () => {
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }

    return undefined;
  }, []);

  const printableCountries = useMemo(() => {
    if (mode === 'all') {
      return countries;
    }
    return selectedCountry ? [selectedCountry] : [];
  }, [mode, countries, selectedCountry]);

  const handlePrint = (nextMode: PrintMode) => {
    setMode(nextMode);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.print();
        });
      });
    }
  };

  return (
    <section className="print-layout" aria-labelledby="print-layout-heading">
      <h2 id="print-layout-heading">Print layout</h2>
      <div className="print-layout__controls">
        <button
          type="button"
          onClick={() => handlePrint('current')}
          disabled={!selectedCountry}
        >
          Print current
        </button>
        <button type="button" onClick={() => handlePrint('all')}>
          Print all
        </button>
        <label className="print-layout__toggle">
          <input
            type="checkbox"
            checked={showCountryNames}
            onChange={(event) => setShowCountryNames(event.target.checked)}
          />
          Show country names inside borders
        </label>
      </div>
      <div className="print-layout__pages">
        {printableCountries.length === 0 ? (
          <p className="print-layout__placeholder">Select a country to preview printable outlines.</p>
        ) : (
          printableCountries.map((country) => {
            const { pathData, centroid } = createCountryPath(country);
            const [centroidX, centroidY] = centroid;
            const hasValidCentroid = Number.isFinite(centroidX) && Number.isFinite(centroidY);
            const fillColour = PRINT_CONTINENT_COLOURS[country.properties.continent] ?? '#94a3b8';
            return (
              <article className="print-page" key={country.properties.id}>
                <header className="print-page__header">
                  <h3>{country.properties.name}</h3>
                  <p>{country.properties.continent}</p>
                </header>
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${A4_WIDTH} ${A4_HEIGHT}`}
                  role="img"
                  aria-label={`${country.properties.name} printable outline`}
                >
                  <rect width="100%" height="100%" fill="#f6f7fb" />
                  <g transform={`translate(${A4_PADDING}, ${A4_PADDING})`}>
                    <path
                      d={pathData}
                      fill={fillColour}
                      stroke="#1e293b"
                      strokeWidth={2}
                    />
                    {showCountryNames && pathData && hasValidCentroid ? (
                      <text
                        x={centroidX}
                        y={centroidY}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        className="print-page__label"
                      >
                        {country.properties.name}
                      </text>
                    ) : null}
                  </g>
                </svg>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default PrintLayout;
