'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

// Your site components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Lazy map (client-only)
const Map = dynamic(() => import('@/components/Map-comp'), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>,
});

// ---------- helpers ----------
const toRad = (d) => (d * Math.PI) / 180;
const kmToMiles = (km) => km * 0.621371;
const milesToKm = (mi) => mi / 0.621371;

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const titleCase = (s) =>
  (s || '')
    .replace(/-/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ')
    .trim();

const slugToDisplay = (slug) => titleCase(decodeURIComponent(slug || ''));

// ---------- page ----------
export default function PlacesExactlyMilesFrom() {
  const { miles, slug } = useParams(); // params from the folder
  const search = useSearchParams();

  // Optional ?tolerance=5 (miles). Defaults below.
  const toleranceMi = Number(search.get('tolerance')) || 5;

  const [origin, setOrigin] = useState(null); // {name, lat, lon}
  const [dataset, setDataset] = useState([]); // cities15000
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const desiredMiles = useMemo(() => Number(miles) || 0, [miles]);
  const originDisplay = useMemo(() => slugToDisplay(slug), [slug]);

  // ---- 1) Geocode the origin (with a very light OSM/Nominatim hit)
  const geocodeOrigin = useCallback(async (name) => {
    // If you already have a backend geocoder or cache, point to that instead.
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      name
    )}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      const { lat, lon, display_name } = data[0];
      return {
        name: display_name?.split(',')[0] || originDisplay,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
    }
    return null;
  }, [originDisplay]);

  // ---- 2) Load the dataset (client fetch from /public)
  const loadDataset = useCallback(async () => {
    const res = await fetch('/data/cities15000.min.json', { cache: 'force-cache' });
    if (!res.ok) throw new Error('Failed to load cities15000 dataset');
    return res.json();
  }, []);

  // ---- 3) bootstrap
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [orig, data] = await Promise.all([
          geocodeOrigin(originDisplay),
          loadDataset(),
        ]);
        if (cancelled) return;

        setOrigin(orig);
        setDataset(Array.isArray(data) ? data : []);

        if (!orig) {
          setResults([]);
          return;
        }

        // Filter by distance ~ exactly X miles ± tolerance
        const targetKm = milesToKm(desiredMiles);
        const tolKm = milesToKm(toleranceMi);

        // Compute distances, filter, sort by |difference|
        const matches = data
          .map((c) => {
            const km = haversineKm(orig.lat, orig.lon, c.lat, c.lon);
            return { ...c, km, mi: kmToMiles(km) };
          })
          .filter((c) => Math.abs(c.km - targetKm) <= tolKm)
          .sort((a, b) => Math.abs(a.km - targetKm) - Math.abs(b.km - targetKm))
          .slice(0, 200); // cap list for UX

        setResults(matches);
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [originDisplay, geocodeOrigin, loadDataset, desiredMiles, toleranceMi]);

  // ---- map positions
  const originCoords = useMemo(
    () => (origin ? { lat: origin.lat, lng: origin.lon } : null),
    [origin]
  );

  // Show circle (approx) by giving destination coords or let Map draw a ring if supported
  const markers = useMemo(() => {
    return results.map((r) => ({
      lat: r.lat,
      lng: r.lon,
      label: `${r.name}, ${r.admin1 || r.admin2 || r.country}`,
      miles: Math.round(r.mi),
    }));
  }, [results]);

  return (
    <>
      <Header />

      <main className="content-container" style={{ padding: '1.5rem 1rem' }}>
        <header className="page-header">
          <h1>
            Places exactly {desiredMiles} miles from {originDisplay}
            {toleranceMi ? ` (±${toleranceMi} miles)` : ''}
          </h1>
          <p className="description">
            Explore towns and cities from the GeoNames <em>cities15000</em> dataset that are approximately
            <strong> {desiredMiles} miles</strong> from <strong>{originDisplay}</strong>. Use these for road-trip ideas,
            radius searches, and more.
          </p>
        </header>

        {/* Controls */}
        <section aria-label="filters" style={{ margin: '1rem 0' }}>
          <div className="controls" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href={`/places-exactly-${desiredMiles}-miles-from-${slug}?tolerance=2`}
              className={`chip ${toleranceMi === 2 ? 'active' : ''}`}
            >
              ±2 mi
            </Link>
            <Link
              href={`/places-exactly-${desiredMiles}-miles-from-${slug}?tolerance=5`}
              className={`chip ${toleranceMi === 5 ? 'active' : ''}`}
            >
              ±5 mi
            </Link>
            <Link
              href={`/places-exactly-${desiredMiles}-miles-from-${slug}?tolerance=10`}
              className={`chip ${toleranceMi === 10 ? 'active' : ''}`}
            >
              ±10 mi
            </Link>
          </div>
        </section>

        {/* Map */}
        <section style={{ marginTop: '1rem' }}>
          <div className="map-container">
            <Map
              sourceCoords={originCoords}
              destinationCoords={null}
              points={markers}           // if your Map-comp supports a points array
              ringMiles={desiredMiles}   // optional: let the map draw a distance ring
            />
          </div>
        </section>

        {/* Results */}
        <section style={{ marginTop: '1.5rem' }}>
          <h2>Results ({results.length})</h2>
          {loading ? (
            <div className="spinner">Loading…</div>
          ) : results.length === 0 ? (
            <p>No places found within the selected tolerance.</p>
          ) : (
            <ul className="results-list">
              {results.map((r) => {
                const destSlug = encodeURIComponent(
                  r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                );
                const originSlug = encodeURIComponent(slug);
                return (
                  <li key={`${r.name}-${r.lat}-${r.lon}`} className="result-item">
                    <div className="result-main">
                      <strong>{r.name}</strong>
                      <span className="muted">
                        {r.admin1 ? `, ${r.admin1}` : ''} {r.country ? ` (${r.country})` : ''}
                      </span>
                    </div>
                    <div className="result-meta">
                      <span>{Math.round(r.mi)} mi</span>
                      <Link
                        className="result-link"
                        href={`/how-far-is-${destSlug}-from-${originSlug}`}
                        prefetch={false}
                      >
                        View distance tool →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* FAQ (SEO) */}
        <section style={{ marginTop: '2rem' }}>
          <h2>FAQ</h2>
          <details>
            <summary>What does “exactly X miles” mean?</summary>
            <p>
              We use a small tolerance (±{toleranceMi} miles by default) to account for rounding and how geodesic
              distance works on a sphere. You can switch the tolerance using the chips above.
            </p>
          </details>
          <details>
            <summary>Where does the city data come from?</summary>
            <p>
              From the GeoNames <code>cities15000</code> dataset (pop. &gt;= 15k). Coordinates are WGS-84 (lat/lon).
            </p>
          </details>
          <details>
            <summary>How is distance calculated?</summary>
            <p>
              We calculate great-circle distances with the Haversine formula, then convert kilometers to miles.
            </p>
          </details>
          <details>
            <summary>Can I change the origin or distance?</summary>
            <p>
              Yes—modify the URL. Example: <code>/places-exactly-50-miles-from-anaheim-ca/</code> or change the
              tolerance with <code>?tolerance=10</code>.
            </p>
          </details>
        </section>
      </main>

      <Footer />
    </>
  );
}
