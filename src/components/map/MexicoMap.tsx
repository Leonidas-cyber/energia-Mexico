/**
 * Componente de mapa interactivo de México usando MapLibre GL JS.
 * Soporta: puntos de plantas, clustering, coropletas, y capas GeoJSON.
 */
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PlantaEnergia, EnergiaCategoria } from "@/types/energy";

// Normalizar nombres de estados para matching GeoJSON ↔ CSV
function normalizarEstado(nombre: string): string {
  return (nombre || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/\s+/g, " ")
    .trim();
}

// Mapping de nombres cortos para estados con nombre oficial largo
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

function matchEstado(geoName: string, csvName: string): boolean {
  const a = normalizarEstado(geoName);
  const b = normalizarEstado(csvName);
  if (a === b) return true;
  if (a.startsWith(b) || b.startsWith(a)) return true;
  const aliases = ESTADO_ALIASES[a];
  if (aliases && aliases.some(al => al === b || b.startsWith(al) || al.startsWith(b))) return true;
  return false;
}

// Colores por categoría de energía (HSL → hex para MapLibre)
const COLORES_ENERGIA: Record<EnergiaCategoria, string> = {
  solar: "#e6b800",
  eolica: "#3399cc",
  hidroelectrica: "#2d7ab3",
  termica: "#e65c00",
  nuclear: "#8844bb",
  geotermica: "#b36b2d",
  bioenergia: "#4da64d",
  otras: "#7a8a99",
};

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

// Average wind speed (m/s at 100m) by Mexican state — source: Global Wind Atlas
const VIENTO_POR_ESTADO: Record<string, number> = {
  "Oaxaca": 8.5, "Tamaulipas": 7.8, "Baja California": 7.2, "Baja California Sur": 6.8,
  "Coahuila de Zaragoza": 7.0, "Coahuila": 7.0, "Nuevo León": 6.8,
  "Zacatecas": 6.5, "Chihuahua": 6.3, "Sonora": 6.0, "Durango": 5.8,
  "San Luis Potosí": 5.9, "Puebla": 5.7, "Veracruz": 5.5,
  "Veracruz de Ignacio de la Llave": 5.5, "Hidalgo": 5.3,
  "Tlaxcala": 5.4, "Querétaro": 5.2, "Guanajuato": 5.0,
  "Jalisco": 5.1, "Aguascalientes": 5.3, "Sinaloa": 4.8,
  "Nayarit": 4.5, "Colima": 4.6, "Michoacán": 4.7, "Michoacán de Ocampo": 4.7,
  "Guerrero": 4.8, "México": 4.3, "Estado de México": 4.3,
  "Ciudad de México": 3.8, "Distrito Federal": 3.8,
  "Morelos": 4.0, "Tabasco": 4.2, "Campeche": 5.0,
  "Yucatán": 5.8, "Quintana Roo": 5.5, "Chiapas": 4.5,
};

function getGHI(geoName: string): number {
  if (GHI_POR_ESTADO[geoName]) return GHI_POR_ESTADO[geoName];
  const norm = normalizarEstado(geoName);
  for (const [key, val] of Object.entries(GHI_POR_ESTADO)) {
    const normKey = normalizarEstado(key);
    if (normKey === norm || norm.startsWith(normKey) || normKey.startsWith(norm)) return val;
  }
  return 4.5;
}

function getViento(geoName: string): number {
  if (VIENTO_POR_ESTADO[geoName]) return VIENTO_POR_ESTADO[geoName];
  const norm = normalizarEstado(geoName);
  for (const [key, val] of Object.entries(VIENTO_POR_ESTADO)) {
    const normKey = normalizarEstado(key);
    if (normKey === norm || norm.startsWith(normKey) || normKey.startsWith(norm)) return val;
  }
  return 4.5;
}

interface MexicoMapProps {
  plantas: PlantaEnergia[];
  modo?: "puntos" | "coropleta-mw" | "coropleta-count" | "solar" | "eolica";
  altura?: string;
  onPlantaClick?: (planta: PlantaEnergia) => void;
}

export function MexicoMap({ plantas, modo = "puntos", altura = "500px", onPlantaClick }: MexicoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Plantas con coordenadas válidas
  const plantasValidas = useMemo(
    () => plantas.filter((p) => p.lat != null && p.lon != null),
    [plantas]
  );

  // GeoJSON de plantas
  const plantasGeoJSON = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: plantasValidas.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [p.lon!, p.lat!],
      },
      properties: {
        id: p.id,
        nombre: p.nombre_planta,
        categoria: p.energia_categoria,
        subcategoria: p.energia_subcategoria,
        mw: p.potencia_mw || 0,
        sector: p.sector,
        dueno: p.dueno || "N/D",
        operador: p.operador || "N/D",
        estado: p.estado,
        fuente: p.fuente_origen === "csv_usuario" ? "GeoComunes.ORG" : p.fuente_origen,
        color: COLORES_ENERGIA[p.energia_categoria] || COLORES_ENERGIA.otras,
      },
    })),
  }), [plantasValidas]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      canvasContextAttributes: { preserveDrawingBuffer: true },
      style: {
        version: 8 as const,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [-102.5, 23.8],
      zoom: 4.5,
      maxBounds: [[-120, 12], [-85, 34]],
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // Agregar capas cuando el mapa está listo
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    let cancelled = false;

    // Limpiar capas anteriores
    ["states-fill", "states-outline", "clusters", "cluster-count", "unclustered-point", "plant-labels"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource("estados")) map.removeSource("estados");
    if (map.getSource("plantas")) map.removeSource("plantas");

    const addPointLayers = () => {
      if (modo !== "puntos" || plantasGeoJSON.features.length === 0) return;

      map.addSource("plantas", {
        type: "geojson",
        data: plantasGeoJSON as any,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters", type: "circle", source: "plantas",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#3399cc", 10, "#e6b800", 50, "#e65c00"],
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 50, 32],
          "circle-stroke-width": 2, "circle-stroke-color": "#ffffff", "circle-opacity": 0.85,
        },
      });

      map.addLayer({
        id: "cluster-count", type: "symbol", source: "plantas",
        filter: ["has", "point_count"],
        layout: { "text-field": "{point_count_abbreviated}", "text-font": ["Open Sans Bold"], "text-size": 13 },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered-point", type: "circle", source: "plantas",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["interpolate", ["linear"], ["get", "mw"], 0, 5, 100, 8, 500, 12, 1000, 16, 3000, 22],
          "circle-stroke-width": 1.5, "circle-stroke-color": "#ffffff", "circle-opacity": 0.9,
        },
      });

      const handleUnclusteredClick = (e: any) => {
        const props = e.features?.[0]?.properties;
        if (!props) return;
        const coords = (e.features![0].geometry as any).coordinates.slice();
        new maplibregl.Popup({ closeButton: true, maxWidth: "320px" })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:sans-serif;font-size:12px;line-height:1.5">
              <strong style="font-size:13px">${props.nombre}</strong><br/>
              <span style="color:#666">Energía:</span> ${props.categoria} (${props.subcategoria})<br/>
              <span style="color:#666">Potencia:</span> <strong>${Number(props.mw).toLocaleString()} MW</strong><br/>
              <span style="color:#666">Sector:</span> ${props.sector}<br/>
              <span style="color:#666">Dueño:</span> ${props.dueno}<br/>
              <span style="color:#666">Estado:</span> ${props.estado}<br/>
              <span style="color:#666">Fuente:</span> ${props.fuente}
            </div>
          `)
          .addTo(map);
        if (onPlantaClick) {
          const planta = plantas.find((p) => p.id === props.id);
          if (planta) onPlantaClick(planta);
        }
      };

      const handleClusterClick = (e: any) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;

        const source = map.getSource("plantas") as any;
        const clusterFeature = features[0] as any;
        const clusterId = clusterFeature?.properties?.cluster_id;
        const pointCount = Number(clusterFeature?.properties?.point_count ?? 0);
        const clusterCenter = (clusterFeature.geometry as any).coordinates;

        if (!source || clusterId == null) return;

        // Si el clúster ya tiene 2 (o menos) centrales, mostrar ambas.
        if (pointCount <= 2) {
          source.getClusterLeaves(clusterId, 2, 0, (err: any, leaves: any[]) => {
            if (err || !Array.isArray(leaves) || leaves.length === 0) return;

            const body = leaves.slice(0, 2).map((leaf: any, idx: number) => {
              const p = leaf?.properties || {};
              return `
                <div style="padding:${idx > 0 ? "8px 0 0" : "0"}">
                  <strong style="font-size:12px">${p.nombre ?? "Central"}</strong><br/>
                  <span style="color:#666">Energía:</span> ${p.categoria ?? "N/D"} (${p.subcategoria ?? "N/D"})<br/>
                  <span style="color:#666">Potencia:</span> <strong>${Number(p.mw ?? 0).toLocaleString()} MW</strong><br/>
                  <span style="color:#666">Sector:</span> ${p.sector ?? "N/D"}<br/>
                  <span style="color:#666">Dueño:</span> ${p.dueno ?? "N/D"}<br/>
                  <span style="color:#666">Estado:</span> ${p.estado ?? "N/D"}
                </div>
              `;
            }).join('<hr style="margin:8px 0; border:none; border-top:1px solid #eee"/>');

            new maplibregl.Popup({ closeButton: true, maxWidth: "360px" })
              .setLngLat(clusterCenter)
              .setHTML(`
                <div style="font-family:sans-serif;font-size:12px;line-height:1.45">
                  <strong style="font-size:13px">${leaves.length === 1 ? "Central" : "2 centrales"}</strong><br/>
                  ${body}
                </div>
              `)
              .addTo(map);

            // Enfocar para ver claramente ambas centrales.
            if (leaves.length === 2) {
              const c1 = (leaves[0].geometry as any).coordinates;
              const c2 = (leaves[1].geometry as any).coordinates;
              const bounds = new maplibregl.LngLatBounds(c1, c1);
              bounds.extend(c2);
              map.fitBounds(bounds, { padding: 90, maxZoom: 14.5, duration: 700 });
            } else {
              map.easeTo({ center: (leaves[0].geometry as any).coordinates, zoom: 14.5, duration: 700 });
            }
          });
          return;
        }

        // Zoom de expansión + extra para acercarse más rápido a centrales.
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (!err) {
            map.easeTo({ center: clusterCenter, zoom: Math.min(zoom + 1.2, 15), duration: 650 });
          }
        });
      };

      const handleMouseEnter = () => { map.getCanvas().style.cursor = "pointer"; };
      const handleMouseLeave = () => { map.getCanvas().style.cursor = ""; };

      map.on("click", "unclustered-point", handleUnclusteredClick);
      map.on("click", "clusters", handleClusterClick);
      map.on("mouseenter", "unclustered-point", handleMouseEnter);
      map.on("mouseleave", "unclustered-point", handleMouseLeave);
      map.on("mouseenter", "clusters", handleMouseEnter);
      map.on("mouseleave", "clusters", handleMouseLeave);

      // Evita listeners duplicados al cambiar filtros/categorías.
      return () => {
        map.off("click", "unclustered-point", handleUnclusteredClick);
        map.off("click", "clusters", handleClusterClick);
        map.off("mouseenter", "unclustered-point", handleMouseEnter);
        map.off("mouseleave", "unclustered-point", handleMouseLeave);
        map.off("mouseenter", "clusters", handleMouseEnter);
        map.off("mouseleave", "clusters", handleMouseLeave);
      };
    };

    const cleanupPointLayers = addPointLayers();

    return () => {
      cancelled = true;
      if (typeof cleanupPointLayers === "function") cleanupPointLayers();
    };
  }, [mapLoaded, plantasGeoJSON, modo, plantas, onPlantaClick]);

  return (
    <div className="relative rounded-md border overflow-hidden" style={{ height: altura }}>
      <div ref={mapContainer} className="w-full h-full" />
      {/* Leyenda */}
      {modo === "puntos" && (
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-md border px-3 py-2 text-[10px] space-y-0.5 shadow">
          <p className="font-semibold text-xs mb-1">Tipo de Energía</p>
          {Object.entries(COLORES_ENERGIA).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="capitalize">{key === "eolica" ? "Eólica" : key === "hidroelectrica" ? "Hidro" : key === "geotermica" ? "Geotérmica" : key === "bioenergia" ? "Bioenergía" : key}</span>
            </div>
          ))}
          <p className="text-muted-foreground mt-1 pt-1 border-t">Tamaño = potencia (MW)</p>
        </div>
      )}
      {modo !== "puntos" && (
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-md border px-3 py-2 text-[10px] shadow">
          <p className="font-semibold text-xs mb-1">{modo === "coropleta-mw" ? "MW por Estado" : "Plantas por Estado"}</p>
          <div className="flex items-center gap-0.5">
            <span>Bajo</span>
            <div className="flex">
              {["#e8f4e8", "#a8d5ba", "#5fa87d", "#2d7a53", "#0a4d2e"].map((c) => (
                <div key={c} className="w-5 h-3" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span>Alto</span>
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2 bg-card/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-muted-foreground">
        {plantasValidas.length} plantas con coordenadas de {plantas.length} total
      </div>
    </div>
  );
}
