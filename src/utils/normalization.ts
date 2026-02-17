/**
 * Motor de normalización de energías.
 * Convierte source/method crudos a categoría/subcategoría estándar.
 */
import type { EnergiaCategoria } from "@/types/energy";

interface ResultadoNormalizacion {
  categoria: EnergiaCategoria;
  subcategoria: string;
}

export function normalizarEnergia(source: string, method: string): ResultadoNormalizacion {
  const s = (source || "").toLowerCase().trim();
  const m = (method || "").toLowerCase().trim();

  // Solar
  if (s.includes("solar")) {
    if (m.includes("photovoltaic") || m.includes("fotovoltaic")) {
      return { categoria: "solar", subcategoria: "fotovoltaica" };
    }
    if (m.includes("thermal") || m.includes("termi") || m.includes("térmi")) {
      return { categoria: "solar", subcategoria: "solar térmica" };
    }
    return { categoria: "solar", subcategoria: "solar (general)" };
  }

  // Geotérmica
  if (s.includes("geotherm") || s.includes("geotermi") || s.includes("geotérmi")) {
    return { categoria: "geotermica", subcategoria: "geotérmica" };
  }

  // Eólica
  if (s.includes("wind") || s.includes("eolic") || s.includes("eólic")) {
    return { categoria: "eolica", subcategoria: "eólica" };
  }

  // Hidroeléctrica
  if (s.includes("hydro") || s.includes("hidro") || s.includes("water")) {
    return { categoria: "hidroelectrica", subcategoria: "hidroeléctrica" };
  }

  // Nuclear
  if (s.includes("nuclear")) {
    return { categoria: "nuclear", subcategoria: "nuclear" };
  }

  // Bioenergía
  if (s.includes("biomass") || s.includes("biogas") || s.includes("biomas") || s.includes("biogás")) {
    return { categoria: "bioenergia", subcategoria: s.includes("biogas") || s.includes("biogás") ? "biogás" : "biomasa" };
  }

  // Térmica (gas, oil, coal, diesel, combustión, ciclo combinado, vapor)
  const fuentesTermicas = ["gas", "oil", "coal", "diesel", "fuel", "petrol", "carbón"];
  const metodosTermicos = ["combustion", "combined_cycle", "ciclo_combinado", "steam", "vapor", "internal_combustion", "turbine"];
  if (fuentesTermicas.some(f => s.includes(f)) || metodosTermicos.some(mt => m.includes(mt))) {
    let sub = "térmica (general)";
    if (s.includes("gas")) sub = "gas natural";
    else if (s.includes("coal") || s.includes("carbón")) sub = "carbón";
    else if (s.includes("oil") || s.includes("petrol")) sub = "petróleo";
    else if (s.includes("diesel")) sub = "diésel";
    if (m.includes("combined") || m.includes("combinado")) sub += " - ciclo combinado";
    return { categoria: "termica", subcategoria: sub };
  }

  return { categoria: "otras", subcategoria: "no especificada" };
}
