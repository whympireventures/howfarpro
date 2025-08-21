'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MI_TO_M = 1609.34;

export default function Map({
  sourceCoords,
  destinationCoords,
  distance,           // kept for backward compatibility
  points = [],        // NEW: array of extra markers
  ringMiles,          // NEW: draw a ring from source in miles
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);     // holds all markers (source, dest, points)
  const polylineRef = useRef(null);  // line between source and destination
  const ringRef = useRef(null);      // distance ring

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: true,
      worldCopyJump: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      minZoom: 2,
      maxZoom: 8,
    }).addTo(mapInstance.current);

    mapInstance.current.setView([30, 0], 2);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Helpers
  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  const clearPolyline = () => {
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
  };

  const clearRing = () => {
    if (ringRef.current) {
      ringRef.current.remove();
      ringRef.current = null;
    }
  };

  const createMarker = (coords, color, label) =>
    L.circleMarker([coords.lat, coords.lng], {
      radius: 6,
      fillColor: color,
      color: '#fff',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.9,
    })
      .addTo(mapInstance.current)
      .bindPopup(label);

  // Update visuals when inputs change
  useEffect(() => {
    if (!mapInstance.current) return;

    // Reset layers
    clearMarkers();
    clearPolyline();
    clearRing();

    const bounds = [];

    // Destination marker (red)
    if (destinationCoords) {
      const destMarker = createMarker(
        destinationCoords,
        '#ff3b30',
        `Destination (${destinationCoords.lat.toFixed(2)}, ${destinationCoords.lng.toFixed(2)})`
      );
      markersRef.current.push(destMarker);
      bounds.push([destinationCoords.lat, destinationCoords.lng]);
    }

    // Source marker (blue)
    if (sourceCoords) {
      const sourceMarker = createMarker(
        sourceCoords,
        '#1e90ff',
        `Your Location (${sourceCoords.lat.toFixed(2)}, ${sourceCoords.lng.toFixed(2)})`
      );
      markersRef.current.push(sourceMarker);
      bounds.push([sourceCoords.lat, sourceCoords.lng]);

      // Optional ring from source
      if (typeof ringMiles === 'number' && !Number.isNaN(ringMiles) && ringMiles > 0) {
        ringRef.current = L.circle([sourceCoords.lat, sourceCoords.lng], {
          radius: ringMiles * MI_TO_M, // meters
          color: '#1e90ff',
          weight: 1.5,
          opacity: 0.7,
          fill: false,
        }).addTo(mapInstance.current);
      }
    }

    // Optional: polyline between source and destination
    if (destinationCoords && sourceCoords) {
      polylineRef.current = L.polyline(
        [
          [sourceCoords.lat, sourceCoords.lng],
          [destinationCoords.lat, destinationCoords.lng],
        ],
        {
          color: '#1e90ff',
          weight: 2,
          dashArray: '5, 5',
        }
      ).addTo(mapInstance.current);
    }

    // Extra points (green)
    if (Array.isArray(points) && points.length) {
      points.forEach((p) => {
        if (
          typeof p?.lat === 'number' &&
          typeof p?.lng === 'number' &&
          Number.isFinite(p.lat) &&
          Number.isFinite(p.lng)
        ) {
          const label =
            p.label ??
            `Point (${Number(p.lat).toFixed(2)}, ${Number(p.lng).toFixed(2)})${
              typeof p.miles === 'number' ? ` — ${Math.round(p.miles)} mi` : ''
            }`;
          const m = createMarker({ lat: p.lat, lng: p.lng }, '#34c759', label);
          markersRef.current.push(m);
          bounds.push([p.lat, p.lng]);
        }
      });
    }

    // Fit view
    if (bounds.length >= 2) {
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (bounds.length === 1) {
      mapInstance.current.setView(bounds[0], 4);
    } else {
      mapInstance.current.setView([30, 0], 2);
    }
  }, [sourceCoords, destinationCoords, distance, points, ringMiles]);

  return (
    <div
      ref={mapRef}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '10px',
        minHeight: '400px',
        backgroundColor: '#f5f5f5',
      }}
    />
  );
}
