import { useEnergy } from "@/contexts/EnergyContext";
import { Activity, Factory, Users, AlertTriangle, Percent } from "lucide-react";

export function KPIBar() {
  const { kpis, cargando } = useEnergy();

  if (cargando) {
    return (
      <div className="bg-kpi-bg border-b px-4 py-2">
        <div className="container mx-auto text-center text-sm text-muted-foreground py-2">Cargando datos de centrales eléctricas…</div>
      </div>
    );
  }

  const items = [
    { label: "Potencia Total", value: `${kpis.potenciaTotal.toLocaleString()} MW`, icon: Activity, color: "text-energy-hydro" },
    { label: "Total Plantas", value: kpis.totalPlantas.toLocaleString(), icon: Factory, color: "text-energy-wind" },
    { label: "Pública / Privada", value: `${kpis.porcentajePublica}% / ${kpis.porcentajePrivada}%`, icon: Percent, color: "text-accent" },
    { label: "Dueños Únicos", value: kpis.duenosUnicos.toLocaleString(), icon: Users, color: "text-primary" },
    { label: "Incompletos", value: kpis.registrosIncompletos.toLocaleString(), icon: AlertTriangle, color: "text-energy-thermal" },
  ];

  return (
    <div className="bg-kpi-bg border-b px-2 sm:px-4 py-2">
      <div className="container mx-auto">
        <div className="overflow-x-auto -mx-2 px-2 scrollbar-hide">
          <div className="inline-flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 w-max sm:w-full">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-md bg-card px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-sm border min-w-[140px] sm:min-w-0">
                <item.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${item.color}`} />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.label}</p>
                  <p className="text-xs sm:text-sm font-semibold truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
