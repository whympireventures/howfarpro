'use client';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function SmartMap({ sourceCoords, destinationCoords, distance }) {
  useEffect(() => {
    if (!sourceCoords || !destinationCoords) return;

    // Fix default marker icon path for Leaflet in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map('smartmap').setView(
      [(sourceCoords.lat + destinationCoords.lat) / 2,
       (sourceCoords.lng + destinationCoords.lng) / 2],
      3
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Markers
    const userMarker = L.marker([sourceCoords.lat, sourceCoords.lng])
      .addTo(map)
      .bindPopup('Your Location')
      .openPopup();

    const destMarker = L.marker([destinationCoords.lat, destinationCoords.lng])
      .addTo(map)
      .bindPopup(`Destination<br/>Distance: ${distance.toFixed(1)} km`);

    // Line between points
    L.polyline(
      [
        [sourceCoords.lat, sourceCoords.lng],
        [destinationCoords.lat, destinationCoords.lng],
      ],
      { color: 'blue' }
    ).addTo(map);

    // Fit bounds so both markers are visible
    map.fitBounds([
      [sourceCoords.lat, sourceCoords.lng],
      [destinationCoords.lat, destinationCoords.lng],
    ]);

    return () => map.remove();
  }, [sourceCoords, destinationCoords, distance]);

  return (
    <div
      id="smartmap"
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
}
