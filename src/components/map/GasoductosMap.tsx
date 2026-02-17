/**
 * Mapa dedicado de la Red de Gasoductos de México usando Leaflet.
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function GasoductosMap({ altura = "550px" }: { altura?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [stats, setStats] = useState({ total: 0, kmTotal: 0, cenagas: 0, privado: 0 });
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const layersRef = useRef<{ cenagas: L.GeoJSON | null; privado: L.GeoJSON | null }>({ cenagas: null, privado: null });

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

    fetch("/data/gasoductos.geojson")
      .then((r) => r.json())
      .then((geojson) => {
        const features = geojson.features as any[];
        setStats({
          total: features.length,
          kmTotal: features.reduce((s: number, f: any) => s + (f.properties.longitud_km || 0), 0),
          cenagas: features.filter((f: any) => f.properties.tipo === "CENAGAS").length,
          privado: features.filter((f: any) => f.properties.tipo === "Privado CFE").length,
        });

        const popupContent = (props: any) => `
          <div style="font-family:sans-serif;font-size:12px;line-height:1.6">
            <strong style="font-size:13px">${props.nombre}</strong><br/>
            <span style="color:#666">Tipo:</span> ${props.tipo}<br/>
            <span style="color:#666">Longitud:</span> <strong>${Number(props.longitud_km).toLocaleString()} km</strong><br/>
            <span style="color:#666">Diámetro:</span> ${props.diametro_pulg}"<br/>
            <span style="color:#666">Estado:</span> ${props.estado}
          </div>`;

        const cenagasLayer = L.geoJSON(geojson, {
          filter: (f) => f.properties.tipo === "CENAGAS",
          style: (f) => ({
            color: "#e63c2c",
            weight: 4,
            opacity: 0.9,
            dashArray: f?.properties.estado === "Operando" ? undefined : "8 4",
          }),
          onEachFeature: (f, layer) => layer.bindPopup(popupContent(f.properties)),
        }).addTo(map);

        const privadoLayer = L.geoJSON(geojson, {
          filter: (f) => f.properties.tipo === "Privado CFE",
          style: (f) => ({
            color: "#2dbd6e",
            weight: 4,
            opacity: 0.9,
            dashArray: f?.properties.estado === "Operando" ? undefined : "8 4",
          }),
          onEachFeature: (f, layer) => layer.bindPopup(popupContent(f.properties)),
        }).addTo(map);

        layersRef.current = { cenagas: cenagasLayer, privado: privadoLayer };
      })
      .catch(console.error);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Filter visibility
  useEffect(() => {
    const map = mapRef.current;
    const { cenagas, privado } = layersRef.current;
    if (!map || !cenagas || !privado) return;

    if (filtroTipo === "todos") {
      if (!map.hasLayer(cenagas)) map.addLayer(cenagas);
      if (!map.hasLayer(privado)) map.addLayer(privado);
    } else if (filtroTipo === "CENAGAS") {
      if (!map.hasLayer(cenagas)) map.addLayer(cenagas);
      if (map.hasLayer(privado)) map.removeLayer(privado);
    } else {
      if (map.hasLayer(cenagas)) map.removeLayer(cenagas);
      if (!map.hasLayer(privado)) map.addLayer(privado);
    }
  }, [filtroTipo]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-muted/50 rounded-md p-2 text-center">
          <p className="text-lg font-bold text-foreground">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Gasoductos</p>
        </div>
        <div className="bg-muted/50 rounded-md p-2 text-center">
          <p className="text-lg font-bold text-foreground">{stats.kmTotal.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">km totales</p>
        </div>
        <div className="bg-muted/50 rounded-md p-2 text-center">
          <p className="text-lg font-bold" style={{ color: "#e63c2c" }}>{stats.cenagas}</p>
          <p className="text-[10px] text-muted-foreground">CENAGAS</p>
        </div>
        <div className="bg-muted/50 rounded-md p-2 text-center">
          <p className="text-lg font-bold" style={{ color: "#2dbd6e" }}>{stats.privado}</p>
          <p className="text-[10px] text-muted-foreground">Privados / CFE</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["todos", "CENAGAS", "Privado CFE"].map((t) => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              filtroTipo === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-accent"
            }`}
          >
            {t === "todos" ? "Todos" : t}
          </button>
        ))}
      </div>

      <div className="relative rounded-md border overflow-hidden" style={{ height: altura }}>
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-md border px-3 py-2 text-[10px] space-y-1 shadow z-[1000]">
          <p className="font-semibold text-xs mb-1">Red de Gasoductos</p>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded" style={{ backgroundColor: "#e63c2c" }} />
            <span>CENAGAS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded" style={{ backgroundColor: "#2dbd6e" }} />
            <span>Privados / CFE</span>
          </div>
          <p className="text-muted-foreground mt-1 pt-1 border-t">Fuente: CFE 2019, SENER 2018</p>
        </div>
      </div>
    </div>
  );
}
