import { useEnergy } from "@/contexts/EnergyContext";
import { CATEGORIAS_ENERGIA } from "@/types/energy";
import { MexicoMap } from "@/components/map/MexicoMap";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { EnergiaCategoria } from "@/types/energy";

/** Tab 2: Plantas por Energía con mapa interactivo */
export function TabPlantas() {
  const { plantasFiltradas } = useEnergy();
  const [categoriaActiva, setCategoriaActiva] = useState<EnergiaCategoria | "todas">("todas");

  const plantasMostradas = useMemo(
    () => categoriaActiva === "todas"
      ? plantasFiltradas
      : plantasFiltradas.filter((p) => p.energia_categoria === categoriaActiva),
    [plantasFiltradas, categoriaActiva]
  );

  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of plantasFiltradas) {
      map.set(p.energia_categoria, (map.get(p.energia_categoria) || 0) + 1);
    }
    return map;
  }, [plantasFiltradas]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Plantas por Energía</h2>
      <div className="flex flex-wrap gap-1">
        <Badge
          variant={categoriaActiva === "todas" ? "default" : "outline"}
          className="cursor-pointer text-[10px]"
          onClick={() => setCategoriaActiva("todas")}
        >
          Todas ({plantasFiltradas.length})
        </Badge>
        {CATEGORIAS_ENERGIA.map((cat) => {
          const count = porCategoria.get(cat.key) || 0;
          if (count === 0) return null;
          return (
            <Badge
              key={cat.key}
              variant={categoriaActiva === cat.key ? "default" : "outline"}
              className="cursor-pointer text-[10px]"
              onClick={() => setCategoriaActiva(cat.key)}
            >
              {cat.label} ({count})
            </Badge>
          );
        })}
      </div>

      <MexicoMap plantas={plantasMostradas} modo="puntos" altura="500px" />

      <div className="border rounded-md overflow-auto max-h-64">
        <table className="w-full text-xs">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Categoría</th>
              <th className="p-2 text-left">Subcategoría</th>
              <th className="p-2 text-right">MW</th>
              <th className="p-2 text-left">Sector</th>
              <th className="p-2 text-left">Dueño</th>
              <th className="p-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {plantasMostradas.slice(0, 100).map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/50">
                <td className="p-2 max-w-[200px] truncate">{p.nombre_planta}</td>
                <td className="p-2 capitalize">{p.energia_categoria}</td>
                <td className="p-2">{p.energia_subcategoria}</td>
                <td className="p-2 text-right font-mono">{p.potencia_mw?.toLocaleString() ?? "N/D"}</td>
                <td className="p-2 capitalize">{p.sector}</td>
                <td className="p-2 max-w-[150px] truncate">{p.dueno || "N/D"}</td>
                <td className="p-2">{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {plantasMostradas.length > 100 && (
          <p className="p-2 text-xs text-muted-foreground text-center">
            Mostrando 100 de {plantasMostradas.length} plantas
          </p>
        )}
      </div>
    </div>
  );
}
