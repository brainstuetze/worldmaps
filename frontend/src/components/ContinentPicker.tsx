import type { Continent } from '../data/countries';

interface ContinentPickerProps {
  continents: Continent[];
  selectedContinent: Continent;
  onSelect: (continent: Continent) => void;
}

export function ContinentPicker({ continents, selectedContinent, onSelect }: ContinentPickerProps) {
  return (
    <label className="continent-picker">
      <span className="continent-picker__label">Continent</span>
      <select
        value={selectedContinent}
        onChange={(event) => onSelect(event.target.value as Continent)}
        className="continent-picker__select"
        aria-label="Select continent"
      >
        {continents.map((continent) => (
          <option key={continent} value={continent}>
            {continent}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ContinentPicker;
