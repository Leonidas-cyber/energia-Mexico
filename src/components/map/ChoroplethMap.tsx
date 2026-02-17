/**
 * Mapa coropleta de México usando Leaflet (SVG renderer).
 * Soporta modos: MW por estado y conteo de plantas por estado.
 */
import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlantaEnergia } from "@/types/energy";

// Normalizar nombres de estados para matching
function normalizarEstado(nombre: string): string {
  return (nombre || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const ESTADO_ALIASES: Record<string, string[]> = {
  "coahuila": ["coahuila de zaragoza"],
  "coahuila de zaragoza": ["coahuila"],
  "michoacan": ["michoacan de ocampo"],
  "michoacan de ocampo": ["michoacan"],
  "veracruz": ["veracruz de ignacio de la llave", "veracruz llave"],
  "veracruz de ignacio de la llave": ["veracruz"],
  "mexico": ["estado de mexico"],
  "estado de mexico": ["mexico"],
  "ciudad de mexico": ["distrito federal", "cdmx"],
  "distrito federal": ["ciudad de mexico", "cdmx"],
};

function matchEstado(a: string, b: string): boolean {
  const na = normalizarEstado(a);
  const nb = normalizarEstado(b);
  if (na === nb) return true;
  if (na.startsWith(nb) || nb.startsWith(na)) return true;
  const aliases = ESTADO_ALIASES[na];
  if (aliases && aliases.some(al => al === nb || nb.startsWith(al) || al.startsWith(nb))) return true;
  return false;
}

// Escala de colores verde
const COLOR_SCALE_GREEN = ["#e8f4e8", "#a8d5ba", "#5fa87d", "#2d7a53", "#0a4d2e"];
const COLOR_SCALE_BLUE = ["#e8eef4", "#a8c4d5", "#5f8fa7", "#2d5a7a", "#0a2e4d"];

function getColor(value: number, maxVal: number, scale: string[]): string {
  if (maxVal <= 0 || value <= 0) return scale[0];
  const ratio = value / maxVal;
  if (ratio < 0.2) return scale[0];
  if (ratio < 0.4) return scale[1];
  if (ratio < 0.6) return scale[2];
  if (ratio < 0.8) return scale[3];
  return scale[4];
}

interface ChoroplethMapProps {
  plantas: PlantaEnergia[];
  modo: "coropleta-mw" | "coropleta-count";
  altura?: string;
}

export function ChoroplethMap({ plantas, modo, altura = "450px" }: ChoroplethMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);

  // Calcular datos por estado
  const estadoData = useMemo(() => {
    const map = new Map<string, { mw: number; count: number; publica: number; privada: number }>();
    for (const p of plantas) {
      if (p.estado) {
        const d = map.get(p.estado) || { mw: 0, count: 0, publica: 0, privada: 0 };
        d.mw += p.potencia_mw || 0;
        d.count += 1;
        if (p.sector === "publica") d.publica += 1;
        if (p.sector === "privada") d.privada += 1;
        map.set(p.estado, d);
      }
    }
    return map;
  }, [plantas]);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center: [23.8, -102.5],
      zoom: 5,
      maxBounds: [
        [12, -120],
        [34, -85],
      ],
      zoomControl: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 10,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Cargar y actualizar coropleta
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remover capa anterior
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const maxVal = Math.max(
      ...Array.from(estadoData.values()).map((d) => (modo === "coropleta-mw" ? d.mw : d.count)),
      1
    );

    fetch("/mexico-states.geojson")
      .then((r) => r.json())
      .then((geojson) => {
        const layer = L.geoJSON(geojson, {
          style: (feature) => {
            const geoNombre = feature?.properties?.name || feature?.properties?.ESTADO || feature?.properties?.NOM_ENT || "";
            let data = { mw: 0, count: 0, publica: 0, privada: 0 };
            for (const [csvEstado, csvData] of estadoData.entries()) {
              if (matchEstado(geoNombre, csvEstado)) {
                data = csvData;
                break;
              }
            }
            const value = modo === "coropleta-mw" ? data.mw : data.count;
            const scale = modo === "coropleta-mw" ? COLOR_SCALE_BLUE : COLOR_SCALE_GREEN;
            return {
              fillColor: getColor(value, maxVal, scale),
              fillOpacity: 0.75,
              weight: 1,
              color: modo === "coropleta-mw" ? "#1a3256" : "#1a5632",
              opacity: 0.6,
            };
          },
          onEachFeature: (feature, layer) => {
            const geoNombre = feature?.properties?.name || feature?.properties?.ESTADO || feature?.properties?.NOM_ENT || "Desconocido";
            let data = { mw: 0, count: 0, publica: 0, privada: 0 };
            for (const [csvEstado, csvData] of estadoData.entries()) {
              if (matchEstado(geoNombre, csvEstado)) {
                data = csvData;
                break;
              }
            }
            layer.bindPopup(`
              <div style="font-family:sans-serif;font-size:12px;line-height:1.5">
                <strong style="font-size:13px">${geoNombre}</strong><br/>
                <span style="color:#666">Potencia:</span> <strong>${Math.round(data.mw).toLocaleString()} MW</strong><br/>
                <span style="color:#666">Plantas:</span> ${data.count}<br/>
                <span style="color:#666">Pública:</span> ${data.publica} | <span style="color:#666">Privada:</span> ${data.privada}
              </div>
            `);
            layer.on("mouseover", function (e: any) {
              e.target.setStyle({ fillOpacity: 0.9, weight: 2 });
            });
            layer.on("mouseout", function (e: any) {
              e.target.setStyle({ fillOpacity: 0.75, weight: 1 });
            });
          },
        }).addTo(map);

        layerRef.current = layer;
      })
      .catch(console.error);
  }, [estadoData, modo]);

  return (
    <div className="relative rounded-md border overflow-hidden" style={{ height: altura }}>
      <div ref={mapContainer} className="w-full h-full" />
      {/* Leyenda */}
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-md border px-3 py-2 text-[10px] shadow z-[1000]">
        <p className="font-semibold text-xs mb-1">{modo === "coropleta-mw" ? "MW por Estado" : "Plantas por Estado"}</p>
        <div className="flex items-center gap-0.5">
          <span>Bajo</span>
          <div className="flex">
            {(modo === "coropleta-mw" ? COLOR_SCALE_BLUE : COLOR_SCALE_GREEN).map((c) => (
              <div key={c} className="w-5 h-3" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>Alto</span>
        </div>
      </div>
    </div>
  );
}
