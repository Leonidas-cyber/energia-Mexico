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

interface MexicoMapProps {
  plantas: PlantaEnergia[];
  modo?: "puntos" | "coropleta-mw" | "coropleta-count";
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
        version: 8,
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

    // Limpiar capas anteriores
    ["clusters", "cluster-count", "unclustered-point", "plant-labels"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource("plantas")) map.removeSource("plantas");

    if (modo === "puntos" && plantasGeoJSON.features.length > 0) {
      map.addSource("plantas", {
        type: "geojson",
        data: plantasGeoJSON as any,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      // Clusters
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "plantas",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#3399cc",
            10, "#e6b800",
            50, "#e65c00",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            10, 24,
            50, 32,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.85,
        },
      });

      // Cluster count
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "plantas",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Individual points
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "plantas",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "mw"],
            0, 5,
            100, 8,
            500, 12,
            1000, 16,
            3000, 22,
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9,
        },
      });

      // Popup on click
      map.on("click", "unclustered-point", (e) => {
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
      });

      // Zoom on cluster click
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        (map.getSource("plantas") as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (!err) {
            map.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom,
            });
          }
        });
      });

      // Cursor
      map.on("mouseenter", "unclustered-point", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "unclustered-point", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
    }
  }, [mapLoaded, plantasGeoJSON, modo, plantas, onPlantaClick]);

  // Cargar coropleta
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || modo === "puntos") return;

    // Cargar GeoJSON de estados
    fetch("/mexico-states.geojson")
      .then((r) => r.json())
      .then((geojson) => {
        // Calcular valores por estado
        const estadoData = new Map<string, { mw: number; count: number; publica: number; privada: number }>();
        for (const p of plantas) {
          if (p.estado) {
            const d = estadoData.get(p.estado) || { mw: 0, count: 0, publica: 0, privada: 0 };
            d.mw += p.potencia_mw || 0;
            d.count += 1;
            if (p.sector === "publica") d.publica += 1;
            if (p.sector === "privada") d.privada += 1;
            estadoData.set(p.estado, d);
          }
        }

        // Enriquecer features con datos (fuzzy match de nombres)
        const enriched = {
          ...geojson,
          features: geojson.features.map((f: any) => {
            const geoNombre = f.properties?.name || f.properties?.ESTADO || f.properties?.NOM_ENT || f.properties?.state_name || "";
            let data = { mw: 0, count: 0, publica: 0, privada: 0 };
            for (const [csvEstado, csvData] of estadoData.entries()) {
              if (matchEstado(geoNombre, csvEstado)) {
                data = csvData;
                break;
              }
            }
            return {
              ...f,
              properties: {
                ...f.properties,
                mw_total: Math.round(data.mw),
                plant_count: data.count,
                publica: data.publica,
                privada: data.privada,
              },
            };
          }),
        };

        // Remove existing layers
        ["states-fill", "states-outline", "states-label"].forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        if (map.getSource("estados")) map.removeSource("estados");

        map.addSource("estados", { type: "geojson", data: enriched });

        const metric = modo === "coropleta-mw" ? "mw_total" : "plant_count";
        const maxVal = Math.max(...Array.from(estadoData.values()).map((d) => modo === "coropleta-mw" ? d.mw : d.count), 1);

        map.addLayer({
          id: "states-fill",
          type: "fill",
          source: "estados",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", metric],
              0, "#e8f4e8",
              maxVal * 0.2, "#a8d5ba",
              maxVal * 0.4, "#5fa87d",
              maxVal * 0.7, "#2d7a53",
              maxVal, "#0a4d2e",
            ],
            "fill-opacity": 0.7,
          },
        }, map.getLayer("unclustered-point") ? "unclustered-point" : undefined);

        map.addLayer({
          id: "states-outline",
          type: "line",
          source: "estados",
          paint: {
            "line-color": "#1a5632",
            "line-width": 1,
            "line-opacity": 0.6,
          },
        });

        // Popup on click
        map.on("click", "states-fill", (e) => {
          const props = e.features?.[0]?.properties;
          if (!props) return;
          const nombre = props.name || props.ESTADO || props.NOM_ENT || props.state_name || "Desconocido";
          new maplibregl.Popup({ closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family:sans-serif;font-size:12px;line-height:1.5">
                <strong style="font-size:13px">${nombre}</strong><br/>
                <span style="color:#666">Potencia:</span> <strong>${Number(props.mw_total || 0).toLocaleString()} MW</strong><br/>
                <span style="color:#666">Plantas:</span> ${props.plant_count || 0}<br/>
                <span style="color:#666">Pública:</span> ${props.publica || 0} | <span style="color:#666">Privada:</span> ${props.privada || 0}
              </div>
            `)
            .addTo(map);
        });

        map.on("mouseenter", "states-fill", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "states-fill", () => { map.getCanvas().style.cursor = ""; });
      })
      .catch(console.error);
  }, [mapLoaded, modo, plantas]);

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
