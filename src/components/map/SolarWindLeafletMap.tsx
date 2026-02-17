/**
 * Mapa de irradiación solar o velocidad del viento usando Leaflet (SVG renderer).
 * Reemplaza los fill layers de MapLibre que no renderizan correctamente.
 */
import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlantaEnergia } from "@/types/energy";

function normalizarEstado(nombre: string): string {
  return (nombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

const ESTADO_ALIASES: Record<string, string[]> = {
  coahuila: ["coahuila de zaragoza"],
  "coahuila de zaragoza": ["coahuila"],
  michoacan: ["michoacan de ocampo"],
  "michoacan de ocampo": ["michoacan"],
  veracruz: ["veracruz de ignacio de la llave", "veracruz llave"],
  "veracruz de ignacio de la llave": ["veracruz"],
  mexico: ["estado de mexico"],
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
  if (aliases && aliases.some((al) => al === nb || nb.startsWith(al) || al.startsWith(nb))) return true;
  return false;
}

const GHI_POR_ESTADO: Record<string, number> = {
  Sonora: 6.2, "Baja California Sur": 6.1, "Baja California": 5.9,
  Chihuahua: 5.8, Durango: 5.7, "Coahuila de Zaragoza": 5.5, Coahuila: 5.5,
  Sinaloa: 5.6, Zacatecas: 5.6, "Nuevo León": 5.3,
  "San Luis Potosí": 5.4, Aguascalientes: 5.5, Nayarit: 5.3,
  Jalisco: 5.4, Guanajuato: 5.4, Querétaro: 5.2,
  Colima: 5.3, Michoacán: 5.2, "Michoacán de Ocampo": 5.2,
  Guerrero: 5.3, Oaxaca: 5.3, Puebla: 5.0,
  Tlaxcala: 4.9, Hidalgo: 4.8, México: 4.9, "Estado de México": 4.9,
  "Ciudad de México": 4.8, "Distrito Federal": 4.8,
  Morelos: 5.1, Tamaulipas: 5.1, Veracruz: 4.5,
  "Veracruz de Ignacio de la Llave": 4.5,
  Tabasco: 4.3, Campeche: 4.8, Yucatán: 5.1,
  "Quintana Roo": 4.9, Chiapas: 4.7,
};

/** Precipitación media anual (mm) - proxy de potencial hidroeléctrico */
const PRECIPITACION_POR_ESTADO: Record<string, number> = {
  Tabasco: 2550, Chiapas: 1970, Veracruz: 1750,
  "Veracruz de Ignacio de la Llave": 1750,
  Oaxaca: 1550, Guerrero: 1350, Puebla: 1200,
  Campeche: 1350, "Quintana Roo": 1250, Yucatán: 1050,
  Nayarit: 1250, Jalisco: 950, Colima: 1000,
  Michoacán: 900, "Michoacán de Ocampo": 900,
  "San Luis Potosí": 950, Hidalgo: 1100,
  Tamaulipas: 850, Sinaloa: 750, Durango: 650,
  México: 900, "Estado de México": 900,
  "Ciudad de México": 800, "Distrito Federal": 800,
  Morelos: 950, Tlaxcala: 750, Querétaro: 600,
  Guanajuato: 650, Aguascalientes: 500, Zacatecas: 450,
  "Nuevo León": 600, "Coahuila de Zaragoza": 350, Coahuila: 350,
  Chihuahua: 450, Sonora: 400,
  "Baja California": 250, "Baja California Sur": 180,
};

/** Capacidad térmica instalada referencial por estado (MW) */
const TERMICA_POR_ESTADO: Record<string, number> = {
  Tamaulipas: 8500, "Nuevo León": 5200, Veracruz: 4800,
  "Veracruz de Ignacio de la Llave": 4800,
  Sonora: 3900, "Coahuila de Zaragoza": 3500, Coahuila: 3500,
  Chihuahua: 2800, "Baja California": 2600, Jalisco: 2200,
  Sinaloa: 1800, Colima: 2500, Puebla: 1500,
  Guerrero: 1200, Durango: 900, "San Luis Potosí": 1100,
  México: 1400, "Estado de México": 1400,
  "Ciudad de México": 800, "Distrito Federal": 800,
  Michoacán: 1000, "Michoacán de Ocampo": 1000,
  Oaxaca: 800, Campeche: 1200, Yucatán: 1500,
  "Quintana Roo": 700, Tabasco: 600, Chiapas: 500,
  Hidalgo: 900, Querétaro: 700, Guanajuato: 800,
  Aguascalientes: 400, Zacatecas: 300, Nayarit: 350,
  Morelos: 500, Tlaxcala: 200,
  "Baja California Sur": 600,
};

/** Potencial geotérmico por estado (MW estimados) */
const GEOTERMICA_POR_ESTADO: Record<string, number> = {
  "Baja California": 720, Michoacán: 200, "Michoacán de Ocampo": 200,
  Puebla: 150, Jalisco: 120, Nayarit: 100,
  Chiapas: 80, Oaxaca: 60, Guerrero: 50,
  Colima: 40, Hidalgo: 35, Durango: 30,
  "San Luis Potosí": 25, Guanajuato: 20, Querétaro: 15,
  Sonora: 45, Chihuahua: 20, Aguascalientes: 15,
  Zacatecas: 10, Sinaloa: 10, Veracruz: 15,
  "Veracruz de Ignacio de la Llave": 15,
  Tamaulipas: 5, "Nuevo León": 5, "Coahuila de Zaragoza": 5, Coahuila: 5,
  Tabasco: 5, Campeche: 2, Yucatán: 2, "Quintana Roo": 2,
  México: 10, "Estado de México": 10,
  "Ciudad de México": 5, "Distrito Federal": 5,
  Morelos: 10, Tlaxcala: 5, "Baja California Sur": 30,
};

const VIENTO_POR_ESTADO: Record<string, number> = {
  Oaxaca: 8.5, Tamaulipas: 7.8, "Baja California": 7.2, "Baja California Sur": 6.8,
  "Coahuila de Zaragoza": 7.0, Coahuila: 7.0, "Nuevo León": 6.8,
  Zacatecas: 6.5, Chihuahua: 6.3, Sonora: 6.0, Durango: 5.8,
  "San Luis Potosí": 5.9, Puebla: 5.7, Veracruz: 5.5,
  "Veracruz de Ignacio de la Llave": 5.5, Hidalgo: 5.3,
  Tlaxcala: 5.4, Querétaro: 5.2, Guanajuato: 5.0,
  Jalisco: 5.1, Aguascalientes: 5.3, Sinaloa: 4.8,
  Nayarit: 4.5, Colima: 4.6, Michoacán: 4.7, "Michoacán de Ocampo": 4.7,
  Guerrero: 4.8, México: 4.3, "Estado de México": 4.3,
  "Ciudad de México": 3.8, "Distrito Federal": 3.8,
  Morelos: 4.0, Tabasco: 4.2, Campeche: 5.0,
  Yucatán: 5.8, "Quintana Roo": 5.5, Chiapas: 4.5,
};

function getVal(geoName: string, data: Record<string, number>, fallback: number): number {
  if (data[geoName]) return data[geoName];
  const norm = normalizarEstado(geoName);
  for (const [key, val] of Object.entries(data)) {
    const normKey = normalizarEstado(key);
    if (normKey === norm || norm.startsWith(normKey) || normKey.startsWith(norm)) return val;
  }
  return fallback;
}

// Solar: yellow→red scale
function solarColor(ghi: number): string {
  if (ghi <= 4.0) return "#ffffb2";
  if (ghi <= 4.5) return "#fed976";
  if (ghi <= 5.0) return "#fd8d3c";
  if (ghi <= 5.5) return "#e31a1c";
  if (ghi <= 6.0) return "#b10026";
  return "#800026";
}

// Wind: green→blue scale
function windColor(v: number): string {
  if (v <= 3.5) return "#f0f9e8";
  if (v <= 4.5) return "#bae4bc";
  if (v <= 5.5) return "#7bccc4";
  if (v <= 6.5) return "#43a2ca";
  if (v <= 7.5) return "#0868ac";
  return "#084081";
}

// Hydro: light blue→dark blue
function hydroColor(precip: number): string {
  if (precip <= 400) return "#f7fbff";
  if (precip <= 700) return "#c6dbef";
  if (precip <= 1000) return "#6baed6";
  if (precip <= 1400) return "#2171b5";
  if (precip <= 1800) return "#08519c";
  return "#08306b";
}

// Thermal: yellow→orange→red
function thermalColor(mw: number): string {
  if (mw <= 500) return "#fff5eb";
  if (mw <= 1000) return "#fdd49e";
  if (mw <= 2000) return "#fdbb84";
  if (mw <= 3500) return "#e6550d";
  if (mw <= 5000) return "#a63603";
  return "#7f2704";
}

// Geothermal: green→brown (volcanic)
function geothermalColor(mw: number): string {
  if (mw <= 5) return "#f7fcf5";
  if (mw <= 15) return "#c7e9c0";
  if (mw <= 40) return "#74c476";
  if (mw <= 100) return "#b5651d";
  if (mw <= 200) return "#8b4513";
  return "#5c2d05";
}

type MapMode = "solar" | "eolica" | "hidroelectrica" | "termica" | "geotermica";

interface ModeConfig {
  data: Record<string, number>;
  colorFn: (v: number) => string;
  borderColor: string;
  label: string;
  unit: string;
  fallback: number;
  markerColor: string;
  legendMin: string;
  legendMax: string;
  legendTitle: string;
  colors: string[];
  source: string;
  plantLabel: string;
}

function getModeConfig(modo: MapMode): ModeConfig {
  switch (modo) {
    case "solar":
      return {
        data: GHI_POR_ESTADO, colorFn: solarColor, borderColor: "#7a0018",
        label: "Irradiación (GHI)", unit: "kWh/m²/día", fallback: 4.5,
        markerColor: "#e6b800", legendMin: "4.0", legendMax: "6.5",
        legendTitle: "Irradiación Solar (GHI kWh/m²/día)",
        colors: ["#ffffb2", "#fed976", "#fd8d3c", "#e31a1c", "#b10026", "#800026"],
        source: "Global Solar Atlas / Solargis", plantLabel: "solares",
      };
    case "eolica":
      return {
        data: VIENTO_POR_ESTADO, colorFn: windColor, borderColor: "#084081",
        label: "Vel. viento (100m)", unit: "m/s", fallback: 4.5,
        markerColor: "#3399cc", legendMin: "3.5", legendMax: "8.5",
        legendTitle: "Velocidad del Viento (m/s a 100m)",
        colors: ["#f0f9e8", "#bae4bc", "#7bccc4", "#43a2ca", "#0868ac", "#084081"],
        source: "Global Wind Atlas", plantLabel: "eólicas",
      };
    case "hidroelectrica":
      return {
        data: PRECIPITACION_POR_ESTADO, colorFn: hydroColor, borderColor: "#08306b",
        label: "Precipitación media", unit: "mm/año", fallback: 700,
        markerColor: "#1e90ff", legendMin: "200", legendMax: "2500+",
        legendTitle: "Precipitación Media Anual (mm) — Potencial Hídrico",
        colors: ["#f7fbff", "#c6dbef", "#6baed6", "#2171b5", "#08519c", "#08306b"],
        source: "CONAGUA / SMN", plantLabel: "hidroeléctricas",
      };
    case "termica":
      return {
        data: TERMICA_POR_ESTADO, colorFn: thermalColor, borderColor: "#7f2704",
        label: "Cap. térmica instalada", unit: "MW", fallback: 500,
        markerColor: "#ff6600", legendMin: "200", legendMax: "8500+",
        legendTitle: "Capacidad Térmica Instalada (MW referencial)",
        colors: ["#fff5eb", "#fdd49e", "#fdbb84", "#e6550d", "#a63603", "#7f2704"],
        source: "SENER / CRE / CFEnergía", plantLabel: "térmicas",
      };
    case "geotermica":
      return {
        data: GEOTERMICA_POR_ESTADO, colorFn: geothermalColor, borderColor: "#5c2d05",
        label: "Potencial geotérmico", unit: "MW est.", fallback: 5,
        markerColor: "#8b4513", legendMin: "2", legendMax: "720+",
        legendTitle: "Potencial Geotérmico Estimado (MW)",
        colors: ["#f7fcf5", "#c7e9c0", "#74c476", "#b5651d", "#8b4513", "#5c2d05"],
        source: "SENER / CeMIE-Geo", plantLabel: "geotérmicas",
      };
  }
}

interface SolarWindLeafletMapProps {
  plantas: PlantaEnergia[];
  modo: MapMode;
  altura?: string;
}

export function SolarWindLeafletMap({ plantas, modo, altura = "500px" }: SolarWindLeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const plantasValidas = useMemo(
    () => plantas.filter((p) => p.lat != null && p.lon != null),
    [plantas]
  );

  // Init Leaflet map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = L.map(mapContainer.current, {
      center: [23.8, -102.5],
      zoom: 5,
      maxBounds: [[12, -120], [34, -85]],
      zoomControl: true,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 10,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update choropleth + plant markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    if (markersRef.current) { map.removeLayer(markersRef.current); markersRef.current = null; }

    const cfg = getModeConfig(modo);

    fetch("/mexico-states.geojson")
      .then((r) => r.json())
      .then((geojson) => {
        const layer = L.geoJSON(geojson, {
          style: (feature) => {
            const name = feature?.properties?.name || feature?.properties?.ESTADO || feature?.properties?.NOM_ENT || "";
            const val = getVal(name, cfg.data, cfg.fallback);
            return {
              fillColor: cfg.colorFn(val),
              fillOpacity: 0.75,
              weight: 1,
              color: cfg.borderColor,
              opacity: 0.6,
            };
          },
          onEachFeature: (feature, layer) => {
            const name = feature?.properties?.name || feature?.properties?.ESTADO || feature?.properties?.NOM_ENT || "Desconocido";
            const val = getVal(name, cfg.data, cfg.fallback);
            layer.bindPopup(`
              <div style="font-family:sans-serif;font-size:12px;line-height:1.5">
                <strong style="font-size:13px">${name}</strong><br/>
                <span style="color:#666">${cfg.label}:</span> <strong>${val.toLocaleString()} ${cfg.unit}</strong>
              </div>
            `);
            layer.on("mouseover", (e: any) => e.target.setStyle({ fillOpacity: 0.9, weight: 2 }));
            layer.on("mouseout", (e: any) => e.target.setStyle({ fillOpacity: 0.75, weight: 1 }));
          },
        }).addTo(map);
        layerRef.current = layer;

        // Add plant markers on top
        if (plantasValidas.length > 0) {
          const markerColor = cfg.markerColor;
          const group = L.layerGroup();
          for (const p of plantasValidas) {
            const radius = Math.max(4, Math.min(16, Math.sqrt((p.potencia_mw || 0) / 10) * 3));
            const marker = L.circleMarker([p.lat!, p.lon!], {
              radius,
              fillColor: markerColor,
              fillOpacity: 0.85,
              color: "#ffffff",
              weight: 1.5,
            });
            marker.bindPopup(`
              <div style="font-family:sans-serif;font-size:12px;line-height:1.5">
                <strong>${p.nombre_planta}</strong><br/>
                <span style="color:#666">Potencia:</span> <strong>${(p.potencia_mw || 0).toLocaleString()} MW</strong><br/>
                <span style="color:#666">Estado:</span> ${p.estado}<br/>
                <span style="color:#666">Dueño:</span> ${p.dueno || "N/D"}<br/>
                <span style="color:#666">Fuente:</span> ${p.fuente_origen === "csv_usuario" ? "GeoComunes.ORG" : p.fuente_origen}
              </div>
            `);
            group.addLayer(marker);
          }
          group.addTo(map);
          markersRef.current = group;
        }
      })
      .catch(console.error);
  }, [modo, plantasValidas]);

  const cfg = getModeConfig(modo);

  return (
    <div className="relative rounded-md border overflow-hidden" style={{ height: altura }}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-md border px-3 py-2 text-[10px] shadow space-y-1 z-[1000]">
        <p className="font-semibold text-xs">{cfg.legendTitle}</p>
        <div className="flex items-center gap-0.5">
          <span>{cfg.legendMin}</span>
          <div className="flex">
            {cfg.colors.map((c) => (
              <div key={c} className="w-5 h-3" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>{cfg.legendMax}</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t">
          <div
            className="w-3 h-3 rounded-full shrink-0 border-2 border-white"
            style={{ backgroundColor: cfg.markerColor }}
          />
          <span>Plantas {cfg.plantLabel} (tamaño = MW)</span>
        </div>
        <p className="text-muted-foreground">Fuente: {cfg.source}</p>
      </div>
      <div className="absolute top-2 left-2 bg-card/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-muted-foreground z-[1000]">
        {plantasValidas.length} plantas {cfg.plantLabel} con coordenadas
      </div>
    </div>
  );
}
