import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapMarker = {
  id: string;
  lng: number;
  lat: number;
  color: string;
  label?: string | number;
};

export function MapboxMap({
  token,
  center = [44.78, 42.0],
  zoom = 6,
  markers = [],
  style = "mapbox://styles/mapbox/outdoors-v12",
}: {
  token: string;
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  style?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    mapRef.current = map;
    return () => {
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
    // intentionally only init once; subsequent prop changes handled in other effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, style]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markerRefs.current.forEach((m) => m.remove());
    markerRefs.current = markers.map((m) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 20px; height: 20px; border-radius: 50%;
        background: ${m.color}; border: 2px solid var(--paper, white);
        box-shadow: 0 1px 3px oklch(0 0 0 / 0.3);
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-mono, monospace); font-size: 9px; font-weight: 700;
        color: var(--paper, white);
      `;
      if (m.label !== undefined) el.textContent = String(m.label);
      return new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
    });
  }, [markers]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
      }}
    />
  );
}
