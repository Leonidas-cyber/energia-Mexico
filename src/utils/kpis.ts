/**
 * Cálculo de KPIs y métricas a partir de datos filtrados.
 */
import type { PlantaEnergia, KPIs, CalidadDatos, FiltrosGlobales } from "@/types/energy";

function hasFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Aplica filtros globales al arreglo de plantas */
export function filtrarPlantas(plantas: PlantaEnergia[], filtros: FiltrosGlobales): PlantaEnergia[] {
  return plantas.filter((p) => {
    if (filtros.energiaCategoria.length > 0 && !filtros.energiaCategoria.includes(p.energia_categoria)) return false;
    if (filtros.energiaSubcategoria.length > 0 && !filtros.energiaSubcategoria.includes(p.energia_subcategoria)) return false;
    if (filtros.estados.length > 0 && !filtros.estados.includes(p.estado)) return false;
    if (filtros.sector.length > 0 && !filtros.sector.includes(p.sector)) return false;
    if (filtros.dueno.length > 0 && !filtros.dueno.includes(p.dueno)) return false;
    if (filtros.potenciaMin != null && (p.potencia_mw == null || p.potencia_mw < filtros.potenciaMin)) return false;
    if (filtros.potenciaMax != null && (p.potencia_mw == null || p.potencia_mw > filtros.potenciaMax)) return false;
    return true;
  });
}

/** Calcula KPIs de un conjunto de plantas */
export function calcularKPIs(plantas: PlantaEnergia[]): KPIs {
  const total = plantas.length;
  const potenciaTotal = plantas.reduce((sum, p) => sum + (hasFiniteNumber(p.potencia_mw) ? p.potencia_mw : 0), 0);

  const publicas = plantas.filter((p) => p.sector === "publica").length;
  const privadas = plantas.filter((p) => p.sector === "privada").length;
  const duenosUnicos = new Set(plantas.map((p) => p.dueno).filter(Boolean)).size;

  const incompletos = plantas.filter((p) => {
    const sinPotencia = !hasFiniteNumber(p.potencia_mw);
    const sinCoords = !hasFiniteNumber(p.lat) || !hasFiniteNumber(p.lon);
    const sinDueno = !(p.dueno || "").trim();
    const sinSector = p.sector === "nd";
    return sinPotencia || sinCoords || sinDueno || sinSector;
  }).length;

  return {
    potenciaTotal: Math.round(potenciaTotal * 100) / 100,
    totalPlantas: total,
    porcentajePublica: total > 0 ? Math.round((publicas / total) * 1000) / 10 : 0,
    porcentajePrivada: total > 0 ? Math.round((privadas / total) * 1000) / 10 : 0,
    duenosUnicos,
    registrosIncompletos: incompletos,
  };
}

/** Calcula estadísticas de calidad de datos */
export function calcularCalidad(plantas: PlantaEnergia[]): CalidadDatos {
  const ids = plantas.map((p) => p.id);
  const duplicados = ids.length - new Set(ids).size;

  return {
    validos: plantas.filter((p) => hasFiniteNumber(p.lat) && hasFiniteNumber(p.lon) && hasFiniteNumber(p.potencia_mw) && !!(p.dueno || "").trim() && p.sector !== "nd").length,
    sinCoordenadas: plantas.filter((p) => !hasFiniteNumber(p.lat) || !hasFiniteNumber(p.lon)).length,
    sinDueno: plantas.filter((p) => !(p.dueno || "").trim()).length,
    sinPotencia: plantas.filter((p) => !hasFiniteNumber(p.potencia_mw)).length,
    sinSector: plantas.filter((p) => p.sector === "nd").length,
    duplicados,
  };
}

/** Top dueños por MW */
export function topDuenosPorMW(plantas: PlantaEnergia[], n = 10) {
  const map = new Map<string, number>();
  for (const p of plantas) {
    const key = (p.dueno || p.operador || "N/D").trim() || "N/D";
    map.set(key, (map.get(key) || 0) + (hasFiniteNumber(p.potencia_mw) ? p.potencia_mw : 0));
  }

  return Array.from(map.entries())
    .map(([dueno, mw]) => ({ dueno, mw: Math.round(mw * 100) / 100 }))
    .sort((a, b) => b.mw - a.mw)
    .slice(0, n);
}

/** Top dueños por número de plantas */
export function topDuenosPorPlantas(plantas: PlantaEnergia[], n = 10) {
  const map = new Map<string, { count: number; mw: number }>();
  for (const p of plantas) {
    const key = (p.dueno || p.operador || "N/D").trim() || "N/D";
    const prev = map.get(key) || { count: 0, mw: 0 };
    map.set(key, {
      count: prev.count + 1,
      mw: prev.mw + (hasFiniteNumber(p.potencia_mw) ? p.potencia_mw : 0),
    });
  }

  return Array.from(map.entries())
    .map(([dueno, v]) => ({ dueno, count: v.count, mw: Math.round(v.mw * 100) / 100 }))
    .sort((a, b) => b.count - a.count || b.mw - a.mw)
    .slice(0, n);
}

/** Potencia por estado */
export function potenciaPorEstado(plantas: PlantaEnergia[]) {
  const map = new Map<string, { mw: number; count: number }>();

  for (const p of plantas) {
    const estado = (p.estado || "N/D").trim() || "N/D";
    const entry = map.get(estado) || { mw: 0, count: 0 };
    entry.mw += hasFiniteNumber(p.potencia_mw) ? p.potencia_mw : 0;
    entry.count += 1;
    map.set(estado, entry);
  }

  return Array.from(map.entries())
    .map(([estado, data]) => ({ estado, mw: Math.round(data.mw * 100) / 100, count: data.count }))
    .sort((a, b) => b.mw - a.mw);
}
