import { useEnergy } from "@/contexts/EnergyContext";
import { topDuenosPorMW, topDuenosPorPlantas } from "@/utils/kpis";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/** Tab 5: Propiedad y Dueños */
export function TabDuenos() {
  const { plantasFiltradas, kpis } = useEnergy();
  const topMW = useMemo(() => topDuenosPorMW(plantasFiltradas, 10), [plantasFiltradas]);
  const topCount = useMemo(() => topDuenosPorPlantas(plantasFiltradas, 10), [plantasFiltradas]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold">Propiedad y Dueños</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Potencia Total" value={`${kpis.potenciaTotal.toLocaleString()} MW`} />
        <KPICard label="Total Plantas" value={kpis.totalPlantas.toString()} />
        <KPICard label="% Pública" value={`${kpis.porcentajePublica}%`} />
        <KPICard label="Dueños Únicos" value={kpis.duenosUnicos.toString()} />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Top Dueños por MW</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMW} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="dueno" type="category" tick={{ fontSize: 10 }} width={95} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} MW`]} contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="mw" fill="hsl(210, 60%, 32%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Top Dueños por Número de Plantas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCount} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="dueno" type="category" tick={{ fontSize: 10 }} width={95} />
                <Tooltip formatter={(v: number) => [`${v} plantas`]} contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="hsl(160, 45%, 40%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="border rounded-md overflow-auto max-h-72">
        <table className="w-full text-xs">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Dueño</th>
              <th className="p-2 text-left">Operador</th>
              <th className="p-2 text-right">MW</th>
              <th className="p-2 text-left">Sector</th>
              <th className="p-2 text-left">Energía</th>
              <th className="p-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {plantasFiltradas.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/50">
                <td className="p-2">{p.nombre_planta}</td>
                <td className="p-2">{p.dueno || "N/D"}</td>
                <td className="p-2">{p.operador || "N/D"}</td>
                <td className="p-2 text-right">{p.potencia_mw?.toLocaleString() ?? "N/D"}</td>
                <td className="p-2 capitalize">{p.sector}</td>
                <td className="p-2">{p.energia_categoria}</td>
                <td className="p-2">{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
