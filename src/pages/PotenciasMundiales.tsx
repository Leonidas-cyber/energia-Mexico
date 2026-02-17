import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Globe, TrendingUp, AlertTriangle, Lightbulb, MapPin, Building2, Zap, Database } from "lucide-react";
import { useEnergy } from "@/contexts/EnergyContext";
import { SolarWindLeafletMap } from "@/components/map/SolarWindLeafletMap";
import { MexicoMap } from "@/components/map/MexicoMap";
import { POTENCIAS_DATA, COUNTRY_COORDS } from "@/data/potenciasMundiales";
import type { PaisPotencia, PlantaGrande, MexicoComparacion } from "@/data/potenciasMundiales";
import { useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { EnergiaCategoria } from "@/types/energy";

const ENERGY_COLORS: Record<string, string> = {
  solar: "#f59e0b", eolica: "#0ea5e9", hidroelectrica: "#3b82f6",
  termica: "#ef4444", nuclear: "#8b5cf6", geotermica: "#10b981",
  bioenergia: "#84cc16", otras: "#6b7280",
  carboelectrica: "#374151", petroleo: "#92400e", gas_natural: "#ea580c",
  hidrogeno_verde: "#059669",
};

const CHOROPLETH_MODES = ["solar", "eolica", "hidroelectrica", "termica", "geotermica"];

/* ── World Map with resource overlay + plants ── */
function WorldPowersMap({ top5, mexico, color, tipo, recursoLegend }: {
  top5: PaisPotencia[];
  mexico: MexicoComparacion;
  color: string;
  tipo: string;
  recursoLegend?: { label: string; colors: string[]; min: string; max: string };
}) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: [25, 10], zoom: 2, minZoom: 2, maxZoom: 6, scrollWheelZoom: false,
    });

    // Base tile
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OSM &copy; CARTO',
    }).addTo(map);

    // Resource overlay for solar
    if (tipo === "solar") {
      L.tileLayer.wms("https://api.globalsolaratlas.info/map", {
        layers: "GHI",
        format: "image/png",
        transparent: true,
        opacity: 0.45,
        attribution: "&copy; Global Solar Atlas",
      } as any).addTo(map);
    }

    const maxCap = Math.max(...top5.map(p => p.capacidadGW), mexico.capacidadGW);

    // Country bubbles + largest plants
    top5.forEach((p, i) => {
      const coords = COUNTRY_COORDS[p.codigo];
      if (!coords) return;
      const radius = Math.max(12, Math.sqrt(p.capacidadGW / maxCap) * 45);

      // Country bubble
      L.circleMarker([coords[1], coords[0]], {
        radius, fillColor: color, fillOpacity: 0.6, color: "#fff", weight: 2,
      }).bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.6">
          <strong>#${i + 1} ${p.pais}</strong><br/>
          Capacidad: <strong>${p.capacidadGW.toLocaleString()} GW</strong><br/>
          % mundial: ${p.porcentajeMundial}%
        </div>
      `).addTo(map);

      // Label
      L.marker([coords[1], coords[0]], {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:${color};color:#fff;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3)">#${i + 1} ${p.pais}</div>`,
          iconAnchor: [0, -radius - 4],
        }),
      }).addTo(map);

      // Largest plant marker (star)
      const pl = p.plantaMasGrande;
      if (pl.capacidadMW > 0) {
        L.marker([pl.coords[1], pl.coords[0]], {
          icon: L.divIcon({
            className: "",
            html: `<div style="font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))">⭐</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        }).bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;line-height:1.6">
            <strong>🏭 ${pl.nombre}</strong><br/>
            Capacidad: <strong>${pl.capacidadMW.toLocaleString()} MW</strong><br/>
            Ubicación: ${pl.ubicacion}
          </div>
        `).addTo(map);
      }
    });

    // Mexico bubble
    const mxCoords = COUNTRY_COORDS.MX;
    const mxRadius = Math.max(10, Math.sqrt(mexico.capacidadGW / maxCap) * 45);
    L.circleMarker([mxCoords[1], mxCoords[0]], {
      radius: mxRadius, fillColor: "#16a34a", fillOpacity: 0.8, color: "#fff", weight: 2,
    }).bindPopup(`
      <div style="font-family:sans-serif;font-size:12px;line-height:1.6">
        <strong>🇲🇽 México</strong><br/>
        Capacidad: <strong>${mexico.capacidadGW.toLocaleString()} GW</strong>
      </div>
    `).addTo(map);

    L.marker([mxCoords[1], mxCoords[0]], {
      icon: L.divIcon({
        className: "",
        html: `<div style="background:#16a34a;color:#fff;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3)">🇲🇽 México</div>`,
        iconAnchor: [0, -mxRadius - 4],
      }),
    }).addTo(map);

    // Mexico largest plant
    const mxPl = mexico.plantaMasGrande;
    if (mxPl.capacidadMW > 0) {
      L.marker([mxPl.coords[1], mxPl.coords[0]], {
        icon: L.divIcon({
          className: "",
          html: `<div style="font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))">🇲🇽</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.6">
          <strong>🏭 ${mxPl.nombre}</strong><br/>
          Capacidad: <strong>${mxPl.capacidadMW.toLocaleString()} MW</strong><br/>
          Ubicación: ${mxPl.ubicacion}
        </div>
      `).addTo(map);
    }

    return () => { map.remove(); };
  }, [top5, mexico, color, tipo]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full rounded-md border" style={{ height: "420px" }} />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-md border px-3 py-2 text-[10px] shadow space-y-1 z-[1000]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-white" style={{ background: color }} />
          <span>País (tamaño = capacidad)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          <span>México</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>⭐</span>
          <span>Planta más grande</span>
        </div>
        {recursoLegend && (
          <div className="pt-1 border-t space-y-0.5">
            <p className="font-semibold">{recursoLegend.label}</p>
            <div className="flex items-center gap-0.5">
              <span>{recursoLegend.min}</span>
              <div className="flex">
                {recursoLegend.colors.map((c) => (
                  <div key={c} className="w-4 h-2.5" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>{recursoLegend.max}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Largest Plant Card ── */
function PlantaCard({ planta, pais, color }: { planta: PlantaGrande; pais: string; color: string }) {
  if (planta.capacidadMW <= 0) return null;
  return (
    <div className="flex items-start gap-2 bg-muted/50 rounded-md p-2">
      <Building2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color }} />
      <div className="text-xs space-y-0.5">
        <p className="font-semibold">{planta.nombre}</p>
        <p className="text-muted-foreground">{planta.ubicacion} · <span className="font-mono font-medium">{planta.capacidadMW.toLocaleString()} MW</span></p>
      </div>
    </div>
  );
}

/* ── Page ── */
const PotenciasMundiales = () => {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();
  const { plantasRaw } = useEnergy();

  const data = POTENCIAS_DATA[tipo || ""];
  const color = ENERGY_COLORS[tipo || ""] || "#6b7280";

  const plantasFiltradas = useMemo(() => {
    if (tipo === "gas_natural") {
      return plantasRaw.filter((p) => p.energia_categoria === "termica" && p.energia_subcategoria.toLowerCase().includes("gas natural"));
    }
    if (tipo === "carboelectrica") {
      return plantasRaw.filter((p) => p.energia_categoria === "termica" && p.energia_subcategoria.toLowerCase().includes("carbón"));
    }
    if (tipo === "petroleo") {
      return plantasRaw.filter((p) => p.energia_categoria === "termica" && (p.energia_subcategoria.toLowerCase().includes("petróleo") || p.energia_subcategoria.toLowerCase().includes("diésel") || p.energia_subcategoria.toLowerCase().includes("fuel")));
    }
    return plantasRaw.filter((p) => p.energia_categoria === (tipo as EnergiaCategoria));
  }, [plantasRaw, tipo]);

  const hasChoropleth = CHOROPLETH_MODES.includes(tipo || "");

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">Categoría no encontrada.</p>
          <Button variant="ghost" onClick={() => navigate("/")} className="mt-4">Volver</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/?tab=potencias")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver al tablero
        </Button>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" style={{ color }} />
            {data.titulo}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{data.subtitulo}</p>
          <p className="text-xs text-muted-foreground">
            Capacidad mundial total: <strong>{data.totalMundialGW.toLocaleString()} {data.unidad}</strong>
          </p>
        </div>

        {/* Top 5 List */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top 5 Potencias Mundiales
          </h2>
          <div className="grid gap-3">
            {data.top5.map((p, i) => (
              <Card key={p.codigo} className="overflow-hidden">
                <div className="flex">
                  <div className="flex items-center justify-center px-4 text-white font-bold text-xl min-w-[56px]" style={{ background: color }}>
                    #{i + 1}
                  </div>
                  <CardContent className="flex-1 p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-semibold text-base">{p.pais}</h3>
                      <div className="flex gap-2 items-center">
                        <Badge variant="secondary" className="font-mono">
                          {p.capacidadGW.toLocaleString()} {data.unidad}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {p.porcentajeMundial}% mundial
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{p.descripcion}</p>
                    <p className="text-xs flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      <span className="font-medium">{p.dato_clave}</span>
                    </p>
                    {/* Largest plant */}
                    <PlantaCard planta={p.plantaMasGrande} pais={p.pais} color={color} />
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* World Map */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" style={{ color }} />
            Mapa Mundial — Potencias y Plantas Más Grandes
          </h2>
          <p className="text-xs text-muted-foreground">
            Burbujas proporcionales a la capacidad instalada. ⭐ indica la planta más grande de cada país.
            {tipo === "solar" && " Capa de irradiación solar GHI superpuesta."}
          </p>
          <WorldPowersMap
            top5={data.top5}
            mexico={data.mexico}
            color={color}
            tipo={tipo || ""}
            recursoLegend={data.recursoLegend}
          />
        </section>

        {/* Mexico Choropleth Map */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Potencial y Plantas en México
          </h2>
          <p className="text-sm text-muted-foreground">
            {plantasFiltradas.length} plantas de {data.titulo.toLowerCase()} encontradas
          </p>
          {hasChoropleth ? (
            <SolarWindLeafletMap key={tipo} plantas={plantasFiltradas} modo={tipo as any} altura="500px" />
          ) : (
            <MexicoMap key={tipo} plantas={plantasFiltradas} modo="puntos" altura="500px" />
          )}
          {/* Mexico largest plant highlight */}
          {data.mexico.plantaMasGrande.capacidadMW > 0 && (
            <Card className="border-green-500/30">
              <CardContent className="p-4 flex items-center gap-3">
                <Zap className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">🇲🇽 Planta más grande de México: {data.mexico.plantaMasGrande.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.mexico.plantaMasGrande.ubicacion} · <span className="font-mono font-medium">{data.mexico.plantaMasGrande.capacidadMW.toLocaleString()} MW</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Reserves Section */}
        {data.reservas && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" style={{ color }} />
              {data.reservas.titulo}
            </h2>
            <div className="grid gap-2">
              {data.reservas.top5.map((r, i) => {
                const maxVal = parseFloat(data.reservas!.top5[0].cantidad.replace(/[^0-9.]/g, "")) || 1;
                const thisVal = parseFloat(r.cantidad.replace(/[^0-9.]/g, "")) || 0;
                const pct = Math.min((thisVal / maxVal) * 100, 100);
                return (
                  <div key={r.codigo + i} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">#{i + 1} {r.pais}</span>
                      <span className="font-mono">
                        {r.cantidad} {data.reservas!.unidad}
                        {r.porcentajeMundial > 0 && <span className="text-muted-foreground ml-1">({r.porcentajeMundial}%)</span>}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full opacity-80" style={{ width: `${Math.max(pct, 2)}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
              {data.reservas.mexico && (
                <div className="space-y-0.5 pt-1 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">🇲🇽 {data.reservas.mexico.pais}</span>
                    <span className="font-mono font-semibold">
                      {data.reservas.mexico.cantidad} {data.reservas.unidad}
                      {data.reservas.mexico.porcentajeMundial > 0 && <span className="text-muted-foreground ml-1">({data.reservas.mexico.porcentajeMundial}%)</span>}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-green-500" style={{
                      width: `${Math.max((parseFloat(data.reservas.mexico.cantidad.replace(/[^0-9.]/g, "")) / parseFloat(data.reservas.top5[0].cantidad.replace(/[^0-9.]/g, ""))) * 100, 1)}%`
                    }} />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Mexico Comparison */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Comparación con México
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">🇲🇽 México — Posición Global</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Capacidad instalada</span>
                  <Badge className="font-mono" style={{ background: color }}>{data.mexico.capacidadGW.toLocaleString()} {data.unidad}</Badge>
                </div>
                {data.mexico.rankingMundial > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ranking mundial</span>
                    <Badge variant="outline" className="font-mono">#{data.mexico.rankingMundial}</Badge>
                  </div>
                )}
                {/* Largest plant comparison */}
                <div className="pt-2 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Planta más grande por país</p>
                  {data.top5.slice(0, 3).map((p) => {
                    const maxPl = data.top5[0].plantaMasGrande.capacidadMW;
                    const pct = Math.min((p.plantaMasGrande.capacidadMW / maxPl) * 100, 100);
                    return (
                      <div key={p.codigo} className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span>{p.pais}: <span className="font-medium">{p.plantaMasGrande.nombre}</span></span>
                          <span className="font-mono">{p.plantaMasGrande.capacidadMW.toLocaleString()} MW</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                  {data.mexico.plantaMasGrande.capacidadMW > 0 && (
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold">🇲🇽 {data.mexico.plantaMasGrande.nombre}</span>
                        <span className="font-mono font-semibold">{data.mexico.plantaMasGrande.capacidadMW.toLocaleString()} MW</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{
                          width: `${Math.max((data.mexico.plantaMasGrande.capacidadMW / data.top5[0].plantaMasGrande.capacidadMW) * 100, 1)}%`
                        }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Capacity comparison */}
                <div className="pt-2 border-t space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Capacidad total por país</p>
                  {data.top5.slice(0, 3).map((p) => {
                    const pct = Math.min((p.capacidadGW / data.top5[0].capacidadGW) * 100, 100);
                    return (
                      <div key={p.codigo + "-cap"} className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span>{p.pais}</span>
                          <span className="font-mono">{p.capacidadGW.toLocaleString()} GW</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-semibold">🇲🇽 México</span>
                      <span className="font-mono font-semibold">{data.mexico.capacidadGW.toLocaleString()} GW</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{
                        width: `${Math.max((data.mexico.capacidadGW / data.top5[0].capacidadGW) * 100, 1)}%`
                      }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Análisis de México</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-green-700 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Fortalezas
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">{data.mexico.fortalezas}</p>
                </div>
                <div>
                  <p className="font-medium text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Retos
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">{data.mexico.retos}</p>
                </div>
                <div>
                  <p className="font-medium flex items-center gap-1" style={{ color }}>
                    <Lightbulb className="h-3.5 w-3.5" /> Potencial
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">{data.mexico.potencial}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PotenciasMundiales;
