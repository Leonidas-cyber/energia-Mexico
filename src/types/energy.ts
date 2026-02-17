/**
 * Modelo unificado de planta de energía.
 * Todas las fuentes se normalizan a este esquema.
 */
export interface PlantaEnergia {
  id: string;
  nombre_planta: string;
  operador: string;
  dueno: string;
  sector: "publica" | "privada" | "nd";
  potencia_mw: number | null;
  fuente_raw: string;
  metodo_raw: string;
  energia_categoria: EnergiaCategoria;
  energia_subcategoria: string;
  lat: number | null;
  lon: number | null;
  estado: string;
  municipio: string;
  wikidata_id: string;
  fuente_origen: FuenteOrigen;
}

export type EnergiaCategoria =
  | "solar"
  | "eolica"
  | "hidroelectrica"
  | "termica"
  | "nuclear"
  | "geotermica"
  | "bioenergia"
  | "otras";

export type FuenteOrigen =
  | "openinframap"
  | "planeas"
  | "cfenergia"
  | "csv_usuario"
  | "geojson_usuario";

/** Filtros globales que afectan todos los tabs y KPIs */
export interface FiltrosGlobales {
  energiaCategoria: EnergiaCategoria[];
  energiaSubcategoria: string[];
  estados: string[];
  sector: ("publica" | "privada" | "nd")[];
  dueno: string[];
  potenciaMin: number | null;
  potenciaMax: number | null;
}

/** KPIs calculados a partir de los datos filtrados */
export interface KPIs {
  potenciaTotal: number;
  totalPlantas: number;
  porcentajePublica: number;
  porcentajePrivada: number;
  duenosUnicos: number;
  registrosIncompletos: number;
}

/** Estadísticas de calidad de datos */
export interface CalidadDatos {
  validos: number;
  sinCoordenadas: number;
  sinDueno: number;
  sinPotencia: number;
  sinSector: number;
  duplicados: number;
}

/** Contenido de la diapositiva/evaluación (Tab 6) */
export interface ContenidoDiapositiva {
  titulo: string;
  objetivo: string;
  contexto: string;
  metodologia: string;
  resultados: string;
  interpretacion: string;
  conclusion: string;
  limitaciones: string;
  trabajoFuturo: string;
  bibliografia: string;
  mensajePrincipal: string;
}

/** Rúbrica de evaluación */
export interface Rubrica {
  claridad: number;
  calidadVisual: number;
  sustentoTecnico: number;
  citas: number;
  dominioTema: number;
  comentarios: string;
}

/** Patrón de clasificación pública/privada */
export interface PatronClasificacion {
  patron: string;
  sector: "publica" | "privada";
}

export const FILTROS_INICIALES: FiltrosGlobales = {
  energiaCategoria: [],
  energiaSubcategoria: [],
  estados: [],
  sector: [],
  dueno: [],
  potenciaMin: null,
  potenciaMax: null,
};

export const CATEGORIAS_ENERGIA: { key: EnergiaCategoria; label: string; color: string }[] = [
  { key: "solar", label: "Solar", color: "energy-solar" },
  { key: "eolica", label: "Eólica", color: "energy-wind" },
  { key: "hidroelectrica", label: "Hidroeléctrica", color: "energy-hydro" },
  { key: "termica", label: "Térmica", color: "energy-thermal" },
  { key: "nuclear", label: "Nuclear", color: "energy-nuclear" },
  { key: "geotermica", label: "Geotérmica", color: "energy-geothermal" },
  { key: "bioenergia", label: "Bioenergía", color: "energy-bio" },
  { key: "otras", label: "Otras", color: "energy-other" },
];
