/**
 * Clasificación pública/privada basada en patrones editables.
 */
import type { PatronClasificacion } from "@/types/energy";

const STORAGE_KEY = "patrones_clasificacion";

/** Patrones por defecto para identificar entidades públicas */
const PATRONES_DEFAULT: PatronClasificacion[] = [
  { patron: "cfe", sector: "publica" },
  { patron: "comisión federal", sector: "publica" },
  { patron: "comision federal", sector: "publica" },
  { patron: "pemex", sector: "publica" },
  { patron: "petróleos mexicanos", sector: "publica" },
  { patron: "gobierno", sector: "publica" },
  { patron: "federal de electricidad", sector: "publica" },
];

export function obtenerPatrones(): PatronClasificacion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return PATRONES_DEFAULT;
}

export function guardarPatrones(patrones: PatronClasificacion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patrones));
}

/**
 * Clasifica una planta como pública, privada o nd según operador/dueño.
 */
export function clasificarSector(operador: string, dueno: string): "publica" | "privada" | "nd" {
  const texto = `${operador} ${dueno}`.toLowerCase();
  if (!texto.trim() || texto.trim() === "nd" || texto.trim() === "n/d" || texto.trim() === "desconocido") {
    return "nd";
  }
  const patrones = obtenerPatrones();
  for (const p of patrones) {
    if (texto.includes(p.patron.toLowerCase())) {
      return p.sector;
    }
  }
  return "privada";
}
