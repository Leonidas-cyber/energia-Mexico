import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import type { PlantaEnergia, FiltrosGlobales, KPIs, CalidadDatos } from "@/types/energy";
import { FILTROS_INICIALES } from "@/types/energy";
import { filtrarPlantas, calcularKPIs, calcularCalidad } from "@/utils/kpis";
import { cargarCentralesCSV } from "@/utils/csvParser";

interface EnergyContextValue {
  plantasRaw: PlantaEnergia[];
  plantasFiltradas: PlantaEnergia[];
  filtros: FiltrosGlobales;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosGlobales>>;
  limpiarFiltros: () => void;
  kpis: KPIs;
  calidad: CalidadDatos;
  agregarPlantas: (nuevas: PlantaEnergia[]) => void;
  reemplazarPlantas: (nuevas: PlantaEnergia[]) => void;
  cargando: boolean;
  errorCarga: string | null;
}

const EnergyContext = createContext<EnergyContextValue | null>(null);

export function EnergyProvider({ children }: { children: ReactNode }) {
  const [plantasRaw, setPlantasRaw] = useState<PlantaEnergia[]>([]);
  const [filtros, setFiltros] = useState<FiltrosGlobales>(FILTROS_INICIALES);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Cargar CSV de centrales al montar
  useEffect(() => {
    cargarCentralesCSV()
      .then((plantas) => {
        setPlantasRaw(plantas);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error cargando centrales:", err);
        setErrorCarga("No se pudieron cargar los datos de centrales eléctricas.");
        setCargando(false);
      });
  }, []);

  const plantasFiltradas = useMemo(() => filtrarPlantas(plantasRaw, filtros), [plantasRaw, filtros]);
  const kpis = useMemo(() => calcularKPIs(plantasFiltradas), [plantasFiltradas]);
  const calidad = useMemo(() => calcularCalidad(plantasRaw), [plantasRaw]);

  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_INICIALES), []);
  const agregarPlantas = useCallback((nuevas: PlantaEnergia[]) => {
    setPlantasRaw((prev) => [...prev, ...nuevas]);
  }, []);
  const reemplazarPlantas = useCallback((nuevas: PlantaEnergia[]) => {
    setPlantasRaw(nuevas);
  }, []);

  const value = useMemo(
    () => ({ plantasRaw, plantasFiltradas, filtros, setFiltros, limpiarFiltros, kpis, calidad, agregarPlantas, reemplazarPlantas, cargando, errorCarga }),
    [plantasRaw, plantasFiltradas, filtros, limpiarFiltros, kpis, calidad, agregarPlantas, reemplazarPlantas, cargando, errorCarga]
  );

  return <EnergyContext.Provider value={value}>{children}</EnergyContext.Provider>;
}

export function useEnergy() {
  const ctx = useContext(EnergyContext);
  if (!ctx) throw new Error("useEnergy must be used within EnergyProvider");
  return ctx;
}
