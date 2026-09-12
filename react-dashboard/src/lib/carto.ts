/**
 * CARTO basemap tiles, in one place.
 *
 * CARTO began watermarking keyless raster tiles with "API KEY REQUIRED" across
 * the image in August 2026. The tiles still return valid PNGs and nothing is
 * blocked — the notice is painted into the picture — so every map in this
 * dashboard kept working and simply looked broken. The key removes it.
 *
 * The key is hardcoded on purpose. It is public by construction: it travels in
 * the tile URL, so any browser that draws a map can already read it. Putting it
 * in a VITE_ variable would only mean a fresh clone (`.env` is gitignored)
 * silently rebuilds the watermark back in — and the same key has to sit inline
 * in dashboards/vanlife_map.yaml and www/vanlife-panel/index.html regardless,
 * because neither has a build step.
 *
 * CARTO's own docs say the raster basemaps are being retired. When that lands,
 * the keyless replacement is a vector basemap (OpenFreeMap's dark style is free
 * and unmetered) via MapLibre rather than Leaflet's tileLayer.
 */
export const CARTO_KEY = 'cb1_3ijq_1_b3eca1cfab0a6b9f89186b05';

/** The basemap styles this dashboard uses. */
export type CartoStyle = 'rastertiles/voyager' | 'dark_nolabels' | 'dark_all';

/** Leaflet tile URL template for a CARTO style, carrying the key. */
export function cartoTiles(style: CartoStyle): string {
  return `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`;
}
