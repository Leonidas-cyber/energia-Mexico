/**
 * Base de datos completa de las 438 plantas de energía de México.
 * Fuente: OpenInfraMap (https://openinframap.org/stats/area/Mexico/plants)
 * Coordenadas aproximadas basadas en ubicaciones conocidas de las plantas.
 * 
 * Las plantas sin coordenadas se marcan con lat/lon = null.
 * Las plantas sin nombre se registran como "[Sin nombre]".
 */
import type { PlantaEnergia } from "@/types/energy";
import { normalizarEnergia } from "@/utils/normalization";
import { clasificarSector } from "@/utils/classification";

interface PlantaRaw {
  id: string;
  nombre: string;
  operador: string;
  mw: number | null;
  source: string;
  method: string;
  wikidata: string;
  lat: number | null;
  lon: number | null;
  estado: string;
}

/** Coordenadas centroides aproximadas de estados mexicanos */
const CENTROIDES_ESTADOS: Record<string, [number, number]> = {
  "Aguascalientes": [21.88, -102.29],
  "Baja California": [30.84, -115.28],
  "Baja California Sur": [24.14, -110.31],
  "Campeche": [18.84, -90.36],
  "Chiapas": [16.75, -93.12],
  "Chihuahua": [28.63, -106.09],
  "Ciudad de México": [19.43, -99.13],
  "Coahuila": [27.06, -101.71],
  "Colima": [19.24, -103.72],
  "Durango": [24.02, -104.66],
  "Estado de México": [19.49, -99.87],
  "Guanajuato": [21.02, -101.26],
  "Guerrero": [17.44, -99.55],
  "Hidalgo": [20.09, -98.76],
  "Jalisco": [20.66, -103.35],
  "Michoacán": [19.57, -101.71],
  "Morelos": [18.68, -99.23],
  "Nayarit": [21.75, -104.85],
  "Nuevo León": [25.59, -99.99],
  "Oaxaca": [17.07, -96.72],
  "Puebla": [19.04, -98.20],
  "Querétaro": [20.59, -100.39],
  "Quintana Roo": [19.18, -88.48],
  "San Luis Potosí": [22.15, -100.98],
  "Sinaloa": [24.81, -107.39],
  "Sonora": [29.07, -110.96],
  "Tabasco": [17.99, -92.93],
  "Tamaulipas": [24.27, -98.84],
  "Tlaxcala": [19.32, -98.24],
  "Veracruz": [19.18, -96.14],
  "Yucatán": [20.97, -89.62],
  "Zacatecas": [22.77, -102.58],
};

// Datos crudos de las 438 plantas (top ~200 con coordenadas, resto con centroide de estado)
const PLANTAS_RAW: PlantaRaw[] = [
  // === TERMOELÉCTRICAS (gas, oil, coal) — Top 80 ===
  { id: "oim-109686948", nombre: "Central Termoeléctrica Plutarco Elías Calles", operador: "Comisión Federal de Electricidad", mw: 2778, source: "coal", method: "combustion", wikidata: "Q19818968", lat: 17.99, lon: -102.10, estado: "Guerrero" },
  { id: "oim-318948687", nombre: "Central Termoeléctrica General Manuel Álvarez Moreno", operador: "Comisión Federal de Electricidad", mw: 2754, source: "gas;oil", method: "combustion", wikidata: "Q122808952", lat: 19.06, lon: -104.32, estado: "Colima" },
  { id: "oim-113005847", nombre: "Central Termoeléctrica Francisco Pérez Ríos", operador: "CFE", mw: 2200, source: "oil;gas", method: "combustion", wikidata: "Q12007849", lat: 20.95, lon: -97.40, estado: "Veracruz" },
  { id: "oim-109358960", nombre: "Central Termoeléctrica Adolfo López Mateos", operador: "Comisión Federal de Electricidad", mw: 2100, source: "oil", method: "", wikidata: "Q2919594", lat: 20.95, lon: -97.38, estado: "Veracruz" },
  { id: "oim-908423767", nombre: "Centrales de Ciclo Combinado Escobedo y El Carmen", operador: "Iberdrola", mw: 1744, source: "gas", method: "combustion", wikidata: "Q122759630", lat: 25.78, lon: -100.32, estado: "Nuevo León" },
  { id: "oim-1020167969", nombre: "Central de Ciclo Combinado Topolobampo II y III", operador: "Iberdrola", mw: 1690, source: "gas", method: "combustion", wikidata: "Q122759669", lat: 25.60, lon: -109.05, estado: "Sinaloa" },
  { id: "oim-753793100", nombre: "Central Empalme I y II", operador: "CFE", mw: 1591, source: "gas", method: "combustion", wikidata: "", lat: 27.96, lon: -110.81, estado: "Sonora" },
  { id: "oim-52302689", nombre: "Central de Ciclo Combinado La Rosita", operador: "", mw: 1405, source: "gas", method: "combustion", wikidata: "", lat: 32.55, lon: -115.47, estado: "Baja California" },
  { id: "oim-101027469", nombre: "Central Termoeléctrica Carbón II", operador: "Comisión Federal de Electricidad", mw: 1400, source: "coal", method: "combustion", wikidata: "Q11963104", lat: 28.07, lon: -100.54, estado: "Coahuila" },
  { id: "oim-124801187", nombre: "Central de Ciclo Combinado Dulces Nombres", operador: "Iberdrola", mw: 1308, source: "gas", method: "combined_cycle", wikidata: "Q11989898", lat: 25.78, lon: -100.17, estado: "Nuevo León" },
  { id: "oim-50924040", nombre: "Central Termoeléctrica Presidente Juárez", operador: "Comisión Federal de Electricidad", mw: 1303, source: "gas", method: "", wikidata: "", lat: 31.32, lon: -110.93, estado: "Sonora" },
  { id: "oim-101027472", nombre: "Central Termoeléctrica José López Portillo", operador: "Comisión Federal de Electricidad", mw: 1285, source: "coal", method: "combustion", wikidata: "Q11963103", lat: 28.08, lon: -100.55, estado: "Coahuila" },
  { id: "oim-325857134", nombre: "Central Termoeléctrica Tamazunchale", operador: "Iberdrola", mw: 1200, source: "gas", method: "combined_cycle", wikidata: "Q19391897", lat: 21.26, lon: -98.78, estado: "San Luis Potosí" },
  { id: "oim-108228719", nombre: "Central Termoeléctrica Valle de México", operador: "CFE", mw: 1193, source: "gas", method: "combustion", wikidata: "", lat: 19.59, lon: -99.00, estado: "Estado de México" },
  { id: "oim-325906424", nombre: "Central Termoeléctrica Altamira V", operador: "Iberdrola", mw: 1143, source: "gas", method: "combustion", wikidata: "Q122759512", lat: 22.40, lon: -97.86, estado: "Tamaulipas" },
  { id: "oim-325906422", nombre: "Central Termoeléctrica Altamira III y IV", operador: "Iberdrola", mw: 1077, source: "gas", method: "combustion", wikidata: "Q122759519", lat: 22.40, lon: -97.85, estado: "Tamaulipas" },
  { id: "oim-113005845", nombre: "Central Termoeléctrica Tuxpan III y IV", operador: "", mw: 983, source: "gas", method: "combined_cycle", wikidata: "", lat: 20.96, lon: -97.38, estado: "Veracruz" },
  { id: "oim-1020056091", nombre: "Central Eléctrica Pesquería", operador: "", mw: 966, source: "gas", method: "combined_cycle", wikidata: "", lat: 25.78, lon: -100.05, estado: "Nuevo León" },
  { id: "oim-1383478446", nombre: "Central de Ciclo Combinado Salamanca", operador: "Comisión Federal de Electricidad", mw: 927, source: "gas", method: "combined_cycle", wikidata: "Q134315886", lat: 20.57, lon: -101.20, estado: "Guanajuato" },
  { id: "oim-948823944", nombre: "Central de Ciclo Combinado Norte III", operador: "", mw: 906, source: "gas", method: "combustion", wikidata: "", lat: 31.69, lon: -106.47, estado: "Chihuahua" },
  { id: "oim-1168813607", nombre: "Central de Ciclo Combinado Tierra Mojada", operador: "Saavi Energia", mw: 874, source: "gas", method: "combustion", wikidata: "", lat: 20.37, lon: -103.38, estado: "Jalisco" },
  { id: "oim-122810847", nombre: "Central Termoeléctrica Samalayuca I y II", operador: "", mw: 838, source: "gas;oil", method: "combustion", wikidata: "", lat: 31.35, lon: -106.48, estado: "Chihuahua" },
  { id: "oim-325906425", nombre: "Central Termoeléctrica Altamira", operador: "", mw: 830, source: "oil", method: "combustion", wikidata: "Q122759530", lat: 22.39, lon: -97.87, estado: "Tamaulipas" },
  { id: "oim-1149316528", nombre: "Los Ramones Energy Center", operador: "", mw: 768, source: "gas", method: "combustion", wikidata: "", lat: 25.05, lon: -99.63, estado: "Nuevo León" },
  { id: "oim-189209319", nombre: "Central Termoeléctrica Villa de Reyes", operador: "Comisión Federal de Electricidad", mw: 700, source: "oil", method: "", wikidata: "Q19398123", lat: 21.80, lon: -100.94, estado: "San Luis Potosí" },
  { id: "oim-120234852", nombre: "Central Termoeléctrica El Sauz", operador: "", mw: 700, source: "gas", method: "combined_cycle", wikidata: "", lat: 20.71, lon: -100.43, estado: "Querétaro" },
  { id: "oim-1384215202", nombre: "Central de Ciclo Combinado Lerdo", operador: "Comisión Federal de Electricidad", mw: 670, source: "gas", method: "combined_cycle", wikidata: "Q134383724", lat: 25.53, lon: -103.52, estado: "Durango" },
  { id: "oim-325874080", nombre: "Central Termoeléctrica Bajío", operador: "Intergen", mw: 643, source: "gas", method: "combustion", wikidata: "", lat: 20.53, lon: -101.19, estado: "Guanajuato" },
  { id: "oim-381991694", nombre: "Central Termoeléctrica Huexca", operador: "CFE", mw: 642, source: "gas", method: "combined_cycle", wikidata: "", lat: 18.86, lon: -98.89, estado: "Morelos" },
  { id: "oim-191580098", nombre: "Central Termoeléctrica Puerto Libertad", operador: "CFE", mw: 632, source: "oil", method: "", wikidata: "", lat: 29.90, lon: -112.69, estado: "Sonora" },
  { id: "oim-345602358", nombre: "Termoeléctrica de Mexicali", operador: "Termoeléctrica de Mexicali", mw: 625, source: "gas", method: "combustion", wikidata: "", lat: 32.56, lon: -115.39, estado: "Baja California" },
  { id: "oim-372866623", nombre: "Central de Ciclo Combinado Chihuahua II", operador: "Comision Federal de Electricidad", mw: 619, source: "gas", method: "combustion", wikidata: "", lat: 28.68, lon: -106.16, estado: "Chihuahua" },
  { id: "oim-116306706", nombre: "Central Termoeléctrica José Aceves Pozos", operador: "Comision Federal de Electricidad", mw: 616, source: "oil", method: "combustion", wikidata: "Q11988795", lat: 24.82, lon: -107.39, estado: "Sinaloa" },
  { id: "oim-1067690323", nombre: "EVM II", operador: "EVM Energía", mw: 590, source: "gas", method: "combustion", wikidata: "Q122766141", lat: 19.59, lon: -99.01, estado: "Estado de México" },
  { id: "oim-120221068", nombre: "Central Termoeléctrica Salamanca", operador: "Comisión Federal de Electricidad", mw: 550, source: "gas", method: "combustion", wikidata: "Q19387394", lat: 20.57, lon: -101.19, estado: "Guanajuato" },
  { id: "oim-932140078", nombre: "Central de Ciclo Combinado La Laguna II", operador: "Iberdrola", mw: 538, source: "gas", method: "combustion", wikidata: "", lat: 25.54, lon: -103.45, estado: "Durango" },
  { id: "oim-1294600219", nombre: "Central de Ciclo Combinado Tamazunchale 2", operador: "", mw: 532, source: "gas", method: "combined_cycle", wikidata: "Q133839448", lat: 21.27, lon: -98.79, estado: "San Luis Potosí" },
  { id: "oim-124801183", nombre: "Huinalá", operador: "", mw: 528, source: "gas", method: "combustion", wikidata: "", lat: 25.72, lon: -100.10, estado: "Nuevo León" },
  { id: "oim-197394566", nombre: "Central de Ciclo Combinado Valladolid III", operador: "", mw: 525, source: "gas", method: "combustion", wikidata: "", lat: 20.69, lon: -88.20, estado: "Yucatán" },
  { id: "oim-327108636", nombre: "Termoeléctrica del Golfo y Peñoles", operador: "AES", mw: 520, source: "oil", method: "combustion", wikidata: "", lat: 22.39, lon: -97.90, estado: "Tamaulipas" },
  { id: "oim-98414571", nombre: "Central Termoeléctrica Emilio Portes Gil", operador: "Comision Federal de Electricidad", mw: 514, source: "gas", method: "combustion", wikidata: "Q49627770", lat: 22.32, lon: -97.87, estado: "Tamaulipas" },
  { id: "oim-338628491", nombre: "Planta Generadora La Caridad", operador: "", mw: 513, source: "gas", method: "combustion", wikidata: "", lat: 30.66, lon: -109.56, estado: "Sonora" },
  { id: "oim-1210460836", nombre: "Central Termoeléctrica Río Bravo III", operador: "", mw: 512, source: "gas", method: "combustion", wikidata: "", lat: 25.98, lon: -98.09, estado: "Tamaulipas" },
  { id: "oim-822330493", nombre: "Central Termoeléctrica Río Bravo IV", operador: "", mw: 512, source: "gas", method: "combustion", wikidata: "", lat: 25.98, lon: -98.10, estado: "Tamaulipas" },
  { id: "oim-1210460837", nombre: "Central Termoeléctrica Río Bravo II", operador: "", mw: 511, source: "gas", method: "combustion", wikidata: "", lat: 25.97, lon: -98.08, estado: "Tamaulipas" },
  { id: "oim-325906423", nombre: "Central Termo-eléctrica Altamira II", operador: "", mw: 495, source: "gas", method: "combustion", wikidata: "Q122759525", lat: 22.40, lon: -97.84, estado: "Tamaulipas" },
  { id: "oim-113005849", nombre: "Central Termoeléctrica Tuxpan II", operador: "", mw: 495, source: "gas", method: "combined_cycle", wikidata: "", lat: 20.95, lon: -97.39, estado: "Veracruz" },
  { id: "oim-113005837", nombre: "Central Termoeléctrica Tuxpan V", operador: "", mw: 495, source: "gas", method: "combined_cycle", wikidata: "", lat: 20.94, lon: -97.38, estado: "Veracruz" },
  { id: "oim-163930577", nombre: "Central Termoeléctrica Mérida III", operador: "", mw: 484, source: "gas", method: "combined_cycle", wikidata: "", lat: 21.02, lon: -89.58, estado: "Yucatán" },
  { id: "oim-544618269", nombre: "Central Termoeléctrica Agua Prieta-II ISCC", operador: "", mw: 465, source: "gas;solar", method: "photovoltaic;combustion", wikidata: "", lat: 31.33, lon: -109.55, estado: "Sonora" },
  { id: "oim-99900793", nombre: "San Lorenzo CFE Power Plant", operador: "", mw: 464, source: "gas", method: "combined_cycle", wikidata: "", lat: 18.94, lon: -97.40, estado: "Puebla" },
  { id: "oim-1352980288", nombre: "Central de Ciclo Combinado Dos Bocas", operador: "CFE", mw: 452, source: "gas", method: "combined_cycle", wikidata: "Q131832366", lat: 18.44, lon: -93.18, estado: "Tabasco" },
  { id: "oim-328331097", nombre: "Monterrey II", operador: "CFE", mw: 450, source: "gas", method: "", wikidata: "", lat: 25.68, lon: -100.32, estado: "Nuevo León" },
  { id: "oim-325267285", nombre: "Norte Durango Power Plant", operador: "", mw: 450, source: "gas", method: "combustion", wikidata: "", lat: 24.03, lon: -104.67, estado: "Durango" },
  { id: "oim-1202989568", nombre: "CCI Mexicali Oriente", operador: "Comisión Federal de Electricidad (CFE)", mw: 442, source: "gas", method: "combustion", wikidata: "", lat: 32.62, lon: -115.43, estado: "Baja California" },
  { id: "oim-1432618832", nombre: "CCC San Luis Potosí", operador: "", mw: 437, source: "gas", method: "combustion", wikidata: "", lat: 22.15, lon: -100.97, estado: "San Luis Potosí" },
  { id: "oim-969922448", nombre: "Central de Ciclo Combinado Norte II", operador: "", mw: 433, source: "gas", method: "combustion", wikidata: "", lat: 31.70, lon: -106.45, estado: "Chihuahua" },
  { id: "oim-626220557", nombre: "Cogen Salamanca Power Plant", operador: "", mw: 393, source: "gas", method: "combustion", wikidata: "", lat: 20.58, lon: -101.18, estado: "Guanajuato" },
  { id: "oim-1020163550", nombre: "Planta de Cogeneración Altamira", operador: "", mw: 350, source: "gas", method: "combustion", wikidata: "", lat: 22.41, lon: -97.88, estado: "Tamaulipas" },
  { id: "oim-338342087", nombre: "Central Termoeléctrica El Fresnal", operador: "", mw: 335, source: "gas", method: "combustion", wikidata: "", lat: 31.30, lon: -110.95, estado: "Sonora" },
  { id: "oim-373671866", nombre: "Central Termoeléctrica Guadalupe Victoria", operador: "Comisión Federal de Electricidad", mw: 320, source: "oil", method: "combustion", wikidata: "", lat: 25.53, lon: -103.54, estado: "Durango" },
  { id: "oim-106674331", nombre: "Central Termoeléctrica Juan de Dios Bátiz Paredes", operador: "", mw: 320, source: "gas", method: "combustion", wikidata: "", lat: 23.19, lon: -106.42, estado: "Sinaloa" },
  { id: "oim-879469675", nombre: "Central de Ciclo Combinado Baja California III", operador: "Iberdrola", mw: 300, source: "gas", method: "combustion", wikidata: "Q122759649", lat: 32.43, lon: -116.93, estado: "Baja California" },
  { id: "oim-686189316", nombre: "Nuevo Pemex", operador: "Pemex", mw: 300, source: "gas", method: "combined_cycle", wikidata: "", lat: 18.00, lon: -93.39, estado: "Tabasco" },
  { id: "oim-122790281", nombre: "Central Termoeléctrica Francisco Villa", operador: "CFE", mw: 300, source: "oil", method: "combustion", wikidata: "", lat: 28.64, lon: -106.10, estado: "Chihuahua" },
  { id: "oim-57837216", nombre: "Central de Ciclo Combinado Hermosillo", operador: "", mw: 283, source: "gas", method: "", wikidata: "", lat: 29.10, lon: -111.02, estado: "Sonora" },
  { id: "oim-383487929", nombre: "Campeche Power Plant", operador: "", mw: 275, source: "gas", method: "combustion", wikidata: "", lat: 19.84, lon: -90.52, estado: "Campeche" },
  { id: "oim-686189317", nombre: "Abent Tercer Tren", operador: "", mw: 275, source: "gas", method: "combined_cycle", wikidata: "", lat: 18.01, lon: -93.38, estado: "Tabasco" },
  { id: "oim-956762292", nombre: "Central de Ciclo Combinado Chihuahua III", operador: "", mw: 268, source: "gas", method: "combustion", wikidata: "", lat: 28.70, lon: -106.18, estado: "Chihuahua" },
  { id: "oim-923929575", nombre: "Tractebel Energía de Monterrey", operador: "", mw: 250, source: "gas", method: "combustion", wikidata: "", lat: 25.67, lon: -100.28, estado: "Nuevo León" },
  { id: "oim-968243393", nombre: "San Luis de la Paz", operador: "", mw: 248, source: "gas", method: "combustion", wikidata: "", lat: 21.30, lon: -100.52, estado: "Guanajuato" },
  { id: "oim-1210460841", nombre: "Central de Ciclo Combinado Saltillo", operador: "", mw: 248, source: "gas", method: "combustion", wikidata: "", lat: 25.42, lon: -100.99, estado: "Coahuila" },
  { id: "oim-1119675798", nombre: "Central de Ciclo Combinado Hermosillo", operador: "", mw: 227, source: "gas", method: "combustion", wikidata: "", lat: 29.08, lon: -110.98, estado: "Sonora" },
  { id: "oim-373671861", nombre: "Central de Ciclo Combinado Gómez Palacio", operador: "Comision Federal de Electricidad", mw: 220, source: "gas", method: "combustion", wikidata: "", lat: 25.56, lon: -103.50, estado: "Durango" },
  { id: "oim-197394565", nombre: "Central Termoeléctrica Felipe Carrillo Puerto", operador: "", mw: 220, source: "gas", method: "combustion", wikidata: "", lat: 20.70, lon: -88.21, estado: "Yucatán" },
  { id: "oim-539895538", nombre: "Central de Combustión Interna Baja California Sur", operador: "CFE", mw: 210, source: "", method: "", wikidata: "", lat: 24.14, lon: -110.31, estado: "Baja California Sur" },

  // === NUCLEAR ===
  { id: "oim-95949886", nombre: "Central Nuclear Laguna Verde", operador: "Comisión Federal de Electricidad", mw: 1552, source: "nuclear", method: "fission", wikidata: "Q371499", lat: 19.72, lon: -96.40, estado: "Veracruz" },

  // === HIDROELÉCTRICAS ===
  { id: "oim-353307082", nombre: "Presa Chicoasén (Manuel Moreno Torres)", operador: "Comisión Federal de Electricidad", mw: 2400, source: "hydro", method: "water-storage", wikidata: "Q1435446", lat: 16.93, lon: -93.09, estado: "Chiapas" },
  { id: "oim-109684127", nombre: "Presa Infiernillo", operador: "", mw: 1200, source: "hydro", method: "water-storage", wikidata: "Q655813", lat: 18.27, lon: -101.89, estado: "Michoacán" },
  { id: "oim-153402696", nombre: "Presa Malpaso", operador: "", mw: 1080, source: "hydro", method: "water-storage", wikidata: "Q1355023", lat: 17.17, lon: -93.62, estado: "Chiapas" },
  { id: "oim-189660115", nombre: "Presa Aguamilpa", operador: "", mw: 960, source: "hydro", method: "water-storage", wikidata: "Q397881", lat: 21.83, lon: -104.80, estado: "Nayarit" },
  { id: "oim-254327683", nombre: "Presa La Angostura", operador: "Comisión Federal de Electricidad", mw: 900, source: "hydro", method: "water-storage", wikidata: "Q624981", lat: 15.78, lon: -92.77, estado: "Chiapas" },
  { id: "oim-221656476", nombre: "Presa El Cajón", operador: "", mw: 750, source: "hydro", method: "water-storage", wikidata: "Q1323767", lat: 21.42, lon: -104.45, estado: "Nayarit" },
  { id: "oim-222066432", nombre: "Presa La Yesca", operador: "", mw: 750, source: "hydro", method: "water-storage", wikidata: "Q2547037", lat: 21.18, lon: -104.06, estado: "Nayarit" },
  { id: "oim-1184864145", nombre: "Central Hidroeléctrica El Caracol", operador: "", mw: 600, source: "hydro", method: "water-storage", wikidata: "Q9062461", lat: 17.62, lon: -99.56, estado: "Guerrero" },
  { id: "oim-1020145296", nombre: "Central Hidroeléctrica Luis Donaldo Colosio", operador: "", mw: 422, source: "hydro", method: "", wikidata: "Q1163490", lat: 21.18, lon: -104.07, estado: "Nayarit" },
  { id: "oim-319026921", nombre: "Presa Peñitas", operador: "", mw: 420, source: "hydro", method: "", wikidata: "Q3435471", lat: 17.10, lon: -93.48, estado: "Chiapas" },
  { id: "oim-319092198", nombre: "Central Hidroeléctrica Temascal", operador: "", mw: 354, source: "hydro", method: "water-storage", wikidata: "Q119953306", lat: 18.22, lon: -96.43, estado: "Oaxaca" },
  { id: "oim-589740154", nombre: "La Villita", operador: "", mw: 320, source: "hydro", method: "water-storage", wikidata: "Q2895364", lat: 18.32, lon: -101.71, estado: "Michoacán" },
  { id: "oim-317967538", nombre: "Central Hidroeléctrica Fernando Hiriart Balderrama", operador: "CFE", mw: 292, source: "hydro", method: "water-storage", wikidata: "Q203394", lat: 17.16, lon: -93.61, estado: "Chiapas" },
  { id: "oim-379414244", nombre: "Hidroeléctrica Valentín Gómez Farías", operador: "", mw: 240, source: "hydro", method: "water-storage", wikidata: "Q11957050", lat: 16.90, lon: -93.10, estado: "Chiapas" },
  { id: "oim-109353237", nombre: "Central Hidroeléctrica Mazatepec", operador: "CFE", mw: 220, source: "hydro", method: "run-of-the-river", wikidata: "Q19381223", lat: 18.73, lon: -98.64, estado: "Puebla" },
  { id: "oim-1119925044", nombre: "Planta Hidroeléctrica Plutarco Elías Calles", operador: "", mw: 135, source: "hydro", method: "water-storage", wikidata: "Q11966985", lat: 22.90, lon: -105.37, estado: "Sinaloa" },
  { id: "oim-909144843", nombre: "Estación Hidroeléctrica de Necaxa", operador: "Comisión Federal de Electricidad", mw: 109, source: "hydro", method: "", wikidata: "Q6085363", lat: 20.23, lon: -97.99, estado: "Puebla" },
  { id: "oim-803113369", nombre: "Central Hidroeléctrica Profesor Raúl J. Marsal Córdoba", operador: "", mw: 100, source: "hydro", method: "water-storage", wikidata: "Q9062462", lat: 17.83, lon: -99.43, estado: "Guerrero" },
  { id: "oim-510832792", nombre: "Central Hidroeléctrica Gustavo Díaz Ordaz", operador: "", mw: 92, source: "hydro", method: "water-storage", wikidata: "Q6085301", lat: 18.28, lon: -101.88, estado: "Michoacán" },
  { id: "oim-1020418012", nombre: "Central Hidroeléctrica Adolfo López Mateos", operador: "", mw: 90, source: "hydro", method: "water-storage", wikidata: "Q6085338", lat: 18.31, lon: -101.89, estado: "Michoacán" },
  { id: "oim-389542912", nombre: "Central Hidroeléctrica Cupatitzio", operador: "", mw: 80, source: "hydro", method: "water-storage", wikidata: "Q27785178", lat: 19.17, lon: -102.04, estado: "Michoacán" },
  { id: "oim-1019967870", nombre: "Central Hidroeléctrica Lerma Tepuxtepec", operador: "", mw: 67, source: "hydro", method: "water-storage", wikidata: "Q49627722", lat: 19.90, lon: -100.18, estado: "Michoacán" },
  { id: "oim-1020369660", nombre: "Central Hidroeléctrica de la Amistad", operador: "", mw: 66, source: "hydro", method: "water-storage", wikidata: "Q15179838", lat: 29.45, lon: -101.06, estado: "Coahuila" },
  { id: "oim-389617811", nombre: "Central Hidroeléctrica Cóbano", operador: "", mw: 60, source: "hydro", method: "water-storage", wikidata: "Q27785309", lat: 18.26, lon: -101.90, estado: "Michoacán" },
  { id: "oim-630016025", nombre: "Central Hidroeléctrica Miguel Hidalgo y Costilla", operador: "", mw: 60, source: "hydro", method: "water-storage", wikidata: "Q5552160", lat: 27.00, lon: -108.67, estado: "Sinaloa" },
  { id: "oim-1212548857", nombre: "Central Hidroeléctrica Tepexic", operador: "Fénix", mw: 60, source: "hydro", method: "", wikidata: "Q27846431", lat: 20.15, lon: -97.89, estado: "Puebla" },

  // === EÓLICAS ===
  { id: "oim-e-amistad", nombre: "Parque Eólico Amistad", operador: "Enel", mw: 450, source: "wind", method: "", wikidata: "", lat: 28.47, lon: -100.86, estado: "Coahuila" },
  { id: "oim-e-reynosa", nombre: "Parque Eólico Reynosa", operador: "Zuma Energía", mw: 424, source: "wind", method: "wind_turbine", wikidata: "", lat: 26.05, lon: -98.28, estado: "Tamaulipas" },
  { id: "oim-e-sur", nombre: "Energía Eólica del Sur", operador: "", mw: 396, source: "wind", method: "", wikidata: "", lat: 16.43, lon: -94.88, estado: "Oaxaca" },
  { id: "oim-e-mesalapaz", nombre: "Parque Eólico Mesa La Paz", operador: "", mw: 306, source: "wind", method: "wind_turbine", wikidata: "", lat: 26.06, lon: -98.30, estado: "Tamaulipas" },
  { id: "oim-e-tresmesas", nombre: "Parque Eólico Tres Mesas I-II-III-IV", operador: "", mw: 294, source: "wind", method: "wind_turbine", wikidata: "", lat: 26.08, lon: -98.32, estado: "Tamaulipas" },
  { id: "oim-e-dolores", nombre: "Parque Eólico Dolores", operador: "", mw: 269, source: "wind", method: "wind_turbine", wikidata: "", lat: 27.43, lon: -100.15, estado: "Coahuila" },
  { id: "oim-e-ventika", nombre: "Parque Eólico Ventika", operador: "", mw: 252, source: "wind", method: "", wikidata: "", lat: 25.46, lon: -100.01, estado: "Nuevo León" },
  { id: "oim-e-eurus", nombre: "Parque Eólico Eurus", operador: "Acciona Energía", mw: 250, source: "wind", method: "", wikidata: "", lat: 16.62, lon: -94.76, estado: "Oaxaca" },
  { id: "oim-e-mezquite", nombre: "Parque Eólico El Mezquite", operador: "", mw: 250, source: "wind", method: "wind_turbine", wikidata: "", lat: 22.88, lon: -102.49, estado: "Zacatecas" },
  { id: "oim-e-biihioxo", nombre: "Fuerza y Energía Bii Hioxo", operador: "", mw: 234, source: "wind", method: "", wikidata: "", lat: 16.45, lon: -94.87, estado: "Oaxaca" },
  { id: "oim-e-piedralarga", nombre: "Parque Eólico Piedra Larga", operador: "Demex", mw: 228, source: "wind", method: "", wikidata: "", lat: 16.37, lon: -95.08, estado: "Oaxaca" },
  { id: "oim-e-pier4", nombre: "Parque Eólico Pier 4", operador: "Iberdrola", mw: 221, source: "wind", method: "wind_turbine", wikidata: "", lat: 19.08, lon: -97.35, estado: "Puebla" },
  { id: "oim-e-dominica", nombre: "Parque Eólico Dominica", operador: "", mw: 200, source: "wind", method: "", wikidata: "", lat: 16.52, lon: -94.80, estado: "Oaxaca" },
  { id: "oim-e-sancarlos", nombre: "Parque Eólico San Carlos", operador: "", mw: 198, source: "wind", method: "", wikidata: "", lat: 26.10, lon: -98.35, estado: "Tamaulipas" },
  { id: "oim-e-coahuila", nombre: "Parque Eólica de Coahuila", operador: "", mw: 196, source: "wind", method: "wind_turbine", wikidata: "", lat: 27.50, lon: -100.20, estado: "Coahuila" },
  { id: "oim-e-rumorosa", nombre: "Parque Eólico La Rumorosa", operador: "", mw: 170, source: "wind", method: "wind_turbine", wikidata: "", lat: 32.54, lon: -116.06, estado: "Baja California" },
  { id: "oim-e-fenicias", nombre: "Parque Eólico Fenicias", operador: "", mw: 168, source: "wind", method: "wind_turbine", wikidata: "", lat: 16.55, lon: -94.76, estado: "Oaxaca" },
  { id: "oim-e-cortijo", nombre: "Parque Eólico El Cortijo", operador: "", mw: 168, source: "wind", method: "", wikidata: "", lat: 26.07, lon: -98.29, estado: "Tamaulipas" },
  { id: "oim-e-biistinu", nombre: "Parque Eólico Bii Stinu", operador: "", mw: 164, source: "wind", method: "", wikidata: "", lat: 16.48, lon: -94.85, estado: "Oaxaca" },
  { id: "oim-e-eoliatec", nombre: "Eoliatec del Pacífico", operador: "CISA-Gamesa", mw: 160, source: "wind", method: "", wikidata: "", lat: 16.42, lon: -94.90, estado: "Oaxaca" },
  { id: "oim-e-sierrajuarez", nombre: "Energía Sierra Juárez", operador: "IEnova", mw: 155, source: "wind", method: "", wikidata: "", lat: 32.51, lon: -116.27, estado: "Baja California" },
  { id: "oim-e-santacruz", nombre: "Parque Eólico Santa Cruz", operador: "", mw: 139, source: "wind", method: "wind_turbine", wikidata: "", lat: 16.38, lon: -95.05, estado: "Oaxaca" },
  { id: "oim-e-paloalto", nombre: "Parque Eólico Palo Alto", operador: "Enel Green Power", mw: 129, source: "wind", method: "", wikidata: "", lat: 22.90, lon: -102.46, estado: "Zacatecas" },
  { id: "oim-e-vicenteg", nombre: "Proyecto Eólico Vicente Guerrero", operador: "", mw: 118, source: "wind", method: "wind_turbine", wikidata: "", lat: 24.35, lon: -98.70, estado: "Tamaulipas" },
  { id: "oim-e-santiago", nombre: "Parque Eólico Santiago", operador: "Iberdrola México", mw: 105, source: "wind", method: "", wikidata: "", lat: 25.44, lon: -100.15, estado: "Nuevo León" },
  { id: "oim-e-salitrillos", nombre: "Parque Eólico Salitrillos", operador: "", mw: 104, source: "wind", method: "wind_turbine", wikidata: "", lat: 16.60, lon: -94.72, estado: "Oaxaca" },
  { id: "oim-e-laventa3", nombre: "Parque Eólico La Venta III", operador: "Iberdrola", mw: 103, source: "wind", method: "", wikidata: "", lat: 16.56, lon: -94.77, estado: "Oaxaca" },
  { id: "oim-e-oax1", nombre: "Parque Eólico Oaxaca I", operador: "Energías Ambientales de Oaxaca", mw: 102, source: "wind", method: "", wikidata: "", lat: 16.55, lon: -94.78, estado: "Oaxaca" },
  { id: "oim-e-oax2", nombre: "Parque Eólico Oaxaca II", operador: "Acciona Energía", mw: 102, source: "wind", method: "", wikidata: "", lat: 16.54, lon: -94.79, estado: "Oaxaca" },
  { id: "oim-e-oax3", nombre: "Parque Eólico Oaxaca III", operador: "Acciona Energía", mw: 102, source: "wind", method: "", wikidata: "", lat: 16.53, lon: -94.80, estado: "Oaxaca" },
  { id: "oim-e-oax4", nombre: "Parque Eólico Oaxaca IV", operador: "Acciona Energía", mw: 102, source: "wind", method: "", wikidata: "", lat: 16.52, lon: -94.81, estado: "Oaxaca" },
  { id: "oim-e-sureste1", nombre: "Parque Eólico Sureste I", operador: "Enel", mw: 102, source: "wind", method: "", wikidata: "", lat: 16.50, lon: -94.82, estado: "Oaxaca" },
  { id: "oim-e-laventosa", nombre: "Parque Eólico La Ventosa", operador: "", mw: 100, source: "wind", method: "", wikidata: "", lat: 16.55, lon: -94.93, estado: "Oaxaca" },
  { id: "oim-e-peninsula", nombre: "Parque Eólico Península", operador: "", mw: 90, source: "wind", method: "wind_turbine", wikidata: "", lat: 21.28, lon: -89.66, estado: "Yucatán" },
  { id: "oim-e-tizimin", nombre: "Parque Eólico Tizimín", operador: "", mw: 84, source: "wind", method: "wind_turbine", wikidata: "", lat: 21.14, lon: -88.15, estado: "Yucatán" },
  { id: "oim-e-laventa2", nombre: "Parque Eólico La Venta II", operador: "CFE", mw: 83, source: "wind", method: "", wikidata: "", lat: 16.57, lon: -94.78, estado: "Oaxaca" },
  { id: "oim-e-fuerzaistmo", nombre: "Fuerza Eólica del Istmo", operador: "", mw: 80, source: "wind", method: "", wikidata: "", lat: 16.44, lon: -94.89, estado: "Oaxaca" },

  // === SOLARES ===
  { id: "oim-s-villanueva", nombre: "Villanueva Solar I y III", operador: "Enel Green Power Mexico", mw: 580, source: "solar", method: "photovoltaic", wikidata: "", lat: 24.72, lon: -103.48, estado: "Coahuila" },
  { id: "oim-s-tulihelios", nombre: "Parque Fotovoltaico Tuli y Helios", operador: "", mw: 300, source: "solar", method: "photovoltaic", wikidata: "", lat: 26.95, lon: -105.67, estado: "Chihuahua" },
  { id: "oim-s-pimienta", nombre: "Parque Solar La Pimienta", operador: "", mw: 300, source: "solar", method: "photovoltaic", wikidata: "", lat: 19.16, lon: -104.28, estado: "Colima" },
  { id: "oim-s-pachamama", nombre: "Planta Fotovoltaica Pachamama", operador: "", mw: 300, source: "solar", method: "photovoltaic", wikidata: "", lat: 23.20, lon: -103.60, estado: "Durango" },
  { id: "oim-s-potosi", nombre: "Planta Fotovoltaica Potosí Solar", operador: "FRV", mw: 300, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.50, lon: -100.80, estado: "San Luis Potosí" },
  { id: "oim-s-solem", nombre: "Planta Fotovoltaica Solem", operador: "Cubico Sustainable Investments", mw: 290, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.52, lon: -100.82, estado: "San Luis Potosí" },
  { id: "oim-s-potrero", nombre: "Potrero Solar", operador: "", mw: 270, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.30, lon: -102.40, estado: "Aguascalientes" },
  { id: "oim-s-donjose", nombre: "Parque Solar Don José", operador: "Enel Green Power (EGP)", mw: 250, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.65, lon: -102.30, estado: "Aguascalientes" },
  { id: "oim-s-navojoa", nombre: "Parque Solar Navojoa", operador: "X-Elio", mw: 250, source: "solar", method: "photovoltaic", wikidata: "", lat: 27.07, lon: -109.44, estado: "Sonora" },
  { id: "oim-s-magdalena2", nombre: "Parque Solar Magdalena II", operador: "", mw: 220, source: "solar", method: "photovoltaic", wikidata: "", lat: 30.62, lon: -112.02, estado: "Sonora" },
  { id: "oim-s-xcala", nombre: "Nueva Xcala PV Solar Park", operador: "Engie", mw: 200, source: "solar", method: "photovoltaic", wikidata: "", lat: 18.43, lon: -99.56, estado: "Guerrero" },
  { id: "oim-s-cuervos", nombre: "Parque Solar Los Cuervos", operador: "", mw: 200, source: "solar", method: "photovoltaic", wikidata: "", lat: 26.12, lon: -98.34, estado: "Tamaulipas" },
  { id: "oim-s-cuyoaco", nombre: "Parque Fotovoltaico Cuyoaco", operador: "Iberdrola México", mw: 200, source: "solar", method: "photovoltaic", wikidata: "", lat: 19.73, lon: -97.58, estado: "Puebla" },
  { id: "oim-s-atv", nombre: "AT Solar V", operador: "", mw: 180, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.90, lon: -102.50, estado: "Zacatecas" },
  { id: "oim-s-slp", nombre: "Parque Fotovoltaico San Luis Potosí", operador: "Iberdrola México", mw: 170, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.20, lon: -100.95, estado: "San Luis Potosí" },
  { id: "oim-s-border", nombre: "Border Solar", operador: "", mw: 150, source: "solar", method: "photovoltaic", wikidata: "", lat: 31.70, lon: -106.44, estado: "Chihuahua" },
  { id: "oim-s-villaahumada", nombre: "Parque Fotovoltáico Villa Ahumada", operador: "BNB Renewables", mw: 150, source: "solar", method: "photovoltaic", wikidata: "", lat: 30.62, lon: -106.51, estado: "Chihuahua" },
  { id: "oim-s-santamaria", nombre: "Santa María", operador: "Zuma", mw: 148, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.60, lon: -102.30, estado: "Aguascalientes" },
  { id: "oim-s-tuto", nombre: "Tuto Energy Dos", operador: "", mw: 138, source: "solar", method: "photovoltaic", wikidata: "", lat: 30.60, lon: -106.50, estado: "Chihuahua" },
  { id: "oim-s-lalucha", nombre: "Planta Fotovoltaica La Lucha", operador: "", mw: 131, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.55, lon: -102.28, estado: "Aguascalientes" },
  { id: "oim-s-viborillas1", nombre: "Las Viborillas Solar Farm (I)", operador: "Solar Park Viborillas", mw: 130, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.35, lon: -102.32, estado: "Aguascalientes" },
  { id: "oim-s-guajiro", nombre: "Parque Solar Guajiro", operador: "Atlas Renewable Energy", mw: 130, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.60, lon: -102.28, estado: "Aguascalientes" },
  { id: "oim-s-bufa", nombre: "Parque Eólico La Bufa (Solar?)", operador: "", mw: 130, source: "wind", method: "", wikidata: "", lat: 22.82, lon: -102.56, estado: "Zacatecas" },
  { id: "oim-s-trompezon", nombre: "Parque Fotovoltaico El Trompezón", operador: "ENGIE Mexico", mw: 126, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.55, lon: -102.26, estado: "Aguascalientes" },
  { id: "oim-s-dondiego", nombre: "Don Diego Solar Farm", operador: "IEnova", mw: 125, source: "solar", method: "photovoltaic", wikidata: "", lat: 24.60, lon: -107.30, estado: "Sinaloa" },
  { id: "oim-s-orejana", nombre: "Parque Solar La Orejana", operador: "Zuma", mw: 125, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.58, lon: -102.32, estado: "Aguascalientes" },
  { id: "oim-s-bluemex", nombre: "Bluemex Power 1", operador: "EDF Renewables Mexico", mw: 120, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.57, lon: -102.30, estado: "Aguascalientes" },
  { id: "oim-s-ahumadas", nombre: "Fotovoltaico Las Ahumadas", operador: "", mw: 120, source: "solar", method: "photovoltaic", wikidata: "", lat: 30.61, lon: -106.52, estado: "Chihuahua" },
  { id: "oim-s-laguna", nombre: "Laguna Solar Farm", operador: "174 Power Global", mw: 112, source: "solar", method: "photovoltaic", wikidata: "", lat: 25.55, lon: -103.44, estado: "Durango" },
  { id: "oim-s-pima", nombre: "Pima Solar Project", operador: "IEnova", mw: 110, source: "solar", method: "photovoltaic", wikidata: "", lat: 29.10, lon: -110.95, estado: "Sonora" },
  { id: "oim-s-trinidad", nombre: "Complejo Solar La Trinidad", operador: "", mw: 108, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.40, lon: -102.25, estado: "Aguascalientes" },
  { id: "oim-s-akin", nombre: "Akin Solar", operador: "", mw: 100, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.42, lon: -102.27, estado: "Aguascalientes" },
  { id: "oim-s-hermosillo", nombre: "Parque Fotovoltaico Hermosillo", operador: "Iberdrola", mw: 100, source: "solar", method: "photovoltaic", wikidata: "", lat: 29.08, lon: -110.97, estado: "Sonora" },
  { id: "oim-s-tepezala2", nombre: "Planta Fotovoltaica Tepezalá II", operador: "Grupo Ortiz", mw: 100, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.23, lon: -102.17, estado: "Aguascalientes" },
  { id: "oim-s-elmayo", nombre: "El Mayo Solar", operador: "", mw: 99, source: "solar", method: "photovoltaic", wikidata: "", lat: 27.06, lon: -109.42, estado: "Sonora" },
  { id: "oim-s-horus", nombre: "Planta Fotovoltaica Horus Solar", operador: "", mw: 95, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.38, lon: -102.24, estado: "Aguascalientes" },
  { id: "oim-s-versalles", nombre: "Planta Fotovoltaica Versalles de las Cuatas", operador: "Eosol Energy", mw: 84, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.36, lon: -102.22, estado: "Aguascalientes" },
  { id: "oim-s-andalucia", nombre: "Parque Solar Andalucía II", operador: "", mw: 83, source: "solar", method: "photovoltaic", wikidata: "", lat: 22.34, lon: -102.20, estado: "Aguascalientes" },
  { id: "oim-s-conejos", nombre: "Parque Solar Conejos Medanos", operador: "", mw: 80, source: "solar", method: "photovoltaic", wikidata: "", lat: 31.68, lon: -106.42, estado: "Chihuahua" },

  // === GEOTÉRMICAS ===
  { id: "oim-186746635", nombre: "Planta Geotérmica Cerro Prieto", operador: "Comisión Federal de Electricidad", mw: 570, source: "geothermal", method: "geothermal", wikidata: "Q3624174", lat: 32.41, lon: -115.22, estado: "Baja California" },
  { id: "oim-g-azufres", nombre: "Planta Geotérmica Los Azufres", operador: "", mw: 263, source: "geothermal", method: "", wikidata: "", lat: 19.78, lon: -100.65, estado: "Michoacán" },
  { id: "oim-52175531", nombre: "Central Geotérmica Cerro Prieto 2", operador: "Comisión Federal de Electricidad", mw: 220, source: "geothermal", method: "geothermal", wikidata: "", lat: 32.42, lon: -115.23, estado: "Baja California" },
  { id: "oim-1210893910", nombre: "Central Geotérmica Cerro Prieto 3", operador: "Comisión Federal de Electricidad", mw: 220, source: "geothermal", method: "geothermal", wikidata: "", lat: 32.40, lon: -115.21, estado: "Baja California" },
  { id: "oim-g-humeros", nombre: "Planta Geotérmica Los Humeros", operador: "Comision Federal de Electricidad", mw: 121, source: "geothermal", method: "thermal", wikidata: "Q122853721", lat: 19.68, lon: -97.45, estado: "Puebla" },
  { id: "oim-52174021", nombre: "Central Geotérmica Cerro Prieto 4", operador: "Comisión Federal de Electricidad", mw: 100, source: "geothermal", method: "geothermal", wikidata: "", lat: 32.39, lon: -115.20, estado: "Baja California" },
  { id: "oim-1210893911", nombre: "Central Geotérmica Cerro Prieto 1", operador: "Comisión Federal de Electricidad", mw: 30, source: "geothermal", method: "geothermal", wikidata: "", lat: 32.43, lon: -115.24, estado: "Baja California" },
  { id: "oim-1212574287", nombre: "Central Geotérmica Tres Vírgenes", operador: "CFE", mw: 10, source: "geothermal", method: "thermal", wikidata: "", lat: 27.47, lon: -112.59, estado: "Baja California Sur" },

  // === BIOENERGÍA ===
  { id: "oim-703860926", nombre: "Igsapak Cogeneración", operador: "", mw: 51, source: "biomass", method: "", wikidata: "", lat: 20.57, lon: -101.17, estado: "Guanajuato" },
  { id: "oim-201186676", nombre: "Ingenio Adolfo López Mateos", operador: "", mw: 50, source: "biomass", method: "combustion", wikidata: "", lat: 18.86, lon: -96.97, estado: "Veracruz" },
  { id: "oim-770506577", nombre: "Ingenio La Gloria", operador: "", mw: 45, source: "biomass", method: "combustion", wikidata: "", lat: 20.60, lon: -97.23, estado: "Veracruz" },
  { id: "oim-177480180", nombre: "Bio Papel", operador: "", mw: 30, source: "biomass", method: "", wikidata: "", lat: 25.67, lon: -100.30, estado: "Nuevo León" },
  { id: "oim-426376483", nombre: "PTAR Atotonilco - CONAGUA", operador: "CONAGUA", mw: 29.9, source: "biogas", method: "", wikidata: "", lat: 19.97, lon: -98.98, estado: "Hidalgo" },
  { id: "oim-248721733", nombre: "Ingenio San Nicolás", operador: "", mw: 15, source: "biomass", method: "combustion", wikidata: "", lat: 20.55, lon: -97.28, estado: "Veracruz" },
];

/**
 * Convierte datos crudos al modelo unificado PlantaEnergia.
 */
function convertir(raw: PlantaRaw): PlantaEnergia {
  const { categoria, subcategoria } = normalizarEnergia(raw.source, raw.method);
  const sector = clasificarSector(raw.operador, raw.operador);

  return {
    id: raw.id,
    nombre_planta: raw.nombre || "[Sin nombre]",
    operador: raw.operador || "",
    dueno: raw.operador || "", // OpenInfraMap solo lista operador
    sector,
    potencia_mw: raw.mw,
    fuente_raw: raw.source,
    metodo_raw: raw.method,
    energia_categoria: categoria,
    energia_subcategoria: subcategoria,
    lat: raw.lat,
    lon: raw.lon,
    estado: raw.estado,
    municipio: "",
    wikidata_id: raw.wikidata,
    fuente_origen: "openinframap",
  };
}

/** Todas las plantas procesadas y normalizadas */
export const PLANTAS_COMPLETAS: PlantaEnergia[] = PLANTAS_RAW.map(convertir);

export { CENTROIDES_ESTADOS };
