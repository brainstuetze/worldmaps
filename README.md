# Worldmaps

This project now includes a React + Vite frontend for exploring the Natural Earth 1:110m country dataset. The app lets you highlight continents, browse the countries they contain, and generate printable A4 outlines for classroom or workshop use.

## Frontend

The frontend lives in [`frontend/`](frontend/). It is scaffolded with Vite and written in TypeScript.

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install dependencies

```bash
cd frontend
npm install
```

> **Note:** The project depends on geographic datasets from the [`world-atlas`](https://github.com/topojson/world-atlas) package (derived from [Natural Earth](https://www.naturalearthdata.com/)). The install step downloads the TopoJSON data alongside React and D3 dependencies.

### Run a development server

```bash
npm run dev -- --host
```

This starts the Vite dev server and prints a local URL you can open in a browser. Use the continent picker or click countries on the map to update the highlighted continent, country list, and printable outline preview.

### Build for production

```bash
npm run build
```

The production build is emitted to `frontend/dist/`. You can preview the built site locally with:

```bash
npm run preview -- --host
```

### Printing outlines

The “Print current” button prints only the currently selected country, while “Print all” renders every country outline on its own A4 page. Print styles ensure each SVG outline is scaled to A4 dimensions and separated with page breaks.

## Repository structure

```
frontend/        React + Vite application
└── src/         Application source code, components, styles, and data loaders
README.md        Project overview and usage instructions
```
