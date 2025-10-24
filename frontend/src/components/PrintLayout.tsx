import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { CountryFeature } from '../data/countries';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const A4_PADDING = 40;

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
  return path(country) ?? '';
};

export function PrintLayout({ selectedCountry, countries }: PrintLayoutProps) {
  const [mode, setMode] = useState<PrintMode>('current');

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
      </div>
      <div className="print-layout__pages">
        {printableCountries.length === 0 ? (
          <p className="print-layout__placeholder">Select a country to preview printable outlines.</p>
        ) : (
          printableCountries.map((country) => {
            const pathData = createCountryPath(country);
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
                  <rect width="100%" height="100%" fill="#ffffff" />
                  <g transform={`translate(${A4_PADDING}, ${A4_PADDING})`}>
                    <path d={pathData} fill="#0f172a" stroke="#1e293b" strokeWidth={2} />
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
