import type { EnergiaCategoria } from "@/types/energy";

export interface PlantaGrande {
  nombre: string;
  capacidadMW: number;
  ubicacion: string;
  coords: [number, number]; // [lon, lat]
}

export interface Reserva {
  pais: string;
  codigo: string;
  cantidad: string;
  porcentajeMundial: number;
}

export interface PaisPotencia {
  pais: string;
  codigo: string;
  capacidadGW: number;
  porcentajeMundial: number;
  descripcion: string;
  dato_clave: string;
  plantaMasGrande: PlantaGrande;
}

export interface MexicoComparacion {
  capacidadGW: number;
  rankingMundial: number;
  fortalezas: string;
  retos: string;
  potencial: string;
  plantaMasGrande: PlantaGrande;
}

export interface PotenciaMundialData {
  titulo: string;
  subtitulo: string;
  unidad: string;
  top5: PaisPotencia[];
  mexico: MexicoComparacion;
  totalMundialGW: number;
  recursoTileUrl?: string;
  recursoLegend?: { label: string; colors: string[]; min: string; max: string };
  /** Top countries by reserves */
  reservas?: {
    titulo: string;
    unidad: string;
    top5: Reserva[];
    mexico?: Reserva;
  };
}

export const POTENCIAS_DATA: Record<string, PotenciaMundialData> = {
  solar: {
    titulo: "Energía Solar Fotovoltaica",
    subtitulo: "Capacidad instalada de generación solar (2024)",
    unidad: "GW",
    totalMundialGW: 1419,
    recursoTileUrl: "https://api.globalsolaratlas.info/map?service=WMS&version=1.1.1&request=GetMap&layers=GHI&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true",
    recursoLegend: { label: "Irradiación Solar (GHI kWh/m²/día)", colors: ["#ffffcc", "#fed976", "#fd8d3c", "#e31a1c", "#800026"], min: "Baja", max: "Alta" },
    reservas: {
      titulo: "Recurso Solar — Mayor Irradiación (GHI promedio)",
      unidad: "kWh/m²/día",
      top5: [
        { pais: "Chile (Atacama)", codigo: "CL", cantidad: "7.5", porcentajeMundial: 0 },
        { pais: "Arabia Saudita", codigo: "SA", cantidad: "6.8", porcentajeMundial: 0 },
        { pais: "Australia", codigo: "AU", cantidad: "6.5", porcentajeMundial: 0 },
        { pais: "México (Sonora)", codigo: "MX", cantidad: "6.3", porcentajeMundial: 0 },
        { pais: "Egipto", codigo: "EG", cantidad: "6.2", porcentajeMundial: 0 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "5.5-6.5", porcentajeMundial: 0 },
    },
    top5: [
      { pais: "China", codigo: "CN", capacidadGW: 609.2, porcentajeMundial: 42.9, descripcion: "Líder indiscutible en manufactura de paneles y despliegue masivo. Produce más del 80% de los paneles solares del mundo.", dato_clave: "Instaló 217 GW solo en 2023, más que cualquier país en su historia total.", plantaMasGrande: { nombre: "Parque Solar Golmud (Tengger Desert)", capacidadMW: 2800, ubicacion: "Qinghai / Mongolia Interior", coords: [100.0, 37.0] } },
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 175.2, porcentajeMundial: 12.3, descripcion: "Segundo mercado global impulsado por el Inflation Reduction Act y créditos fiscales federales.", dato_clave: "California genera más del 25% de su electricidad con solar.", plantaMasGrande: { nombre: "Solar Star", capacidadMW: 579, ubicacion: "Kern County, California", coords: [-118.6, 34.8] } },
      { pais: "India", codigo: "IN", capacidadGW: 90.8, porcentajeMundial: 6.4, descripcion: "Crecimiento acelerado con la Alianza Solar Internacional y mega-parques solares en Rajasthan y Gujarat.", dato_clave: "Meta de 500 GW renovables para 2030.", plantaMasGrande: { nombre: "Bhadla Solar Park", capacidadMW: 2245, ubicacion: "Rajasthan", coords: [71.9, 27.5] } },
      { pais: "Japón", codigo: "JP", capacidadGW: 87.0, porcentajeMundial: 6.1, descripcion: "Pionero en tecnología solar, con despliegue masivo post-Fukushima.", dato_clave: "Mayor densidad solar per cápita entre las grandes economías.", plantaMasGrande: { nombre: "Setouchi Kirei Solar Power Plant", capacidadMW: 235, ubicacion: "Okayama", coords: [134.1, 34.6] } },
      { pais: "Alemania", codigo: "DE", capacidadGW: 81.7, porcentajeMundial: 5.8, descripcion: "Pionero europeo con la Energiewende. Alta penetración en techos residenciales.", dato_clave: "En días soleados, la solar cubre más del 50% de la demanda eléctrica.", plantaMasGrande: { nombre: "Solarpark Witznitz", capacidadMW: 650, ubicacion: "Sajonia", coords: [12.4, 51.2] } },
    ],
    mexico: { capacidadGW: 12.3, rankingMundial: 14, fortalezas: "Irradiación solar excepcional (5.5-6.5 kWh/m²/día en el noroeste).", retos: "Incertidumbre regulatoria y limitada infraestructura de transmisión.", potencial: "Podría quintuplicar su capacidad solar aprovechando el Desierto de Sonora.", plantaMasGrande: { nombre: "Parque Solar Villanueva", capacidadMW: 828, ubicacion: "Viesca, Coahuila", coords: [-102.8, 25.3] } },
  },
  eolica: {
    titulo: "Energía Eólica",
    subtitulo: "Capacidad instalada terrestre y marina (2024)",
    unidad: "GW",
    totalMundialGW: 1021,
    recursoLegend: { label: "Velocidad del Viento (m/s a 100m)", colors: ["#d4eac7", "#66b032", "#007f5f", "#023e8a", "#03045e"], min: "Baja", max: "Alta" },
    reservas: {
      titulo: "Recurso Eólico — Mayor Potencial de Viento",
      unidad: "m/s promedio",
      top5: [
        { pais: "Dinamarca", codigo: "DK", cantidad: "8.5", porcentajeMundial: 0 },
        { pais: "Irlanda", codigo: "IE", cantidad: "8.2", porcentajeMundial: 0 },
        { pais: "Reino Unido", codigo: "GB", cantidad: "7.8", porcentajeMundial: 0 },
        { pais: "Patagonia (Argentina)", codigo: "AR", cantidad: "9.0+", porcentajeMundial: 0 },
        { pais: "Istmo de Tehuantepec (México)", codigo: "MX", cantidad: "8.0+", porcentajeMundial: 0 },
      ],
      mexico: { pais: "México (Istmo)", codigo: "MX", cantidad: "8.0+", porcentajeMundial: 0 },
    },
    top5: [
      { pais: "China", codigo: "CN", capacidadGW: 441.0, porcentajeMundial: 43.2, descripcion: "Domina eólica terrestre y marina. Mayores fabricantes de turbinas del mundo.", dato_clave: "Instaló 76 GW eólicos en 2023.", plantaMasGrande: { nombre: "Gansu Wind Farm (Jiuquan)", capacidadMW: 8000, ubicacion: "Gansu", coords: [98.5, 39.7] } },
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 150.9, porcentajeMundial: 14.8, descripcion: "Corredor eólico en las Grandes Planicies.", dato_clave: "Texas tiene más capacidad eólica que la mayoría de los países.", plantaMasGrande: { nombre: "Alta Wind Energy Center", capacidadMW: 1548, ubicacion: "Tehachapi, California", coords: [-118.3, 35.1] } },
      { pais: "Alemania", codigo: "DE", capacidadGW: 69.8, porcentajeMundial: 6.8, descripcion: "Líder europeo con fuerte presencia en el Mar del Norte.", dato_clave: "La eólica es la principal fuente renovable del país.", plantaMasGrande: { nombre: "Gode Wind 1+2", capacidadMW: 582, ubicacion: "Mar del Norte", coords: [7.1, 54.1] } },
      { pais: "India", codigo: "IN", capacidadGW: 46.2, porcentajeMundial: 4.5, descripcion: "Concentrada en Tamil Nadu, Gujarat y Rajasthan.", dato_clave: "Potencial eólico estimado de 302 GW a 100m.", plantaMasGrande: { nombre: "Muppandal Wind Farm", capacidadMW: 1500, ubicacion: "Tamil Nadu", coords: [77.5, 8.2] } },
      { pais: "Brasil", codigo: "BR", capacidadGW: 30.2, porcentajeMundial: 3.0, descripcion: "Líder latinoamericano con parques eólicos en el nordeste.", dato_clave: "La eólica representa más del 12% de la generación eléctrica.", plantaMasGrande: { nombre: "Complexo Eólico Lagoa dos Ventos", capacidadMW: 716, ubicacion: "Piauí", coords: [-41.6, -8.5] } },
    ],
    mexico: { capacidadGW: 7.3, rankingMundial: 18, fortalezas: "Istmo de Tehuantepec con vientos clase mundial (>8 m/s).", retos: "Conflictos sociales y capacidad de transmisión limitada desde Oaxaca.", potencial: "Potencial de 50+ GW en Oaxaca, Tamaulipas, Baja California y Zacatecas.", plantaMasGrande: { nombre: "Parque Eólico Reynosa", capacidadMW: 424, ubicacion: "Reynosa, Tamaulipas", coords: [-98.3, 26.1] } },
  },
  hidroelectrica: {
    titulo: "Energía Hidroeléctrica",
    subtitulo: "Capacidad instalada de generación hidráulica (2024)",
    unidad: "GW",
    totalMundialGW: 1416,
    recursoLegend: { label: "Precipitación media anual (mm/año)", colors: ["#deebf7", "#9ecae1", "#4292c6", "#2171b5", "#084594"], min: "Seca", max: "Húmeda" },
    reservas: {
      titulo: "Recurso Hídrico — Mayor Potencial Hidroeléctrico Técnico",
      unidad: "GW potencial",
      top5: [
        { pais: "China", codigo: "CN", cantidad: "694", porcentajeMundial: 15.3 },
        { pais: "Rusia", codigo: "RU", cantidad: "382", porcentajeMundial: 8.4 },
        { pais: "Brasil", codigo: "BR", cantidad: "260", porcentajeMundial: 5.7 },
        { pais: "India", codigo: "IN", cantidad: "245", porcentajeMundial: 5.4 },
        { pais: "Canadá", codigo: "CA", cantidad: "210", porcentajeMundial: 4.6 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "17", porcentajeMundial: 0.4 },
    },
    top5: [
      { pais: "China", codigo: "CN", capacidadGW: 421.0, porcentajeMundial: 29.7, descripcion: "Hogar de las Tres Gargantas (22.5 GW), la mayor presa del mundo.", dato_clave: "Las Tres Gargantas genera más electricidad que cualquier otra planta.", plantaMasGrande: { nombre: "Presa de las Tres Gargantas", capacidadMW: 22500, ubicacion: "Hubei, Río Yangtze", coords: [111.0, 30.8] } },
      { pais: "Brasil", codigo: "BR", capacidadGW: 109.4, porcentajeMundial: 7.7, descripcion: "Columna vertebral energética con Itaipú (14 GW) y Belo Monte.", dato_clave: "Más del 60% de la electricidad brasileña es hidro.", plantaMasGrande: { nombre: "Itaipú (compartida con Paraguay)", capacidadMW: 14000, ubicacion: "Foz do Iguaçu, Paraná", coords: [-54.6, -25.4] } },
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 102.0, porcentajeMundial: 7.2, descripcion: "Infraestructura madura con Grand Coulee y Hoover Dam.", dato_clave: "La hidro es la mayor fuente renovable histórica de EE.UU.", plantaMasGrande: { nombre: "Grand Coulee Dam", capacidadMW: 6809, ubicacion: "Washington", coords: [-118.9, 47.9] } },
      { pais: "Canadá", codigo: "CA", capacidadGW: 82.0, porcentajeMundial: 5.8, descripcion: "Quebec y British Columbia potencias hidro. Exporta electricidad limpia a EE.UU.", dato_clave: "El 60% de la electricidad canadiense es hidro.", plantaMasGrande: { nombre: "Robert-Bourassa (La Grande-2)", capacidadMW: 5616, ubicacion: "Quebec", coords: [-77.0, 53.8] } },
      { pais: "India", codigo: "IN", capacidadGW: 52.0, porcentajeMundial: 3.7, descripcion: "Ríos himalayos como fuente principal.", dato_clave: "Potencial sin explotar de 145 GW.", plantaMasGrande: { nombre: "Tehri Dam", capacidadMW: 2400, ubicacion: "Uttarakhand", coords: [78.5, 30.4] } },
    ],
    mexico: { capacidadGW: 12.6, rankingMundial: 22, fortalezas: "Ríos Grijalva-Usumacinta con cascada de presas.", retos: "Sequías crecientes y sedimentación de embalses.", potencial: "Potencial remanente ~5 GW, enfoque en mini y micro hidro.", plantaMasGrande: { nombre: "C.H. Manuel Moreno Torres (Chicoasén)", capacidadMW: 2400, ubicacion: "Chiapas", coords: [-93.1, 16.9] } },
  },
  termica: {
    titulo: "Energía Térmica (Gas Natural)",
    subtitulo: "Capacidad instalada de generación a gas natural — ciclo combinado (2024)",
    unidad: "GW",
    totalMundialGW: 1900,
    recursoLegend: { label: "Capacidad térmica instalada (MW/estado)", colors: ["#fff7bc", "#fec44f", "#fe9929", "#d95f0e", "#993404"], min: "Baja", max: "Alta" },
    reservas: {
      titulo: "Reservas Probadas de Gas Natural",
      unidad: "Trillones de m³ (Tcm)",
      top5: [
        { pais: "Rusia", codigo: "RU", cantidad: "37.4", porcentajeMundial: 19.9 },
        { pais: "Irán", codigo: "IR", cantidad: "32.1", porcentajeMundial: 17.1 },
        { pais: "Qatar", codigo: "QA", cantidad: "24.7", porcentajeMundial: 13.1 },
        { pais: "Turkmenistán", codigo: "TM", cantidad: "13.6", porcentajeMundial: 7.2 },
        { pais: "Estados Unidos", codigo: "US", cantidad: "12.6", porcentajeMundial: 6.7 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "0.18", porcentajeMundial: 0.1 },
    },
    top5: [
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 530.0, porcentajeMundial: 27.9, descripcion: "Revolución del shale gas convirtió a EE.UU. en el mayor productor de gas. Domina ciclo combinado.", dato_clave: "El gas genera ~43% de la electricidad estadounidense.", plantaMasGrande: { nombre: "West County Energy Center", capacidadMW: 3750, ubicacion: "Palm Beach, Florida", coords: [-80.3, 26.7] } },
      { pais: "China", codigo: "CN", capacidadGW: 340.0, porcentajeMundial: 17.9, descripcion: "Transición acelerada de carbón a gas. Importa GNL masivamente.", dato_clave: "China duplicó su capacidad de gas en 5 años.", plantaMasGrande: { nombre: "Shenzhen Energy Dongbu Power Plant", capacidadMW: 3000, ubicacion: "Guangdong", coords: [114.1, 22.5] } },
      { pais: "Rusia", codigo: "RU", capacidadGW: 178.0, porcentajeMundial: 9.4, descripcion: "Rica en gas natural. Gazprom opera las mayores infraestructuras de gas del mundo.", dato_clave: "Rusia posee las mayores reservas de gas natural del mundo.", plantaMasGrande: { nombre: "Surgutskaya GRES-2", capacidadMW: 5597, ubicacion: "Khanty-Mansi, Siberia", coords: [73.4, 61.2] } },
      { pais: "Japón", codigo: "JP", capacidadGW: 140.0, porcentajeMundial: 7.4, descripcion: "Mayor importador mundial de GNL. Post-Fukushima incrementó uso de gas.", dato_clave: "El GNL genera ~35% de la electricidad japonesa.", plantaMasGrande: { nombre: "Futtsu Power Station", capacidadMW: 5040, ubicacion: "Chiba", coords: [139.8, 35.3] } },
      { pais: "Arabia Saudita", codigo: "SA", capacidadGW: 85.0, porcentajeMundial: 4.5, descripcion: "Transición de petróleo a gas para generación eléctrica. Vision 2030.", dato_clave: "Arabia Saudita quemaba petróleo para generar electricidad hasta hace pocos años.", plantaMasGrande: { nombre: "Qurayyah Combined Cycle Plant", capacidadMW: 3927, ubicacion: "Provincia Oriental", coords: [50.1, 26.1] } },
    ],
    mexico: { capacidadGW: 35.0, rankingMundial: 12, fortalezas: "Infraestructura moderna de ciclo combinado, gas importado barato de EE.UU. vía gasoductos transfronterizos.", retos: "Alta dependencia del gas importado (~70%), vulnerabilidad geopolítica.", potencial: "Transición a ciclos combinados de alta eficiencia para reducir emisiones.", plantaMasGrande: { nombre: "Central de Ciclo Combinado Norte III", capacidadMW: 907, ubicacion: "Ciudad Juárez, Chihuahua", coords: [-106.4, 31.7] } },
  },
  carboelectrica: {
    titulo: "Energía Carboeléctrica",
    subtitulo: "Capacidad instalada de generación a carbón (2024)",
    unidad: "GW",
    totalMundialGW: 2130,
    recursoLegend: { label: "Plantas de carbón (MW)", colors: ["#d9d9d9", "#969696", "#636363", "#252525", "#000000"], min: "Baja", max: "Alta" },
    reservas: {
      titulo: "Reservas Probadas de Carbón",
      unidad: "Miles de millones de toneladas (Gt)",
      top5: [
        { pais: "Estados Unidos", codigo: "US", cantidad: "248.9", porcentajeMundial: 23.2 },
        { pais: "Rusia", codigo: "RU", cantidad: "162.2", porcentajeMundial: 15.1 },
        { pais: "Australia", codigo: "AU", cantidad: "150.2", porcentajeMundial: 14.0 },
        { pais: "China", codigo: "CN", cantidad: "143.2", porcentajeMundial: 13.3 },
        { pais: "India", codigo: "IN", cantidad: "111.1", porcentajeMundial: 10.3 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "1.2", porcentajeMundial: 0.1 },
    },
    top5: [
      { pais: "China", codigo: "CN", capacidadGW: 1110.0, porcentajeMundial: 52.1, descripcion: "Mayor consumidor y productor de carbón del mundo. El carbón genera ~60% de su electricidad.", dato_clave: "China tiene más plantas de carbón que el resto del mundo combinado.", plantaMasGrande: { nombre: "Tuoketuo Power Station", capacidadMW: 6720, ubicacion: "Mongolia Interior", coords: [111.4, 40.2] } },
      { pais: "India", codigo: "IN", capacidadGW: 256.0, porcentajeMundial: 12.0, descripcion: "Alta dependencia del carbón doméstico. Segundo mayor consumidor mundial.", dato_clave: "India planea añadir 80 GW de carbón para demanda base.", plantaMasGrande: { nombre: "Vindhyachal Super Thermal Power Station", capacidadMW: 4760, ubicacion: "Madhya Pradesh", coords: [82.6, 24.1] } },
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 189.0, porcentajeMundial: 8.9, descripcion: "En retiro acelerado. Más de 300 plantas cerradas desde 2010.", dato_clave: "El carbón cayó del 50% al 16% de la generación eléctrica en 20 años.", plantaMasGrande: { nombre: "Scherer Power Plant", capacidadMW: 3520, ubicacion: "Georgia", coords: [-83.8, 33.1] } },
      { pais: "Japón", codigo: "JP", capacidadGW: 47.0, porcentajeMundial: 2.2, descripcion: "Plantas de carbón de ultra alta eficiencia (USC). Aún depende del carbón importado.", dato_clave: "Japón tiene las plantas de carbón más eficientes del mundo.", plantaMasGrande: { nombre: "Hekinan Thermal Power Station", capacidadMW: 4100, ubicacion: "Aichi", coords: [136.9, 34.8] } },
      { pais: "Indonesia", codigo: "ID", capacidadGW: 42.0, porcentajeMundial: 2.0, descripcion: "Mayor exportador de carbón térmico del mundo. Alta dependencia doméstica.", dato_clave: "Indonesia exporta ~70% de su producción de carbón.", plantaMasGrande: { nombre: "Suralaya Power Station", capacidadMW: 4025, ubicacion: "Banten, Java", coords: [106.0, -6.0] } },
    ],
    mexico: { capacidadGW: 5.4, rankingMundial: 30, fortalezas: "Dos carboeléctricas principales: Carbón II (1,400 MW) y José López Portillo (1,200 MW) en Coahuila.", retos: "Compromisos de descarbonización, altas emisiones de CO₂, carbón de baja calidad.", potencial: "En fase de retiro progresivo. Reconversión a gas natural o cierre planificado.", plantaMasGrande: { nombre: "Central Carboeléctrica Carbón II", capacidadMW: 1400, ubicacion: "Nava, Coahuila", coords: [-100.8, 28.5] } },
  },
  petroleo: {
    titulo: "Energía del Petróleo",
    subtitulo: "Capacidad instalada de generación con derivados del petróleo — fuel oil, diésel (2024)",
    unidad: "GW",
    totalMundialGW: 450,
    recursoLegend: { label: "Plantas de fuel oil/diésel", colors: ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"], min: "Baja", max: "Alta" },
    reservas: {
      titulo: "Reservas Probadas de Petróleo",
      unidad: "Miles de millones de barriles (Gb)",
      top5: [
        { pais: "Venezuela", codigo: "VE", cantidad: "303.8", porcentajeMundial: 17.5 },
        { pais: "Arabia Saudita", codigo: "SA", cantidad: "297.5", porcentajeMundial: 17.2 },
        { pais: "Canadá", codigo: "CA", cantidad: "168.1", porcentajeMundial: 9.7 },
        { pais: "Irán", codigo: "IR", cantidad: "157.8", porcentajeMundial: 9.1 },
        { pais: "Irak", codigo: "IQ", cantidad: "145.0", porcentajeMundial: 8.4 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "5.8", porcentajeMundial: 0.3 },
    },
    top5: [
      { pais: "Arabia Saudita", codigo: "SA", capacidadGW: 65.0, porcentajeMundial: 14.4, descripcion: "Históricamente quemaba petróleo para generar electricidad. Transición a gas y renovables.", dato_clave: "Arabia Saudita aún usa ~500,000 barriles/día para generar electricidad.", plantaMasGrande: { nombre: "Shoaiba Power Plant", capacidadMW: 5600, ubicacion: "Provincia de La Meca", coords: [39.1, 20.7] } },
      { pais: "Irak", codigo: "IQ", capacidadGW: 23.0, porcentajeMundial: 5.1, descripcion: "Alta dependencia del fuel oil y diésel por infraestructura dañada.", dato_clave: "Irak quema gas asociado al petróleo por falta de infraestructura.", plantaMasGrande: { nombre: "Al-Nasiriyah Power Plant", capacidadMW: 840, ubicacion: "Dhi Qar", coords: [46.3, 31.0] } },
      { pais: "Irán", codigo: "IR", capacidadGW: 22.0, porcentajeMundial: 4.9, descripcion: "Usa fuel oil y diésel en plantas térmicas antiguas. Cuarto productor de petróleo.", dato_clave: "Irán subsidia fuertemente el fuel oil para generación eléctrica.", plantaMasGrande: { nombre: "Ramin Power Plant", capacidadMW: 1890, ubicacion: "Ahvaz, Khuzestán", coords: [48.7, 31.3] } },
      { pais: "Japón", codigo: "JP", capacidadGW: 18.0, porcentajeMundial: 4.0, descripcion: "Plantas de fuel oil de respaldo. Reducción progresiva post-crisis petrolera.", dato_clave: "Japón redujo su uso de petróleo para electricidad en un 80% desde los 70s.", plantaMasGrande: { nombre: "Kashima Oil-Fired Power Station", capacidadMW: 4400, ubicacion: "Ibaraki", coords: [140.7, 36.0] } },
      { pais: "Cuba", codigo: "CU", capacidadGW: 5.5, porcentajeMundial: 1.2, descripcion: "Alta dependencia del fuel oil pesado importado de Venezuela y producido localmente.", dato_clave: "Más del 90% de la electricidad cubana proviene de combustibles fósiles.", plantaMasGrande: { nombre: "CTE Antonio Guiteras", capacidadMW: 317, ubicacion: "Matanzas", coords: [-81.6, 23.0] } },
    ],
    mexico: { capacidadGW: 12.6, rankingMundial: 10, fortalezas: "PEMEX produce fuel oil y diésel doméstico. Plantas de respaldo en el sistema interconectado.", retos: "Alta contaminación, costos elevados de operación, envejecimiento de plantas.", potencial: "Retiro progresivo de plantas de fuel oil, sustitución por gas natural y renovables.", plantaMasGrande: { nombre: "Central Termoeléctrica Tula", capacidadMW: 1500, ubicacion: "Tula de Allende, Hidalgo", coords: [-99.4, 20.1] } },
  },
  gas_natural: {
    titulo: "Gas Natural — Producción y Reservas",
    subtitulo: "Principales productores y países con mayores reservas de gas natural (2024)",
    unidad: "Bcm/año",
    totalMundialGW: 4100,
    reservas: {
      titulo: "Reservas Probadas de Gas Natural",
      unidad: "Trillones de m³ (Tcm)",
      top5: [
        { pais: "Rusia", codigo: "RU", cantidad: "37.4", porcentajeMundial: 19.9 },
        { pais: "Irán", codigo: "IR", cantidad: "32.1", porcentajeMundial: 17.1 },
        { pais: "Qatar", codigo: "QA", cantidad: "24.7", porcentajeMundial: 13.1 },
        { pais: "Turkmenistán", codigo: "TM", cantidad: "13.6", porcentajeMundial: 7.2 },
        { pais: "Estados Unidos", codigo: "US", cantidad: "12.6", porcentajeMundial: 6.7 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "0.18", porcentajeMundial: 0.1 },
    },
    top5: [
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 978, porcentajeMundial: 23.8, descripcion: "Mayor productor mundial de gas natural gracias al fracking y shale gas (Permian, Marcellus).", dato_clave: "EE.UU. pasó de importador neto a mayor exportador de GNL en 2023.", plantaMasGrande: { nombre: "Sabine Pass LNG Terminal", capacidadMW: 0, ubicacion: "Cameron Parish, Louisiana", coords: [-93.3, 29.8] } },
      { pais: "Rusia", codigo: "RU", capacidadGW: 638, porcentajeMundial: 15.6, descripcion: "Segundo productor mundial. Gazprom controla las mayores reservas. Exporta a Europa y Asia.", dato_clave: "El gasoducto Power of Siberia lleva gas ruso a China.", plantaMasGrande: { nombre: "Urengoy Gas Field (processing)", capacidadMW: 0, ubicacion: "Yamalo-Nenets, Siberia", coords: [76.6, 66.1] } },
      { pais: "Irán", codigo: "IR", capacidadGW: 259, porcentajeMundial: 6.3, descripcion: "Tercero en producción. Comparte el mayor campo de gas del mundo (South Pars) con Qatar.", dato_clave: "South Pars/North Dome es el campo de gas más grande del mundo.", plantaMasGrande: { nombre: "South Pars Gas Complex", capacidadMW: 0, ubicacion: "Assaluyeh, Bushehr", coords: [52.6, 27.5] } },
      { pais: "China", codigo: "CN", capacidadGW: 230, porcentajeMundial: 5.6, descripcion: "Producción creciente pero insuficiente. Mayor importador de GNL del mundo.", dato_clave: "China importa ~45% de su consumo de gas natural.", plantaMasGrande: { nombre: "Sulige Gas Field", capacidadMW: 0, ubicacion: "Ordos, Mongolia Interior", coords: [109.0, 39.0] } },
      { pais: "Qatar", codigo: "QA", capacidadGW: 177, porcentajeMundial: 4.3, descripcion: "Mayor exportador de GNL del mundo. North Field es la mitad del mega-campo compartido con Irán.", dato_clave: "Qatar produce ~30% del GNL mundial.", plantaMasGrande: { nombre: "Ras Laffan LNG Complex", capacidadMW: 0, ubicacion: "Ras Laffan Industrial City", coords: [51.5, 25.9] } },
    ],
    mexico: { capacidadGW: 27, rankingMundial: 28, fortalezas: "Red de gasoductos transfronterizos desde Texas. Producción en Burgos, Veracruz y Tabasco.", retos: "Producción en declive, importa ~70% del gas que consume. Dependencia geopolítica.", potencial: "Exploración de shale gas en Burgos y aguas profundas del Golfo.", plantaMasGrande: { nombre: "Campo Burgos (producción de gas)", capacidadMW: 0, ubicacion: "Reynosa, Tamaulipas", coords: [-98.3, 26.1] } },
  },
  hidrogeno_verde: {
    titulo: "Hidrógeno Verde",
    subtitulo: "Capacidad planificada y proyectos de producción de hidrógeno verde (2024)",
    unidad: "GW electrólisis",
    totalMundialGW: 1.4,
    recursoLegend: { label: "Potencial de H₂ verde (combinación solar+eólica)", colors: ["#e8f5e9", "#a5d6a7", "#4caf50", "#2e7d32", "#1b5e20"], min: "Bajo", max: "Alto" },
    reservas: {
      titulo: "Mayor Potencial de Producción de Hidrógeno Verde",
      unidad: "Índice de potencial (solar+eólica+agua)",
      top5: [
        { pais: "Australia", codigo: "AU", cantidad: "Excepcional", porcentajeMundial: 0 },
        { pais: "Chile", codigo: "CL", cantidad: "Excepcional", porcentajeMundial: 0 },
        { pais: "Arabia Saudita (NEOM)", codigo: "SA", cantidad: "Muy Alto", porcentajeMundial: 0 },
        { pais: "Namibia", codigo: "NA", cantidad: "Muy Alto", porcentajeMundial: 0 },
        { pais: "Marruecos", codigo: "MA", cantidad: "Alto", porcentajeMundial: 0 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "Alto (Sonora, Baja California)", porcentajeMundial: 0 },
    },
    top5: [
      { pais: "Australia", codigo: "AU", capacidadGW: 0.35, porcentajeMundial: 25.0, descripcion: "Líder en proyectos de hidrógeno verde. Asian Renewable Energy Hub (26 GW planeado) será el mayor del mundo.", dato_clave: "Australia busca ser el mayor exportador de H₂ verde a Asia.", plantaMasGrande: { nombre: "Asian Renewable Energy Hub (planeado)", capacidadMW: 26000, ubicacion: "Pilbara, Western Australia", coords: [119.8, -20.7] } },
      { pais: "Chile", codigo: "CL", capacidadGW: 0.25, porcentajeMundial: 17.9, descripcion: "Estrategia Nacional de Hidrógeno Verde. Atacama y Patagonia ofrecen recursos solares y eólicos excepcionales.", dato_clave: "Chile busca producir el H₂ verde más barato del mundo para 2030.", plantaMasGrande: { nombre: "HyEx (planeado)", capacidadMW: 1600, ubicacion: "Antofagasta, Atacama", coords: [-69.6, -23.6] } },
      { pais: "Arabia Saudita", codigo: "SA", capacidadGW: 0.2, porcentajeMundial: 14.3, descripcion: "Proyecto NEOM Green Hydrogen: la mayor planta de H₂ verde del mundo en construcción.", dato_clave: "NEOM producirá 600 toneladas de H₂ verde al día.", plantaMasGrande: { nombre: "NEOM Green Hydrogen (en construcción)", capacidadMW: 4000, ubicacion: "NEOM, Tabuk", coords: [36.5, 27.9] } },
      { pais: "Alemania", codigo: "DE", capacidadGW: 0.15, porcentajeMundial: 10.7, descripcion: "Estrategia Nacional de Hidrógeno con €9 mil millones de inversión. Infraestructura de importación de H₂.", dato_clave: "Alemania planea importar el 70% de su H₂ desde países con recursos renovables.", plantaMasGrande: { nombre: "AquaVentus (planeado, eólico offshore)", capacidadMW: 10000, ubicacion: "Mar del Norte, Heligoland", coords: [7.9, 54.2] } },
      { pais: "India", codigo: "IN", capacidadGW: 0.12, porcentajeMundial: 8.6, descripcion: "National Green Hydrogen Mission con meta de 5 Mt/año para 2030.", dato_clave: "India quiere ser exportador neto de H₂ verde.", plantaMasGrande: { nombre: "Avaada Green Hydrogen Plant", capacidadMW: 1000, ubicacion: "Rajasthan", coords: [72.0, 26.5] } },
    ],
    mexico: { capacidadGW: 0.01, rankingMundial: 40, fortalezas: "Irradiación solar excepcional en el noroeste para electrólisis. Cercanía a mercado de EE.UU.", retos: "Sin estrategia nacional de hidrógeno. Falta de infraestructura de transporte y almacenamiento.", potencial: "El Desierto de Sonora podría convertirse en hub de producción de H₂ verde para exportación.", plantaMasGrande: { nombre: "Sin plantas operativas significativas", capacidadMW: 0, ubicacion: "Proyectos piloto en Sonora", coords: [-111, 29] } },
  },
  nuclear: {
    titulo: "Energía Nuclear",
    subtitulo: "Capacidad instalada de reactores nucleares (2024)",
    unidad: "GW",
    totalMundialGW: 413,
    reservas: {
      titulo: "Reservas de Uranio (Identificadas)",
      unidad: "Miles de toneladas (kt U)",
      top5: [
        { pais: "Australia", codigo: "AU", cantidad: "1,684", porcentajeMundial: 28.0 },
        { pais: "Kazajistán", codigo: "KZ", cantidad: "906", porcentajeMundial: 15.0 },
        { pais: "Canadá", codigo: "CA", cantidad: "564", porcentajeMundial: 9.4 },
        { pais: "Rusia", codigo: "RU", cantidad: "480", porcentajeMundial: 8.0 },
        { pais: "Namibia", codigo: "NA", cantidad: "448", porcentajeMundial: 7.4 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "~2", porcentajeMundial: 0.03 },
    },
    top5: [
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 95.8, porcentajeMundial: 23.2, descripcion: "Mayor flota nuclear del mundo con 93 reactores.", dato_clave: "La nuclear genera ~20% de la electricidad estadounidense.", plantaMasGrande: { nombre: "Palo Verde Nuclear Generating Station", capacidadMW: 3937, ubicacion: "Arizona", coords: [-112.9, 33.4] } },
      { pais: "Francia", codigo: "FR", capacidadGW: 61.4, porcentajeMundial: 14.9, descripcion: "Modelo mundial de energía nuclear. Mayor proporción nuclear de cualquier país.", dato_clave: "~70% de la electricidad francesa es nuclear.", plantaMasGrande: { nombre: "Gravelines Nuclear Power Station", capacidadMW: 5460, ubicacion: "Nord-Pas-de-Calais", coords: [2.1, 51.0] } },
      { pais: "China", codigo: "CN", capacidadGW: 57.0, porcentajeMundial: 13.8, descripcion: "Programa nuclear de más rápido crecimiento. 24 reactores en construcción.", dato_clave: "Planea triplicar su capacidad nuclear para 2035.", plantaMasGrande: { nombre: "Yangjiang Nuclear Power Station", capacidadMW: 6000, ubicacion: "Guangdong", coords: [111.9, 21.7] } },
      { pais: "Rusia", codigo: "RU", capacidadGW: 29.5, porcentajeMundial: 7.1, descripcion: "Rosatom es el principal exportador de tecnología nuclear.", dato_clave: "Rosatom construye reactores en más de 10 países.", plantaMasGrande: { nombre: "Leningrad Nuclear Power Plant", capacidadMW: 4000, ubicacion: "Leningrad Oblast", coords: [29.0, 59.8] } },
      { pais: "Corea del Sur", codigo: "KR", capacidadGW: 26.0, porcentajeMundial: 6.3, descripcion: "Tecnología APR1400 de clase mundial. Exportador de reactores.", dato_clave: "La nuclear genera ~30% de la electricidad surcoreana.", plantaMasGrande: { nombre: "Hanul Nuclear Power Plant", capacidadMW: 5908, ubicacion: "Gyeongsang del Norte", coords: [129.4, 37.1] } },
    ],
    mexico: { capacidadGW: 1.6, rankingMundial: 30, fortalezas: "Central Laguna Verde (2 reactores BWR) operando desde 1990.", retos: "No hay planes de nuevos reactores, percepción pública negativa.", potencial: "Extensión de vida útil de Laguna Verde y posible exploración de SMRs.", plantaMasGrande: { nombre: "Central Nucleoeléctrica Laguna Verde", capacidadMW: 1634, ubicacion: "Alto Lucero, Veracruz", coords: [-96.4, 19.7] } },
  },
  geotermica: {
    titulo: "Energía Geotérmica",
    subtitulo: "Capacidad instalada de generación geotérmica (2024)",
    unidad: "GW",
    totalMundialGW: 16.3,
    recursoLegend: { label: "Potencial geotérmico (kWh/m²/día)", colors: ["#d8f3dc", "#74c69d", "#2d6a4f", "#8b6914", "#5a3e1b"], min: "Bajo", max: "Alto" },
    reservas: {
      titulo: "Mayor Potencial Geotérmico Estimado",
      unidad: "GW potencial",
      top5: [
        { pais: "Indonesia", codigo: "ID", cantidad: "29", porcentajeMundial: 0 },
        { pais: "Estados Unidos", codigo: "US", cantidad: "25", porcentajeMundial: 0 },
        { pais: "Filipinas", codigo: "PH", cantidad: "10", porcentajeMundial: 0 },
        { pais: "México", codigo: "MX", cantidad: "10", porcentajeMundial: 0 },
        { pais: "Kenia", codigo: "KE", cantidad: "10", porcentajeMundial: 0 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "10+", porcentajeMundial: 0 },
    },
    top5: [
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 3.79, porcentajeMundial: 23.3, descripcion: "The Geysers en California es el mayor campo geotérmico del mundo.", dato_clave: "California, Nevada y Utah concentran la mayor parte.", plantaMasGrande: { nombre: "The Geysers", capacidadMW: 1517, ubicacion: "Sonoma County, California", coords: [-122.8, 38.8] } },
      { pais: "Indonesia", codigo: "ID", capacidadGW: 2.39, porcentajeMundial: 14.7, descripcion: "Cinturón de Fuego del Pacífico. Potencial geotérmico más grande del mundo (29 GW).", dato_clave: "Planea ser líder mundial geotérmico para 2030.", plantaMasGrande: { nombre: "Sarulla Geothermal Power Plant", capacidadMW: 330, ubicacion: "Sumatra del Norte", coords: [99.0, 2.1] } },
      { pais: "Filipinas", codigo: "PH", capacidadGW: 1.93, porcentajeMundial: 11.8, descripcion: "La geotérmica genera ~12% de la electricidad del país.", dato_clave: "Campos en Leyte, Negros y Mindanao.", plantaMasGrande: { nombre: "Malitbog Geothermal Power Station", capacidadMW: 232, ubicacion: "Leyte", coords: [124.5, 10.3] } },
      { pais: "Turquía", codigo: "TR", capacidadGW: 1.69, porcentajeMundial: 10.4, descripcion: "Crecimiento explosivo en Anatolia occidental.", dato_clave: "Pasó de 0.1 GW a 1.7 GW en solo 10 años.", plantaMasGrande: { nombre: "Kızıldere III Geothermal Power Plant", capacidadMW: 165, ubicacion: "Denizli", coords: [29.0, 37.8] } },
      { pais: "Nueva Zelanda", codigo: "NZ", capacidadGW: 1.04, porcentajeMundial: 6.4, descripcion: "Zona volcánica de Taupo como recurso principal.", dato_clave: "La geotérmica provee ~17% de la electricidad neozelandesa.", plantaMasGrande: { nombre: "Nga Awa Purua", capacidadMW: 140, ubicacion: "Taupo, North Island", coords: [176.2, -38.5] } },
    ],
    mexico: { capacidadGW: 0.96, rankingMundial: 6, fortalezas: "Cerro Prieto es uno de los mayores campos geotérmicos del mundo.", retos: "Inversión insuficiente en exploración, tecnología costosa.", potencial: "Potencial de 10+ GW en el Eje Neovolcánico Transversal.", plantaMasGrande: { nombre: "Campo Geotérmico Cerro Prieto", capacidadMW: 570, ubicacion: "Mexicali, Baja California", coords: [-115.2, 32.4] } },
  },
  bioenergia: {
    titulo: "Bioenergía",
    subtitulo: "Capacidad instalada de generación con biomasa y biogás (2024)",
    unidad: "GW",
    totalMundialGW: 160,
    reservas: {
      titulo: "Mayor Potencial de Biomasa Disponible",
      unidad: "EJ/año (exajoules)",
      top5: [
        { pais: "Brasil", codigo: "BR", cantidad: "18.5", porcentajeMundial: 0 },
        { pais: "Estados Unidos", codigo: "US", cantidad: "15.2", porcentajeMundial: 0 },
        { pais: "China", codigo: "CN", cantidad: "12.8", porcentajeMundial: 0 },
        { pais: "India", codigo: "IN", cantidad: "10.5", porcentajeMundial: 0 },
        { pais: "Indonesia", codigo: "ID", cantidad: "8.3", porcentajeMundial: 0 },
      ],
      mexico: { pais: "México", codigo: "MX", cantidad: "2.1", porcentajeMundial: 0 },
    },
    top5: [
      { pais: "Brasil", codigo: "BR", capacidadGW: 16.8, porcentajeMundial: 10.5, descripcion: "Líder mundial en biocombustibles (etanol de caña). Cogeneración con bagazo.", dato_clave: "La caña genera electricidad equivalente a una central nuclear.", plantaMasGrande: { nombre: "UTE Barreiro (CRVG)", capacidadMW: 530, ubicacion: "Minas Gerais", coords: [-44.0, -19.9] } },
      { pais: "China", codigo: "CN", capacidadGW: 15.3, porcentajeMundial: 9.6, descripcion: "Plantas de biomasa agrícola y residuos forestales.", dato_clave: "Más de 100,000 digestores de biogás rurales.", plantaMasGrande: { nombre: "Guangzhou Waste-to-Energy Plant", capacidadMW: 240, ubicacion: "Guangdong", coords: [113.3, 23.1] } },
      { pais: "Estados Unidos", codigo: "US", capacidadGW: 12.6, porcentajeMundial: 7.9, descripcion: "Biomasa forestal y residuos agrícolas. Waste-to-energy urbano.", dato_clave: "La biomasa es la tercera fuente renovable.", plantaMasGrande: { nombre: "McNeil Generating Station", capacidadMW: 50, ubicacion: "Burlington, Vermont", coords: [-73.2, 44.5] } },
      { pais: "India", codigo: "IN", capacidadGW: 11.3, porcentajeMundial: 7.1, descripcion: "Cogeneración con bagazo en la industria azucarera.", dato_clave: "Potencial de biomasa estimado en 25 GW.", plantaMasGrande: { nombre: "JSW Ratnagiri Biomass Plant", capacidadMW: 130, ubicacion: "Maharashtra", coords: [73.3, 17.0] } },
      { pais: "Alemania", codigo: "DE", capacidadGW: 9.5, porcentajeMundial: 5.9, descripcion: "Líder europeo en biogás. +9,000 plantas de biogás.", dato_clave: "El biogás genera ~5% de la electricidad alemana.", plantaMasGrande: { nombre: "Zerbst Biomass Power Plant", capacidadMW: 20, ubicacion: "Sajonia-Anhalt", coords: [12.1, 51.9] } },
    ],
    mexico: { capacidadGW: 0.8, rankingMundial: 35, fortalezas: "Industria azucarera con potencial de cogeneración, residuos agrícolas abundantes.", retos: "Falta de incentivos, logística y competencia con otros usos del suelo.", potencial: "Potencial estimado de 8 GW con residuos agrícolas, forestales e industria azucarera.", plantaMasGrande: { nombre: "Bioenergía de Nuevo León", capacidadMW: 12, ubicacion: "Monterrey, Nuevo León", coords: [-100.3, 25.7] } },
  },
  otras: {
    titulo: "Otras Energías Renovables",
    subtitulo: "Capacidad instalada de mareomotriz, undimotriz y otras (2024)",
    unidad: "GW",
    totalMundialGW: 0.55,
    top5: [
      { pais: "Corea del Sur", codigo: "KR", capacidadGW: 0.254, porcentajeMundial: 46.2, descripcion: "Sihwa Lake (254 MW), la mayor planta mareomotriz del mundo.", dato_clave: "Genera electricidad para 500,000 hogares.", plantaMasGrande: { nombre: "Sihwa Lake Tidal Power Station", capacidadMW: 254, ubicacion: "Gyeonggi-do", coords: [126.6, 37.3] } },
      { pais: "Francia", codigo: "FR", capacidadGW: 0.24, porcentajeMundial: 43.6, descripcion: "La Rance fue la primera gran planta mareomotriz (1966).", dato_clave: "La Rance lleva más de 55 años operando.", plantaMasGrande: { nombre: "Usine marémotrice de la Rance", capacidadMW: 240, ubicacion: "Bretaña", coords: [-2.0, 48.6] } },
      { pais: "Reino Unido", codigo: "GB", capacidadGW: 0.02, porcentajeMundial: 3.6, descripcion: "Líder en I+D de energía undimotriz y corrientes marinas.", dato_clave: "EMEC en Orkney es el centro de pruebas más avanzado.", plantaMasGrande: { nombre: "MeyGen Tidal Array", capacidadMW: 6, ubicacion: "Pentland Firth, Escocia", coords: [-3.1, 58.7] } },
      { pais: "Canadá", codigo: "CA", capacidadGW: 0.02, porcentajeMundial: 3.6, descripcion: "Bahía de Fundy tiene las mareas más altas del mundo (16m).", dato_clave: "Potencial teórico de 2.5 GW en Fundy.", plantaMasGrande: { nombre: "Annapolis Royal Generating Station", capacidadMW: 20, ubicacion: "Nova Scotia", coords: [-65.5, 44.7] } },
      { pais: "Australia", codigo: "AU", capacidadGW: 0.005, porcentajeMundial: 0.9, descripcion: "Proyectos piloto undimotriz. Inversión en hidrógeno verde.", dato_clave: "Busca ser el mayor exportador de hidrógeno verde.", plantaMasGrande: { nombre: "Carnegie Wave Energy CETO 6", capacidadMW: 1, ubicacion: "Garden Island, WA", coords: [115.7, -32.2] } },
    ],
    mexico: { capacidadGW: 0.0, rankingMundial: 0, fortalezas: "8,000+ km de costa con potencial para energía oceánica.", retos: "Tecnologías en fase experimental, sin marco regulatorio.", potencial: "Potencial a largo plazo en mareomotriz en el Golfo de California.", plantaMasGrande: { nombre: "Sin plantas operativas", capacidadMW: 0, ubicacion: "N/A", coords: [-102, 23] } },
  },
};

export const COUNTRY_COORDS: Record<string, [number, number]> = {
  CN: [104, 35], US: [-98, 39], IN: [78, 22], JP: [138, 36],
  DE: [10, 51], BR: [-51, -10], FR: [2, 47], RU: [90, 60],
  CA: [-106, 56], KR: [128, 36], ID: [117, -2], PH: [122, 12],
  TR: [35, 39], NZ: [174, -41], GB: [-2, 54], AU: [134, -25],
  MX: [-102, 23], SA: [45, 24], IQ: [44, 33], IR: [53, 32],
  CU: [-79, 22], VE: [-66, 7], CL: [-71, -35], QA: [51, 25],
  TM: [59, 39], KZ: [67, 48], NA: [-17, -22], EG: [30, 27],
  MA: [-6, 32], KE: [38, 0], DK: [10, 56], IE: [-8, 53],
  AR: [-64, -34],
};
