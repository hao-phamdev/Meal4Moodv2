# Workflow: Globe Interaction

## Objective
Render a 3D interactive globe. User drags to spin, clicks a country to select it.

## Stack
- Three.js + React Three Fiber (`@react-three/fiber`)
- `@react-three/drei` for helpers (OrbitControls, etc.)
- GeoJSON for country borders
- `country-cuisine-map.json` for country → cuisine mapping

## Steps
1. Load world GeoJSON into Three.js geometry on mount
2. Render each country as a mesh with a base material
3. On pointer-over: highlight country (emissive color change)
4. On click: raycast to detect which country mesh was hit
5. Resolve country name → look up in `country-cuisine-map.json`
6. If found: show `CountryConfirmCard` with flag + cuisine + dishes
7. If not found (ocean, territory, unmapped): ignore click

## Known Issues
- GeoJSON precision matters for raycasting; use Natural Earth 1:110m data
- OrbitControls must be disabled during country-select animation
- Mobile touch events require `touch-action: none` on the canvas

## Component
`src/components/Globe.tsx`
