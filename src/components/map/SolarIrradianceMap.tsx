import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PlantaEnergia } from "@/types/energy";

// Average GHI (kWh/m²/day) by Mexican state — source: Global Solar Atlas / Solargis
const GHI_POR_ESTADO: Record<string, number> = {
  "Sonora": 6.2, "Baja California Sur": 6.1, "Baja California": 5.9,
  "Chihuahua": 5.8, "Durango": 5.7, "Coahuila de Zaragoza": 5.5, "Coahuila": 5.5,
  "Sinaloa": 5.6, "Zacatecas": 5.6, "Nuevo León": 5.3,
  "San Luis Potosí": 5.4, "Aguascalientes": 5.5, "Nayarit": 5.3,
  "Jalisco": 5.4, "Guanajuato": 5.4, "Querétaro": 5.2,
  "Colima": 5.3, "Michoacán": 5.2, "Michoacán de Ocampo": 5.2,
  "Guerrero": 5.3, "Oaxaca": 5.3, "Puebla": 5.0,
  "Tlaxcala": 4.9, "Hidalgo": 4.8, "México": 4.9, "Estado de México": 4.9,
  "Ciudad de México": 4.8, "Distrito Federal": 4.8,
  "Morelos": 5.1, "Tamaulipas": 5.1, "Veracruz": 4.5,
  "Veracruz de Ignacio de la Llave": 4.5,
  "Tabasco": 4.3, "Campeche": 4.8, "Yucatán": 5.1,
  "Quintana Roo": 4.9, "Chiapas": 4.7,
};

function normalizarEstado(nombre: string): string {
  return (nombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function getGHI(geoName: string): number {
  // Direct match first
  if (GHI_POR_ESTADO[geoName]) return GHI_POR_ESTADO[geoName];
  // Fuzzy match
  const norm = normalizarEstado(geoName);
  for (const [key, val] of Object.entries(GHI_POR_ESTADO)) {
    const normKey = normalizarEstado(key);
    if (normKey === norm || norm.startsWith(normKey) || normKey.startsWith(norm)) return val;
  }
  return 4.5; // default
}

interface SolarIrradianceMapProps {
  plantas: PlantaEnergia[];
  altura?: string;
}

export function SolarIrradianceMap({ plantas, altura = "500px" }: SolarIrradianceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap',
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
        ],
      },
      center: [-102.5, 23.8],
      zoom: 4.5,
      maxBounds: [[-120, 12], [-85, 34]],
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Load Mexico states GeoJSON and color by GHI
      fetch("/mexico-states.geojson")
        .then((r) => r.json())
        .then((geojson) => {
          const enriched = {
            ...geojson,
            features: geojson.features.map((f: any) => {
              const name = f.properties?.name || f.properties?.ESTADO || f.properties?.NOM_ENT || f.properties?.state_name || "";
              const ghi = getGHI(name);
              return {
                ...f,
                properties: { ...f.properties, ghi },
              };
            }),
          };

          map.addSource("estados-solar", { type: "geojson", data: enriched });

          // GHI color scale: yellow (low ~4.0) → orange → red → dark red (high ~6.5)
          map.addLayer({
            id: "solar-fill",
            type: "fill",
            source: "estados-solar",
            paint: {
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "ghi"],
                4.0, "#ffffb2",
                4.5, "#fed976",
                5.0, "#fd8d3c",
                5.5, "#e31a1c",
                6.0, "#b10026",
                6.5, "#800026",
              ],
              "fill-opacity": 0.75,
            },
          });

          map.addLayer({
            id: "solar-outline",
            type: "line",
            source: "estados-solar",
            paint: {
              "line-color": "#7a0018",
              "line-width": 1,
              "line-opacity": 0.5,
            },
          });

          // State popup
          map.on("click", "solar-fill", (e) => {
            const props = e.features?.[0]?.properties;
            if (!props) return;
            const name = props.name || props.ESTADO || props.NOM_ENT || props.state_name || "Desconocido";
            new maplibregl.Popup({ closeButton: true })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="font-family:sans-serif;font-size:12px;line-height:1.5">
                  <strong>${name}</strong><br/>
                  <span style="color:#666">Irradiación (GHI):</span> <strong>${props.ghi} kWh/m²/día</strong>
                </div>
              `)
              .addTo(map);
          });

          // Add solar plant points on top
          const valid = plantas.filter((p) => p.lat != null && p.lon != null);
          if (valid.length > 0) {
            const plantGeo = {
              type: "FeatureCollection",
              features: valid.map((p) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [p.lon, p.lat] },
                properties: {
                  nombre: p.nombre_planta,
                  mw: p.potencia_mw || 0,
                  estado: p.estado,
                  dueno: p.dueno || "N/D",
                  fuente: p.fuente_origen === "csv_usuario" ? "GeoComunes.ORG" : p.fuente_origen,
                },
              })),
            };

            map.addSource("solar-plants", { type: "geojson", data: plantGeo as any });

            map.addLayer({
              id: "solar-points",
              type: "circle",
              source: "solar-plants",
              paint: {
                "circle-color": "#ffffff",
                "circle-radius": ["interpolate", ["linear"], ["get", "mw"], 0, 4, 100, 8, 500, 14],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#e6b800",
                "circle-opacity": 0.9,
              },
            });

            map.on("click", "solar-points", (e) => {
              const props = e.features?.[0]?.properties;
              if (!props) return;
              const coords = (e.features![0].geometry as any).coordinates.slice();
              new maplibregl.Popup({ closeButton: true, maxWidth: "320px" })
                .setLngLat(coords)
                .setHTML(`
                  <div style="font-family:sans-serif;font-size:12px;line-height:1.5">
                    <strong>${props.nombre}</strong><br/>
                    <span style="color:#666">Potencia:</span> <strong>${Number(props.mw).toLocaleString()} MW</strong><br/>
                    <span style="color:#666">Estado:</span> ${props.estado}<br/>
                    <span style="color:#666">Dueño:</span> ${props.dueno}<br/>
                    <span style="color:#666">Fuente:</span> ${props.fuente}
                  </div>
                `)
                .addTo(map);
            });

            map.on("mouseenter", "solar-points", () => { map.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", "solar-points", () => { map.getCanvas().style.cursor = ""; });
          }

          map.on("mouseenter", "solar-fill", () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", "solar-fill", () => { map.getCanvas().style.cursor = ""; });
        })
        .catch(console.error);
    });

    return () => map.remove();
  }, [plantas]);

  return (
    <div className="relative rounded-md border overflow-hidden" style={{ height: altura }}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-md border px-3 py-2 text-[10px] shadow space-y-1">
        <p className="font-semibold text-xs">Irradiación Solar (GHI kWh/m²/día)</p>
        <div className="flex items-center gap-0.5">
          <span>4.0</span>
          <div className="flex">
            {["#ffffb2", "#fed976", "#fd8d3c", "#e31a1c", "#b10026", "#800026"].map((c) => (
              <div key={c} className="w-5 h-3" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>6.5</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t">
          <div className="w-3 h-3 rounded-full bg-white border-2 border-[#e6b800]" />
          <span>Plantas solares (tamaño = MW)</span>
        </div>
        <p className="text-muted-foreground">Fuente: Global Solar Atlas / Solargis</p>
      </div>
      <div className="absolute top-2 left-2 bg-card/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-muted-foreground">
        {plantas.filter(p => p.lat != null && p.lon != null).length} plantas solares con coordenadas
      </div>
    </div>
  );
}
