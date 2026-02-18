# Mapas de Energía – Recursos Energéticos

Aplicación web interactiva para visualizar, analizar y exportar información energética de México (y comparativas mundiales), desarrollada como proyecto académico para la materia **Recursos Energéticos**.

---

## Descripción

Este proyecto integra datos geoespaciales (GeoJSON) y tabulares (CSV) para generar mapas temáticos energéticos con filtros dinámicos, indicadores (KPIs) y herramientas de exportación para reportes y presentaciones.

---

## Objetivo académico

Construir una herramienta visual para apoyar el análisis de:

- Infraestructura energética nacional (ductos y red del SEN).
- Distribución de plantas por tipo de energía.
- Potencia instalada y número de plantas por estado.
- Comparativas mundiales por tipo de energía.

---

## Funcionalidades principales

### A) Mapas de México
1. **Ductos** (líneas).
2. **SEN** (líneas/red).
3. **Plantas por tipo de energía** (solar, eólica, hidro, geotérmica, térmica, etc.).
4. **Potencia total por estado** (coropleta).
5. **Número de plantas por estado** (coropleta).

### B) Mapas mundiales
6. **Top 5 potencias por energía**.
7. **Posición de México por tipo de energía** (vista + ranking).

### C) Análisis adicional
- Filtros por energía, estado, sector y propietario.
- Indicadores de calidad de datos.
- Exportación de mapa a imagen.
- Datos listos para apoyo en diapositivas y reporte académico.

---

## Tecnologías utilizadas

- **Vite**
- **TypeScript**
- **React**
- **Tailwind CSS**
- **shadcn/ui**
- Librería de mapas web (según implementación actual del proyecto)

---

## Requisitos

- **Node.js 18+**
- **npm 9+**

Verifica con:

```bash
node -v
npm -v
```

---

## Instalación y ejecución local

```bash
# 1) Clonar repositorio
git clone <URL_DEL_REPOSITORIO>

# 2) Entrar al proyecto
cd <NOMBRE_DEL_PROYECTO>

# 3) Instalar dependencias
npm install

# 4) Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que asigne Vite).

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilación para producción
npm run preview  # Vista previa de la build
npm run lint     # Revisión de estilo/código
```

---

## Estructura sugerida del proyecto

```text
.
├── public/
│   └── data/                  # Archivos CSV/GeoJSON base
├── src/
│   ├── components/            # UI (filtros, paneles, tabs)
│   ├── pages/                 # Vistas principales
│   ├── utils/                 # Parser CSV, KPIs, exportación
│   ├── hooks/                 # Lógica reutilizable
│   └── types/                 # Tipos TypeScript
├── package.json
└── README.md
```

---

## Datos de entrada esperados

Archivos recomendados:

- `mx_estados.geojson` (polígonos por estado)
- `ductos.geojson` (líneas de ductos)
- `sen.geojson` (infraestructura/red SEN)
- `centrales.csv` (catálogo de plantas)

### Campos sugeridos para `centrales.csv`

- `nombre`
- `lat` / `lon`
- `estado`
- `tecnologia` o `tipo_energia`
- `capacidad_mw`
- `sector` (público/privado)
- `propietario` (si aplica)

---

## Flujo de uso

1. Cargar/validar archivos base (GeoJSON y CSV).
2. Seleccionar tipo de mapa (ductos, SEN, plantas, coropletas).
3. Aplicar filtros (energía/estado/sector/propietario).
4. Revisar KPIs y resultados.
5. Exportar mapa para reporte o presentación.

---

## Fuentes de datos

Para capas, validación y contexto energético se consultaron:

1. **Open Infrastructure Map (OpenInfraMap) – México**
   - https://openinframap.org/stats/area/Mexico/plants
   - Uso: referencia de plantas eléctricas y estadísticas agregadas.

2. **PLANEAS – Sistema Eléctrico Nacional**
   - https://energia.conacyt.mx/planeas/electricidad/sistema-electrico-nacional
   - Uso: referencia para capa y contexto del SEN.

3. **PLANEAS – Transmisión**
   - https://energia.conacyt.mx/planeas/electricidad/transmision
   - Uso: referencia para red de transmisión eléctrica.

4. **CFEnergía – Gasoductos**
   - https://www.cfenergia.com/gasoductos/
   - Uso: referencia para infraestructura de gasoductos.

### Fecha de consulta
- **Febrero 2026**

### Nota de uso académico
Antes de publicar o redistribuir datos, revisar términos de uso/licenciamiento en cada fuente oficial.

---

## Solución de problemas comunes

- **No aparecen capas en el mapa**
  - Verificar rutas de archivos y nombres de columnas.
  - Confirmar coordenadas (`lat/lon`) válidas.

- **Error de parsing CSV**
  - Revisar delimitador (`,` o `;`), comillas y encabezados.

- **Falla de build**
  ```bash
  npm install
  npm run lint
  npm run build
  ```

---

## Mejoras futuras (opcional)

- Carga diferida por módulos (lazy loading).
- Procesamiento CSV en Web Worker.
- Persistencia de filtros en URL.
- Exportación de datos filtrados en CSV.
- Pruebas automáticas de parser y KPIs.

---

## Contexto académico

Proyecto desarrollado para la materia **Recursos Energéticos**, con enfoque en análisis técnico y visualización de información energética para apoyo en evaluación y exposición.

---

## Autor

- **Leonardo Gonzalez**
- Ingeniería Eléctrica

