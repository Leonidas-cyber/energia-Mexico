/**
 * Parser de CSV de centrales eléctricas.
 * Convierte coordenadas Web Mercator (EPSG:3857) a lat/lon (EPSG:4326).
 * Normaliza tecnología/combustible al esquema unificado PlantaEnergia.
 */
import type { PlantaEnergia, EnergiaCategoria } from "@/types/energy";

/** Convierte coordenada X de Web Mercator a longitud */
function mercatorToLon(x: number): number {
  return (x / 20037508.34) * 180;
}

/** Convierte coordenada Y de Web Mercator a latitud */
function mercatorToLat(y: number): number {
  const lat = (y / 20037508.34) * 180;
  return (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
}

/** Normaliza tecnología y combustible a categoría/subcategoría */
function normalizarTecnologia(tecnologia: string, combustible: string): { categoria: EnergiaCategoria; subcategoria: string } {
  const tec = (tecnologia || "").toLowerCase().trim();
  const comb = (combustible || "").toLowerCase().trim();

  // Solar / Fotovoltaica
  if (tec.includes("fotovoltaica") || tec.includes("solar")) {
    return { categoria: "solar", subcategoria: "fotovoltaica" };
  }

  // Eólica
  if (tec.includes("eólica") || tec.includes("eolica")) {
    return { categoria: "eolica", subcategoria: "eólica" };
  }

  // Hidroeléctrica
  if (tec.includes("hidro") || tec.includes("hidroeléctrica")) {
    return { categoria: "hidroelectrica", subcategoria: "hidroeléctrica" };
  }

  // Nuclear
  if (tec.includes("nuclear") || comb.includes("nuclear") || comb.includes("uranio")) {
    return { categoria: "nuclear", subcategoria: "nuclear" };
  }

  // Geotérmica
  if (tec.includes("geotérmica") || tec.includes("geotermica") || comb.includes("geotérmica")) {
    return { categoria: "geotermica", subcategoria: "geotérmica" };
  }

  // Bioenergía
  if (comb.includes("biogas") || comb.includes("biogás") || comb.includes("biomasa") || comb.includes("bagazo") || comb.includes("licor negro")) {
    const sub = comb.includes("biogas") || comb.includes("biogás") ? "biogás"
      : comb.includes("bagazo") ? "biomasa (bagazo)"
      : "biomasa";
    return { categoria: "bioenergia", subcategoria: sub };
  }

  // Térmica: ciclo combinado, turbina de gas, turbina de vapor, combustión interna
  if (
    tec.includes("ciclo combinado") ||
    tec.includes("turbina de gas") ||
    tec.includes("turbina de vapor") ||
    tec.includes("combustión interna") ||
    tec.includes("combustion interna") ||
    tec.includes("termoeléctrica") ||
    tec.includes("lecho fluidizado") ||
    comb.includes("gas natural") ||
    comb.includes("diesel") ||
    comb.includes("combustóleo") ||
    comb.includes("carbón") ||
    comb.includes("coque") ||
    comb.includes("gas lp")
  ) {
    let sub = "térmica (general)";
    if (tec.includes("ciclo combinado")) sub = "ciclo combinado";
    else if (tec.includes("turbina de gas")) sub = "turbina de gas";
    else if (tec.includes("turbina de vapor")) sub = "turbina de vapor";
    else if (tec.includes("combustión interna") || tec.includes("combustion interna")) sub = "combustión interna";
    else if (tec.includes("termoeléctrica")) sub = "termoeléctrica";
    else if (tec.includes("lecho fluidizado")) sub = "lecho fluidizado";

    if (comb.includes("gas natural")) sub += " (gas natural)";
    else if (comb.includes("diesel")) sub += " (diésel)";
    else if (comb.includes("carbón")) sub += " (carbón)";
    else if (comb.includes("combustóleo")) sub += " (combustóleo)";
    else if (comb.includes("coque")) sub += " (coque)";

    return { categoria: "termica", subcategoria: sub };
  }

  return { categoria: "otras", subcategoria: tec || "no especificada" };
}

/** Clasifica sector desde el campo "Sector" del CSV */
function normalizarSector(sector: string): "publica" | "privada" | "nd" {
  const s = (sector || "").toLowerCase().trim();
  if (s.includes("público") || s.includes("publico")) return "publica";
  if (s.includes("privado")) return "privada";
  return "nd";
}

/** Parsea texto CSV con soporte para campos entrecomillados */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Carga y parsea el CSV de centrales eléctricas */
export async function cargarCentralesCSV(url = "/data/centrales.csv"): Promise<PlantaEnergia[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar ${url}: ${res.status}`);
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Skip header
  const plantas: PlantaEnergia[] = [];
  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 19) continue;

      const [nombre, empresa, tecnologia, _fase, combustible, matriz, sector, _fecha, capacidad, _gen, _inv, _mod, entidad, _permiso, _mia, _aprob, _notas, xStr, yStr] = cols;

      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      const lon = !isNaN(x) ? mercatorToLon(x) : null;
      const lat = !isNaN(y) ? mercatorToLat(y) : null;
      const potencia = parseFloat(capacidad);
      const { categoria, subcategoria } = normalizarTecnologia(tecnologia, combustible);

      plantas.push({
        id: `csv-${i}`,
        nombre_planta: nombre || "Sin nombre",
        operador: empresa || "",
        dueno: matriz || empresa || "",
        sector: normalizarSector(sector),
        potencia_mw: !isNaN(potencia) ? potencia : null,
        fuente_raw: combustible || "",
        metodo_raw: tecnologia || "",
        energia_categoria: categoria,
        energia_subcategoria: subcategoria,
        lat,
        lon,
        estado: entidad || "",
        municipio: "",
        wikidata_id: "",
        fuente_origen: "csv_usuario",
      });
    } catch {
      // Saltar líneas con errores de parseo
    }
  }
  return plantas;
}
