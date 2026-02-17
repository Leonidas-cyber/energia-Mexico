/**
 * Mapa de la Red Nacional de Transmisión usando Leaflet.
 * Líneas coloreadas por nivel de voltaje: 400 kV (azul), 230 kV (naranja), 35-161 kV (magenta).
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const VOLTAGE_COLORS: Record<string, string> = {
  "400 kV": "#1a56db",
  "230 kV": "#e67300",
  "35-161 kV": "#cc33cc",
};

const VOLTAGE_STATS = [
  { rango: "330 – 549 kV", longitud: "20,807 km", porcentaje: "23.8%" },
  { rango: "220 – 329 kV", longitud: "23,134 km", porcentaje: "26.5%" },
  { rango: "132 – 219 kV", longitud: "1,202 km", porcentaje: "1.4%" },
  { rango: "52 – 131 kV", longitud: "39,741 km", porcentaje: "45.5%" },
  { rango: "25 – 51 kV", longitud: "7 km", porcentaje: "0.0%" },
  { rango: "10 – 24 kV", longitud: "42 km", porcentaje: "0.0%" },
  { rango: "Sin etiqueta", longitud: "2,385 km", porcentaje: "2.7%" },
];

export function TransmisionMap({ altura = "550px" }: { altura?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");
  const [stats, setStats] = useState({ total: 0, kmTotal: 0 });
  const layersRef = useRef<Record<string, L.GeoJSON>>({});

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center: [23.8, -102.5],
      zoom: 5,
      maxBounds: [[12, -120], [34, -85]],
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    mapRef.current = map;

    fetch("/data/transmision.geojson")
      .then((r) => r.json())
      .then((geojson) => {
        const features = geojson.features as any[];
        setStats({
          total: features.length,
          kmTotal: features.reduce((s: number, f: any) => s + (f.properties.longitud_km || 0), 0),
        });

        const popup = (props: any) => `
          <div style="font-family:sans-serif;font-size:12px;line-height:1.6">
            <strong style="font-size:13px">${props.nombre}</strong><br/>
            <span style="color:#666">Voltaje:</span> <strong>${props.voltaje_kv} kV</strong><br/>
            <span style="color:#666">Longitud:</span> ${Number(props.longitud_km).toLocaleString()} km<br/>
            <span style="color:#666">Categoría:</span> ${props.categoria}
          </div>`;

        const categories = ["400 kV", "230 kV", "35-161 kV"];
        const layers: Record<string, L.GeoJSON> = {};

        categories.forEach((cat) => {
          const layer = L.geoJSON(geojson, {
            filter: (f) => f.properties.categoria === cat,
            style: () => ({
              color: VOLTAGE_COLORS[cat],
              weight: cat === "400 kV" ? 4 : cat === "230 kV" ? 3 : 2,
              opacity: 0.85,
            }),
            onEachFeature: (f, layer) => layer.bindPopup(popup(f.properties)),
          }).addTo(map);
          layers[cat] = layer;
        });

        layersRef.current = layers;
      })
      .catch(console.error);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || Object.keys(layers).length === 0) return;

    Object.entries(layers).forEach(([cat, layer]) => {
      if (filtro === "todos" || filtro === cat) {
        if (!map.hasLayer(layer)) map.addLayer(layer);
      } else {
        if (map.hasLayer(layer)) map.removeLayer(layer);
      }
    });
  }, [filtro]);

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-muted/50 rounded-md p-2 text-center">
          <p className="text-lg font-bold text-foreground">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Líneas mapeadas</p>
        </div>
        <div className="bg-muted/50 rounded-md p-2 text-center">
          <p className="text-lg font-bold text-foreground">{stats.kmTotal.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">km aproximados</p>
        </div>
        <div className="bg-muted/50 rounded-md p-2 text-center">
          <p className="text-lg font-bold text-foreground">87,318</p>
          <p className="text-[10px] text-muted-foreground">km totales SEN</p>
        </div>
        <div className="bg-muted/50 rounded-md p-2 text-center">
          <p className="text-lg font-bold text-foreground">3</p>
          <p className="text-[10px] text-muted-foreground">Niveles de voltaje</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {["todos", "400 kV", "230 kV", "35-161 kV"].map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              filtro === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-accent"
            }`}
          >
            {t === "todos" ? "Todos" : t}
            {t !== "todos" && (
              <span
                className="inline-block w-2.5 h-2.5 rounded-full ml-1.5"
                style={{ backgroundColor: VOLTAGE_COLORS[t] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Mapa */}
      <div className="relative rounded-md border overflow-hidden" style={{ height: altura }}>
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-md border px-3 py-2 text-[10px] space-y-1 shadow z-[1000]">
          <p className="font-semibold text-xs mb-1">Red Nacional de Transmisión</p>
          {Object.entries(VOLTAGE_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 rounded" style={{ backgroundColor: color }} />
              <span>{cat}</span>
            </div>
          ))}
          <p className="text-muted-foreground mt-1 pt-1 border-t">Fuente: PRODESEN / CENACE</p>
        </div>
      </div>

      {/* Tabla de estadísticas */}
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/60">
              <th className="text-left px-3 py-1.5 font-semibold">Voltaje</th>
              <th className="text-right px-3 py-1.5 font-semibold">Longitud</th>
              <th className="text-right px-3 py-1.5 font-semibold">%</th>
            </tr>
          </thead>
          <tbody>
            {VOLTAGE_STATS.map((row) => (
              <tr key={row.rango} className="border-t border-border/50">
                <td className="px-3 py-1">{row.rango}</td>
                <td className="text-right px-3 py-1">{row.longitud}</td>
                <td className="text-right px-3 py-1">{row.porcentaje}</td>
              </tr>
            ))}
            <tr className="border-t font-semibold bg-muted/30">
              <td className="px-3 py-1">Total</td>
              <td className="text-right px-3 py-1">87,318 km</td>
              <td className="text-right px-3 py-1">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
