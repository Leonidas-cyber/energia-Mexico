import { useEnergy } from "@/contexts/EnergyContext";
import { potenciaPorEstado } from "@/utils/kpis";
import { ChoroplethMap } from "@/components/map/ChoroplethMap";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/** Tab 3: Potencia Total por Estado — Coropleta + Gráfica */
export function TabPotenciaEstado() {
  const { plantasFiltradas } = useEnergy();
  const data = useMemo(() => potenciaPorEstado(plantasFiltradas), [plantasFiltradas]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Potencia Total por Estado</h2>
      <ChoroplethMap plantas={plantasFiltradas} modo="coropleta-mw" altura="450px" />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 15)} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="estado" type="category" tick={{ fontSize: 11 }} width={110} />
            <Tooltip formatter={(value: number) => [`${value.toLocaleString()} MW`, "Potencia"]} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="mw" fill="hsl(210, 60%, 32%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
