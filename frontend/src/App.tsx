import { useCallback, useMemo, useState } from 'react';
import ContinentPicker from './components/ContinentPicker';
import CountryList from './components/CountryList';
import PrintLayout from './components/PrintLayout';
import WorldMap from './components/WorldMap';
import {
  continents,
  countries,
  countriesByContinent,
  type Continent,
  type CountryFeature,
} from './data/countries';

const allCountriesSorted = [...countries].sort((a, b) => {
  const continentComparison = a.properties.continent.localeCompare(b.properties.continent);
  if (continentComparison !== 0) {
    return continentComparison;
  }
  return a.properties.name.localeCompare(b.properties.name);
});

export function App() {
  const [selectedContinent, setSelectedContinent] = useState<Continent>(() => continents[0]!);
  const [selectedCountry, setSelectedCountry] = useState<CountryFeature | undefined>(() => {
    const initialContinent = continents[0];
    if (!initialContinent) {
      return undefined;
    }
    return countriesByContinent[initialContinent]?.[0];
  });

  const continentCountries = useMemo(
    () => countriesByContinent[selectedContinent] ?? [],
    [selectedContinent],
  );

  const handleContinentSelect = useCallback((continent: Continent) => {
    setSelectedContinent(continent);
    const first = countriesByContinent[continent]?.[0];
    setSelectedCountry(first);
  }, []);

  const handleCountrySelect = useCallback((country: CountryFeature) => {
    setSelectedContinent(country.properties.continent);
    setSelectedCountry(country);
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <h1>World map explorer</h1>
        <p>
          Explore the Natural Earth 1:110m countries dataset, highlight continents, and generate
          printable outlines for classroom use.
        </p>
      </header>
      <main className="app__layout">
        <section className="app__panel app__panel--map">
          <ContinentPicker
            continents={continents}
            selectedContinent={selectedContinent}
            onSelect={handleContinentSelect}
          />
          <WorldMap
            countries={countries}
            selectedContinent={selectedContinent}
            selectedCountryId={selectedCountry?.properties.id}
            onSelectContinent={handleContinentSelect}
            onSelectCountry={handleCountrySelect}
          />
        </section>
        <section className="app__panel app__panel--list">
          <CountryList
            continent={selectedContinent}
            countries={continentCountries}
            selectedCountry={selectedCountry}
            onSelect={handleCountrySelect}
          />
        </section>
        <section className="app__panel app__panel--print">
          <PrintLayout selectedCountry={selectedCountry} countries={allCountriesSorted} />
        </section>
      </main>
    </div>
  );
}

export default App;
