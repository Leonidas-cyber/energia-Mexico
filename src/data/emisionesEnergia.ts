/**
 * Emisiones de CO₂ por tipo de energía y país.
 * Fuentes: IEA World Energy Outlook 2024, BP Statistical Review 2024, Our World in Data.
 * NOTA: Los datos representan estimaciones basadas en fuentes públicas internacionales.
 */

export interface EmisionPais {
  pais: string;
  codigo: string;
  emisionesMt: number; // Millones de toneladas de CO₂/año
  intensidad: number;  // gCO₂/kWh generado
  descripcion: string;
}

export interface EmisionesEnergia {
  titulo: string;
  factorEmision: string; // gCO₂/kWh promedio mundial
  descripcionImpacto: string;
  top5: EmisionPais[];
  mexico: EmisionPais;
  mundialMt: number; // Total mundial Mt CO₂/año de este sector
}

export const EMISIONES_DATA: Record<string, EmisionesEnergia> = {
  solar: {
    titulo: "Emisiones de CO₂ — Energía Solar",
    factorEmision: "20-50 gCO₂/kWh (ciclo de vida)",
    descripcionImpacto: "La energía solar tiene emisiones casi nulas en operación. Las emisiones de ciclo de vida provienen de la manufactura de paneles (silicio, vidrio) y transporte.",
    mundialMt: 45,
    top5: [
      { pais: "China", codigo: "CN", emisionesMt: 25, intensidad: 45, descripcion: "Mayor fabricante de paneles; emisiones concentradas en manufactura con carbón" },
      { pais: "India", codigo: "IN", emisionesMt: 5, intensidad: 40, descripcion: "Manufactura creciente de paneles, red eléctrica aún dependiente del carbón" },
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 4, intensidad: 30, descripcion: "Manufactura limpia; emisiones bajas en ciclo de vida" },
      { pais: "Japón", codigo: "JP", emisionesMt: 3, intensidad: 35, descripcion: "Alta eficiencia en paneles reduce emisiones por kWh" },
      { pais: "Alemania", codigo: "DE", emisionesMt: 2, intensidad: 28, descripcion: "Manufactura europea con energía más limpia" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 0.5, intensidad: 35, descripcion: "Paneles mayormente importados; emisiones de ciclo de vida moderadas" },
  },
  eolica: {
    titulo: "Emisiones de CO₂ — Energía Eólica",
    factorEmision: "7-15 gCO₂/kWh (ciclo de vida)",
    descripcionImpacto: "La energía eólica tiene las emisiones más bajas de todas las fuentes. Las emisiones provienen de la manufactura de turbinas (acero, fibra de vidrio) e instalación.",
    mundialMt: 15,
    top5: [
      { pais: "China", codigo: "CN", emisionesMt: 6.5, intensidad: 15, descripcion: "Mayor fabricante de turbinas; acero producido con carbón" },
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 2.2, intensidad: 11, descripcion: "Manufactura doméstica y logística eficiente" },
      { pais: "Alemania", codigo: "DE", emisionesMt: 1.0, intensidad: 10, descripcion: "Industria eólica madura con cadena de suministro optimizada" },
      { pais: "India", codigo: "IN", emisionesMt: 0.8, intensidad: 13, descripcion: "Fabricación local de turbinas en expansión" },
      { pais: "Brasil", codigo: "BR", emisionesMt: 0.4, intensidad: 9, descripcion: "Manufactura con energía hidro reduce huella de carbono" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 0.1, intensidad: 12, descripcion: "Turbinas importadas; baja huella operativa" },
  },
  hidroelectrica: {
    titulo: "Emisiones de CO₂ — Energía Hidroeléctrica",
    factorEmision: "4-30 gCO₂/kWh (varía por embalse)",
    descripcionImpacto: "Las emisiones de las hidroeléctricas provienen de la descomposición de materia orgánica en embalses (metano) y de la construcción. Los embalses tropicales emiten más.",
    mundialMt: 80,
    top5: [
      { pais: "Brasil", codigo: "BR", emisionesMt: 28, intensidad: 30, descripcion: "Embalses tropicales emiten metano significativo; Belo Monte es controvertida" },
      { pais: "China", codigo: "CN", emisionesMt: 22, intensidad: 8, descripcion: "Mega-presas en zonas templadas con menores emisiones relativas" },
      { pais: "Canadá", codigo: "CA", emisionesMt: 8, intensidad: 10, descripcion: "Embalses boreales con emisiones moderadas de metano" },
      { pais: "India", codigo: "IN", emisionesMt: 6, intensidad: 15, descripcion: "Presas himalayanas con sedimentación y emisiones variables" },
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 5, intensidad: 5, descripcion: "Infraestructura madura con bajas emisiones operativas" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 1.5, intensidad: 12, descripcion: "Embalses en clima tropical-templado; emisiones de metano moderadas en Chiapas" },
  },
  termica: {
    titulo: "Emisiones de CO₂ — Generación a Gas Natural",
    factorEmision: "350-500 gCO₂/kWh",
    descripcionImpacto: "El gas natural es el combustible fósil con menores emisiones de CO₂ por kWh, pero sigue siendo una fuente significativa. Las plantas de ciclo combinado son más eficientes.",
    mundialMt: 6500,
    top5: [
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 1750, intensidad: 410, descripcion: "Mayor consumidor de gas para electricidad; ciclo combinado eficiente" },
      { pais: "China", codigo: "CN", emisionesMt: 950, intensidad: 420, descripcion: "Transición de carbón a gas reduce emisiones relativas" },
      { pais: "Rusia", codigo: "RU", emisionesMt: 720, intensidad: 450, descripcion: "Plantas más antiguas con menor eficiencia térmica" },
      { pais: "Japón", codigo: "JP", emisionesMt: 480, intensidad: 400, descripcion: "GNL importado con plantas de alta eficiencia" },
      { pais: "Arabia Saudita", codigo: "SA", emisionesMt: 320, intensidad: 480, descripcion: "Alta demanda de climatización impulsa consumo de gas" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 130, intensidad: 415, descripcion: "Ciclo combinado moderno pero dependiente de gas importado de EE.UU." },
  },
  carboelectrica: {
    titulo: "Emisiones de CO₂ — Generación a Carbón",
    factorEmision: "800-1200 gCO₂/kWh",
    descripcionImpacto: "El carbón es la fuente de energía con mayores emisiones de CO₂ por kWh. Es el principal contribuyente al cambio climático en el sector eléctrico mundial.",
    mundialMt: 14800,
    top5: [
      { pais: "China", codigo: "CN", emisionesMt: 7800, intensidad: 900, descripcion: "Mayor emisor mundial; 60% de electricidad proviene del carbón" },
      { pais: "India", codigo: "IN", emisionesMt: 2600, intensidad: 1050, descripcion: "Carbón de baja calidad con alta intensidad de emisiones" },
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 1200, intensidad: 950, descripcion: "En retiro acelerado; reducción del 50% desde 2010" },
      { pais: "Japón", codigo: "JP", emisionesMt: 380, intensidad: 850, descripcion: "Plantas ultra-supercríticas más eficientes" },
      { pais: "Indonesia", codigo: "ID", emisionesMt: 350, intensidad: 1000, descripcion: "Expansión del carbón para electrificación rural" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 42, intensidad: 980, descripcion: "Dos carboeléctricas en Coahuila; en proceso de reconversión o retiro" },
  },
  petroleo: {
    titulo: "Emisiones de CO₂ — Generación con Petróleo",
    factorEmision: "650-900 gCO₂/kWh",
    descripcionImpacto: "La generación con derivados del petróleo (fuel oil, diésel) es altamente contaminante. Su uso está en declive global por costos y emisiones.",
    mundialMt: 2800,
    top5: [
      { pais: "Arabia Saudita", codigo: "SA", emisionesMt: 550, intensidad: 750, descripcion: "Quema de crudo para electricidad; en transición a gas y solar" },
      { pais: "Irak", codigo: "IQ", emisionesMt: 180, intensidad: 850, descripcion: "Infraestructura dañada genera alta intensidad de emisiones" },
      { pais: "Irán", codigo: "IR", emisionesMt: 160, intensidad: 800, descripcion: "Fuel oil subsidiado en plantas térmicas antiguas" },
      { pais: "Japón", codigo: "JP", emisionesMt: 80, intensidad: 700, descripcion: "Plantas de respaldo con uso decreciente" },
      { pais: "Cuba", codigo: "CU", emisionesMt: 25, intensidad: 900, descripcion: "Alta dependencia de fuel oil pesado con tecnología obsoleta" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 65, intensidad: 780, descripcion: "Plantas de fuel oil y diésel en retiro; sustitución por gas natural" },
  },
  gas_natural: {
    titulo: "Emisiones de CO₂ — Producción y Quema de Gas Natural",
    factorEmision: "180-250 gCO₂/GJ (producción + procesamiento)",
    descripcionImpacto: "Las emisiones del sector de gas natural incluyen fugas de metano (venteo/quema), procesamiento y transporte. El metano tiene 80x más potencial de calentamiento que el CO₂.",
    mundialMt: 7600,
    top5: [
      { pais: "Rusia", codigo: "RU", emisionesMt: 1800, intensidad: 0, descripcion: "Mayores fugas de metano del mundo en gasoductos y pozos" },
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 1650, intensidad: 0, descripcion: "Fracking genera emisiones fugitivas; regulación en mejora" },
      { pais: "Irán", codigo: "IR", emisionesMt: 750, intensidad: 0, descripcion: "Quema de gas asociado (flaring) por falta de infraestructura" },
      { pais: "China", codigo: "CN", emisionesMt: 650, intensidad: 0, descripcion: "Crecimiento rápido de consumo y producción" },
      { pais: "Arabia Saudita", codigo: "SA", emisionesMt: 480, intensidad: 0, descripcion: "Gas asociado a producción petrolera" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 85, intensidad: 0, descripcion: "Emisiones por quema y venteo en PEMEX; dependencia de importaciones reduce emisiones domésticas" },
  },
  nuclear: {
    titulo: "Emisiones de CO₂ — Energía Nuclear",
    factorEmision: "5-15 gCO₂/kWh (ciclo de vida)",
    descripcionImpacto: "La energía nuclear es una de las fuentes con menores emisiones de CO₂. Las emisiones provienen de la minería de uranio, construcción de plantas y gestión de residuos.",
    mundialMt: 25,
    top5: [
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 7, intensidad: 12, descripcion: "Flota nuclear madura; evita ~500 Mt CO₂/año vs gas" },
      { pais: "Francia", codigo: "FR", emisionesMt: 4, intensidad: 6, descripcion: "Electricidad más limpia de Europa gracias a la nuclear" },
      { pais: "China", codigo: "CN", emisionesMt: 4, intensidad: 10, descripcion: "Nuclear evita emisiones masivas de carbón" },
      { pais: "Rusia", codigo: "RU", emisionesMt: 2.5, intensidad: 12, descripcion: "Exportación de tecnología nuclear como herramienta climática" },
      { pais: "Corea del Sur", codigo: "KR", emisionesMt: 2, intensidad: 10, descripcion: "Nuclear clave para objetivos de carbono neutralidad 2050" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 0.1, intensidad: 10, descripcion: "Laguna Verde evita ~10 Mt CO₂/año que se emitirían con gas" },
  },
  geotermica: {
    titulo: "Emisiones de CO₂ — Energía Geotérmica",
    factorEmision: "15-55 gCO₂/kWh",
    descripcionImpacto: "La geotérmica tiene emisiones bajas. Los gases volcánicos (CO₂, H₂S) se liberan naturalmente durante la extracción de vapor. Plantas de ciclo cerrado reducen emisiones.",
    mundialMt: 8,
    top5: [
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 2.5, intensidad: 40, descripcion: "The Geysers tiene emisiones moderadas por gases volcánicos" },
      { pais: "Indonesia", codigo: "ID", emisionesMt: 1.8, intensidad: 50, descripcion: "Campos volcánicos con mayor contenido de gases" },
      { pais: "Filipinas", codigo: "PH", emisionesMt: 1.2, intensidad: 45, descripcion: "Campos maduros con tecnología de reinyección" },
      { pais: "Turquía", codigo: "TR", emisionesMt: 1.0, intensidad: 55, descripcion: "Mayor intensidad por características geológicas de Anatolia" },
      { pais: "Nueva Zelanda", codigo: "NZ", emisionesMt: 0.5, intensidad: 30, descripcion: "Plantas de ciclo cerrado con bajas emisiones" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 0.4, intensidad: 42, descripcion: "Cerro Prieto libera gases volcánicos; Los Azufres más limpio con reinyección" },
  },
  bioenergia: {
    titulo: "Emisiones de CO₂ — Bioenergía",
    factorEmision: "50-100 gCO₂/kWh (netas, ciclo de vida)",
    descripcionImpacto: "La bioenergía se considera carbono-neutral en teoría (el CO₂ emitido fue absorbido por las plantas). Sin embargo, las emisiones netas dependen de la sostenibilidad del cultivo.",
    mundialMt: 35,
    top5: [
      { pais: "Brasil", codigo: "BR", emisionesMt: 8, intensidad: 60, descripcion: "Bagazo de caña con ciclo cerrado de carbono; etanol reduce emisiones netas" },
      { pais: "China", codigo: "CN", emisionesMt: 7, intensidad: 80, descripcion: "Biomasa agrícola con eficiencia variable" },
      { pais: "Estados Unidos", codigo: "US", emisionesMt: 5, intensidad: 70, descripcion: "Waste-to-energy urbano y biomasa forestal" },
      { pais: "India", codigo: "IN", emisionesMt: 5, intensidad: 85, descripcion: "Biomasa con combustión poco eficiente en zonas rurales" },
      { pais: "Alemania", codigo: "DE", emisionesMt: 3, intensidad: 55, descripcion: "Biogás con captura de metano; emisiones netas bajas" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 0.3, intensidad: 75, descripcion: "Potencial de cogeneración azucarera con bajas emisiones netas" },
  },
  hidrogeno_verde: {
    titulo: "Emisiones de CO₂ — Hidrógeno Verde",
    factorEmision: "0-5 gCO₂/kWh (producción con renovables)",
    descripcionImpacto: "El hidrógeno verde producido con electrólisis y energía renovable tiene emisiones cercanas a cero. El hidrógeno gris (de gas natural) emite ~10 kg CO₂/kg H₂.",
    mundialMt: 0.5,
    top5: [
      { pais: "Australia", codigo: "AU", emisionesMt: 0.1, intensidad: 2, descripcion: "Proyectos piloto con energía solar y eólica; emisiones mínimas" },
      { pais: "Chile", codigo: "CL", emisionesMt: 0.05, intensidad: 1, descripcion: "Electrólisis con solar en Atacama; potencialmente el más limpio" },
      { pais: "Arabia Saudita", codigo: "SA", emisionesMt: 0.05, intensidad: 3, descripcion: "NEOM usa solar y eólica para electrólisis" },
      { pais: "Alemania", codigo: "DE", emisionesMt: 0.04, intensidad: 4, descripcion: "Mezcla eléctrica aún con carbón eleva emisiones de ciclo de vida" },
      { pais: "India", codigo: "IN", emisionesMt: 0.02, intensidad: 5, descripcion: "Proyectos piloto con solar; red eléctrica aún sucia" },
    ],
    mexico: { pais: "México", codigo: "MX", emisionesMt: 0.001, intensidad: 3, descripcion: "Potencial de producción limpia con solar en Sonora; sin proyectos operativos significativos" },
  },
};
