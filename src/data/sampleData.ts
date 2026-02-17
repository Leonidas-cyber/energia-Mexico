/**
 * Datos de ejemplo para que la app funcione sin carga externa.
 * Basado en plantas reales de México documentadas públicamente.
 */
import type { PlantaEnergia } from "@/types/energy";

export const PLANTAS_EJEMPLO: PlantaEnergia[] = [
  // === SOLAR ===
  { id: "sol-001", nombre_planta: "Villanueva Solar", operador: "Enel Green Power", dueno: "Enel Green Power", sector: "privada", potencia_mw: 828, fuente_raw: "solar", metodo_raw: "photovoltaic", energia_categoria: "solar", energia_subcategoria: "fotovoltaica", lat: 24.72, lon: -103.48, estado: "Coahuila", municipio: "Viesca", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "sol-002", nombre_planta: "Parque Solar Don José", operador: "Atlas Renewable Energy", dueno: "Atlas Renewable Energy", sector: "privada", potencia_mw: 238, fuente_raw: "solar", metodo_raw: "photovoltaic", energia_categoria: "solar", energia_subcategoria: "fotovoltaica", lat: 22.65, lon: -102.30, estado: "Aguascalientes", municipio: "El Llano", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "sol-003", nombre_planta: "Tepezalá Solar", operador: "Recurrent Energy", dueno: "Recurrent Energy", sector: "privada", potencia_mw: 150, fuente_raw: "solar", metodo_raw: "photovoltaic", energia_categoria: "solar", energia_subcategoria: "fotovoltaica", lat: 22.23, lon: -102.17, estado: "Aguascalientes", municipio: "Tepezalá", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "sol-004", nombre_planta: "Pachamama Solar", operador: "Zuma Energía", dueno: "Zuma Energía", sector: "privada", potencia_mw: 375, fuente_raw: "solar", metodo_raw: "photovoltaic", energia_categoria: "solar", energia_subcategoria: "fotovoltaica", lat: 23.20, lon: -103.60, estado: "Durango", municipio: "Poanas", wikidata_id: "", fuente_origen: "openinframap" },

  // === EÓLICA ===
  { id: "eol-001", nombre_planta: "La Venta III", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 102, fuente_raw: "wind", metodo_raw: "wind_turbine", energia_categoria: "eolica", energia_subcategoria: "eólica", lat: 16.56, lon: -94.77, estado: "Oaxaca", municipio: "Juchitán de Zaragoza", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "eol-002", nombre_planta: "Parque Eólico Reynosa", operador: "Acciona Energía", dueno: "Acciona Energía", sector: "privada", potencia_mw: 424, fuente_raw: "wind", metodo_raw: "wind_turbine", energia_categoria: "eolica", energia_subcategoria: "eólica", lat: 26.05, lon: -98.28, estado: "Tamaulipas", municipio: "Reynosa", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "eol-003", nombre_planta: "Eólica del Sur", operador: "PEMEX / Mitsubishi", dueno: "PEMEX", sector: "publica", potencia_mw: 396, fuente_raw: "wind", metodo_raw: "wind_turbine", energia_categoria: "eolica", energia_subcategoria: "eólica", lat: 16.43, lon: -94.88, estado: "Oaxaca", municipio: "El Espinal", wikidata_id: "", fuente_origen: "openinframap" },

  // === HIDROELÉCTRICA ===
  { id: "hid-001", nombre_planta: "El Cajón", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 750, fuente_raw: "hydro", metodo_raw: "water_turbine", energia_categoria: "hidroelectrica", energia_subcategoria: "hidroeléctrica", lat: 21.42, lon: -104.42, estado: "Nayarit", municipio: "La Yesca", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "hid-002", nombre_planta: "Chicoasén II", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 240, fuente_raw: "hydro", metodo_raw: "water_turbine", energia_categoria: "hidroelectrica", energia_subcategoria: "hidroeléctrica", lat: 16.95, lon: -93.10, estado: "Chiapas", municipio: "Chicoasén", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "hid-003", nombre_planta: "Manuel Moreno Torres (Chicoasén)", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 2400, fuente_raw: "hydro", metodo_raw: "water_turbine", energia_categoria: "hidroelectrica", energia_subcategoria: "hidroeléctrica", lat: 16.93, lon: -93.09, estado: "Chiapas", municipio: "Chicoasén", wikidata_id: "", fuente_origen: "planeas" },

  // === TÉRMICA ===
  { id: "ter-001", nombre_planta: "Central Ciclo Combinado Norte II", operador: "Naturgy", dueno: "Naturgy", sector: "privada", potencia_mw: 433, fuente_raw: "gas", metodo_raw: "combined_cycle", energia_categoria: "termica", energia_subcategoria: "gas natural - ciclo combinado", lat: 31.72, lon: -106.43, estado: "Chihuahua", municipio: "Juárez", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "ter-002", nombre_planta: "Tuxpan II CC", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 495, fuente_raw: "gas", metodo_raw: "combined_cycle", energia_categoria: "termica", energia_subcategoria: "gas natural - ciclo combinado", lat: 20.95, lon: -97.39, estado: "Veracruz", municipio: "Tuxpan", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "ter-003", nombre_planta: "Carboeléctrica Petacalco", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 2778, fuente_raw: "coal", metodo_raw: "steam_turbine", energia_categoria: "termica", energia_subcategoria: "carbón", lat: 17.99, lon: -102.10, estado: "Guerrero", municipio: "La Unión de Isidoro Montes de Oca", wikidata_id: "", fuente_origen: "planeas" },

  // === NUCLEAR ===
  { id: "nuc-001", nombre_planta: "Central Nucleoeléctrica Laguna Verde", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 1510, fuente_raw: "nuclear", metodo_raw: "steam_turbine", energia_categoria: "nuclear", energia_subcategoria: "nuclear", lat: 19.72, lon: -96.40, estado: "Veracruz", municipio: "Alto Lucero", wikidata_id: "Q1530702", fuente_origen: "planeas" },

  // === GEOTÉRMICA ===
  { id: "geo-001", nombre_planta: "Cerro Prieto", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 570, fuente_raw: "geothermal", metodo_raw: "steam_turbine", energia_categoria: "geotermica", energia_subcategoria: "geotérmica", lat: 32.41, lon: -115.22, estado: "Baja California", municipio: "Mexicali", wikidata_id: "", fuente_origen: "openinframap" },
  { id: "geo-002", nombre_planta: "Los Azufres", operador: "CFE", dueno: "CFE", sector: "publica", potencia_mw: 247, fuente_raw: "geothermal", metodo_raw: "steam_turbine", energia_categoria: "geotermica", energia_subcategoria: "geotérmica", lat: 19.78, lon: -100.65, estado: "Michoacán", municipio: "Hidalgo", wikidata_id: "", fuente_origen: "openinframap" },

  // === BIOENERGÍA ===
  { id: "bio-001", nombre_planta: "Bioenergía de Nuevo León", operador: "BENLESA", dueno: "BENLESA", sector: "privada", potencia_mw: 17, fuente_raw: "biogas", metodo_raw: "internal_combustion", energia_categoria: "bioenergia", energia_subcategoria: "biogás", lat: 25.70, lon: -100.14, estado: "Nuevo León", municipio: "Monterrey", wikidata_id: "", fuente_origen: "csv_usuario" },
  { id: "bio-002", nombre_planta: "Ingenio El Mante Cogeneración", operador: "Grupo PIASA", dueno: "Grupo PIASA", sector: "privada", potencia_mw: 26, fuente_raw: "biomass", metodo_raw: "steam_turbine", energia_categoria: "bioenergia", energia_subcategoria: "biomasa", lat: 22.74, lon: -98.97, estado: "Tamaulipas", municipio: "El Mante", wikidata_id: "", fuente_origen: "csv_usuario" },
];

/** Lista de estados de México para filtros */
export const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];
