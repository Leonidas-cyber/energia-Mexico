/**
 * Parser de CSV de centrales eléctricas.
 * - Soporta delimitador coma o punto y coma.
 * - Soporta campos entrecomillados y comillas escapadas.
 * - Soporta saltos de línea dentro de campos quoted.
 * - Convierte coordenadas Web Mercator (EPSG:3857) a lat/lon (EPSG:4326).
 */
import type { PlantaEnergia, EnergiaCategoria } from "@/types/energy";

function stripBOM(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function splitCSVRecords(content: string): string[] {
  const normalized = stripBOM(content).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const next = normalized[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        // Comilla escapada
        current += '""';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      current += char;
      continue;
    }

    if (char === "\n" && !inQuotes) {
      rows.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0) rows.push(current);
  return rows.filter((r) => r.trim().length > 0);
}

function detectDelimiter(headerLine: string): "," | ";" {
  const commas = (headerLine.match(/,/g) || []).length;
  const semicolons = (headerLine.match(/;/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

function parseLine(line: string, delimiter: "," | ";"): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCSVToRows(content: string): string[][] {
  const lines = splitCSVRecords(content);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  return lines.map((line) => parseLine(line, delimiter));
}

function parseNumeric(value: string | undefined | null): number | null {
  if (value == null) return null;
  let v = String(value).trim();

  if (!v || /^(null|nd|n\/d|na|n\/a|-)$/i.test(v)) return null;

  // Elimina unidades/espacios/símbolos preservando dígitos, signo y separadores decimales
  v = v.replace(/\s+/g, "").replace(/[^\d,.-]/g, "");
  if (!v) return null;

  const hasComma = v.includes(",");
  const hasDot = v.includes(".");

  if (hasComma && hasDot) {
    // El último separador suele ser el decimal
    const lastComma = v.lastIndexOf(",");
    const lastDot = v.lastIndexOf(".");

    if (lastComma > lastDot) {
      // 1.234,56 -> 1234.56
      v = v.replace(/\./g, "").replace(/,/g, ".");
    } else {
      // 1,234.56 -> 1234.56
      v = v.replace(/,/g, "");
    }
  } else if (hasComma && !hasDot) {
    // 123,45 -> 123.45
    v = v.replace(/,/g, ".");
  }

  const num = Number.parseFloat(v);
  return Number.isFinite(num) ? num : null;
}

function mercatorToLatLon(xStr: string, yStr: string): { lat: number; lon: number } | null {
  const x = parseNumeric(xStr);
  const y = parseNumeric(yStr);

  if (x == null || y == null) return null;

  const lon = (x / 20037508.34) * 180;
  const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360) / Math.PI - 90;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
}

function normalizarTecnologia(tecnologia: string, combustible: string): { categoria: EnergiaCategoria; subcategoria: string } {
  const t = (tecnologia || "").toLowerCase().trim();
  const c = (combustible || "").toLowerCase().trim();

  if (t.includes("fotovolta") || t.includes("solar") || c.includes("sol") || c.includes("solar")) {
    return { categoria: "solar", subcategoria: "fotovoltaica" };
  }

  if (t.includes("eólic") || t.includes("eolic") || c.includes("viento") || c.includes("wind")) {
    return { categoria: "eolica", subcategoria: "eólica" };
  }

  if (t.includes("hidro") || t.includes("hidrául") || t.includes("hidraul")) {
    return { categoria: "hidroelectrica", subcategoria: "hidroeléctrica" };
  }

  if (t.includes("nuclear") || c.includes("uranio")) {
    return { categoria: "nuclear", subcategoria: "nuclear" };
  }

  if (t.includes("geot") || c.includes("geot")) {
    return { categoria: "geotermica", subcategoria: "geotérmica" };
  }

  if (c.includes("biogas") || c.includes("biogás") || c.includes("biomasa") || c.includes("bagazo") || c.includes("licor negro")) {
    const subcategoria =
      c.includes("biogas") || c.includes("biogás")
        ? "biogás"
        : c.includes("bagazo")
        ? "biomasa (bagazo)"
        : "biomasa";
    return { categoria: "bioenergia", subcategoria };
  }

  if (
    t.includes("ciclo combinado") ||
    t.includes("turbina de gas") ||
    t.includes("turbina de vapor") ||
    t.includes("combustión interna") ||
    t.includes("combustion interna") ||
    t.includes("termoeléctrica") ||
    t.includes("termoelectrica") ||
    t.includes("lecho fluidizado") ||
    c.includes("gas natural") ||
    c.includes("diesel") ||
    c.includes("diésel") ||
    c.includes("combustóleo") ||
    c.includes("combustoleo") ||
    c.includes("carbón") ||
    c.includes("carbon") ||
    c.includes("coque") ||
    c.includes("gas lp")
  ) {
    let sub = "térmica (general)";
    if (t.includes("ciclo combinado")) sub = "ciclo combinado";
    else if (t.includes("turbina de gas")) sub = "turbina de gas";
    else if (t.includes("turbina de vapor")) sub = "turbina de vapor";
    else if (t.includes("combustión interna") || t.includes("combustion interna")) sub = "combustión interna";
    else if (t.includes("termoeléctrica") || t.includes("termoelectrica")) sub = "termoeléctrica";
    else if (t.includes("lecho fluidizado")) sub = "lecho fluidizado";

    if (c.includes("gas natural")) sub += " (gas natural)";
    else if (c.includes("diesel") || c.includes("diésel")) sub += " (diésel)";
    else if (c.includes("carbón") || c.includes("carbon")) sub += " (carbón)";
    else if (c.includes("combustóleo") || c.includes("combustoleo")) sub += " (combustóleo)";
    else if (c.includes("coque")) sub += " (coque)";

    return { categoria: "termica", subcategoria: sub };
  }

  return { categoria: "otras", subcategoria: t || "no especificada" };
}

function normalizarSector(sectorRaw: string, empresaRaw: string, matrizRaw: string): "publica" | "privada" | "nd" {
  const s = (sectorRaw || "").toLowerCase();
  const ref = `${empresaRaw || ""} ${matrizRaw || ""} ${sectorRaw || ""}`.toLowerCase();

  if (s.includes("priv")) return "privada";
  if (s.includes("pub") || s.includes("púb")) return "publica";

  if (/\b(cfe|pemex|sener|cenace|gobierno|estado|federal)\b/.test(ref)) return "publica";
  if (/\b(s\.a\.|s\. de r\.l\.|iberdrola|engie|acciona|enel|mitsui)\b/.test(ref)) return "privada";

  return "nd";
}

function parseRow(row: string[], idx: number): PlantaEnergia | null {
  // Esperado (centrales.csv):
  // 0 Nombre, 1 Empresa, 2 Tecnología, 3 Fase, 4 Combustible, 5 Matriz,
  // 6 Sector, ..., 8 Capacidad(MW), ..., 12 Entidad, ..., 17 X, 18 Y
  if (!row || row.length < 19) return null;

  const nombre = (row[0] || "").trim();
  if (!nombre) return null;

  const empresa = (row[1] || "").trim();
  const tecnologia = (row[2] || "").trim();
  const combustible = (row[4] || "").trim();
  const matriz = (row[5] || "").trim();
  const sectorRaw = (row[6] || "").trim();
  const estado = (row[12] || "").trim();

  const potencia = parseNumeric(row[8]);
  const loc = mercatorToLatLon(row[17] || "", row[18] || "");

  const { categoria, subcategoria } = normalizarTecnologia(tecnologia, combustible);

  return {
    id: `csv-${idx}`,
    nombre_planta: nombre,
    operador: empresa || "",
    dueno: matriz || empresa || "",
    sector: normalizarSector(sectorRaw, empresa, matriz),
    potencia_mw: potencia,
    fuente_raw: combustible || "",
    metodo_raw: tecnologia || "",
    energia_categoria: categoria,
    energia_subcategoria: subcategoria,
    lat: loc?.lat ?? null,
    lon: loc?.lon ?? null,
    estado: estado || "",
    municipio: "",
    wikidata_id: "",
    fuente_origen: "csv_usuario",
  };
}

/** Parsea contenido o archivo CSV de centrales */
export async function parseCentralesCSV(fileOrText: File | string): Promise<PlantaEnergia[]> {
  const content = typeof fileOrText === "string" ? fileOrText : await fileOrText.text();
  const rows = parseCSVToRows(content);
  if (rows.length <= 1) return [];

  return rows
    .slice(1) // encabezado
    .map((r, i) => parseRow(r, i + 1))
    .filter((p): p is PlantaEnergia => p !== null);
}

function looksLikeCSVContent(text: string): boolean {
  return text.includes("\n") && (text.includes(",") || text.includes(";"));
}

/**
 * API compatible con el código existente:
 * - Sin argumentos: carga /data/centrales.csv
 * - string URL: hace fetch y parsea
 * - string CSV: parsea directo
 * - File: parsea directo
 */
export async function cargarCentralesCSV(input: string | File = "/data/centrales.csv"): Promise<PlantaEnergia[]> {
  if (typeof input !== "string") {
    return parseCentralesCSV(input);
  }

  if (looksLikeCSVContent(input)) {
    return parseCentralesCSV(input);
  }

  const res = await fetch(input);
  if (!res.ok) throw new Error(`No se pudo cargar ${input}: ${res.status}`);
  const text = await res.text();
  return parseCentralesCSV(text);
}
