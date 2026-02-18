import { useEnergy } from "@/contexts/EnergyContext";
import { CATEGORIAS_ENERGIA } from "@/types/energy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useMemo } from "react";

export function FilterPanel() {
  const { filtros, setFiltros, limpiarFiltros, plantasRaw } = useEnergy();
  const [open, setOpen] = useState(false);

  const tieneFiltros = useMemo(() => {
    return (
      filtros.energiaCategoria.length > 0 ||
      filtros.estados.length > 0 ||
      filtros.sector.length > 0 ||
      filtros.dueno.length > 0 ||
      filtros.potenciaMin != null ||
      filtros.potenciaMax != null
    );
  }, [filtros]);

  const estadosDisponibles = useMemo(
    () => [...new Set(plantasRaw.map((p) => p.estado).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })),
    [plantasRaw]
  );

  const duenosDisponibles = useMemo(
    () => [...new Set(plantasRaw.map((p) => p.dueno).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })),
    [plantasRaw]
  );

  function toggleArray<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b bg-card">
      <div className="container mx-auto px-4 py-1">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <Filter className="h-3.5 w-3.5" />
            Filtros Globales
            {tieneFiltros && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                Activos
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        {tieneFiltros && (
          <Button variant="ghost" size="sm" className="text-xs text-destructive ml-2" onClick={limpiarFiltros}>
            <X className="h-3 w-3 mr-1" /> Limpiar
          </Button>
        )}
      </div>
      <CollapsibleContent>
        <div className="container mx-auto px-4 pb-3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {/* Categoría de energía */}
          <div>
            <p className="font-medium mb-1.5 text-muted-foreground">Tipo de Energía</p>
            <div className="flex flex-wrap gap-1">
              {CATEGORIAS_ENERGIA.map((cat) => (
                <Badge
                  key={cat.key}
                  variant={filtros.energiaCategoria.includes(cat.key) ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  onClick={() =>
                    setFiltros((f) => ({ ...f, energiaCategoria: toggleArray(f.energiaCategoria, cat.key) }))
                  }
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div>
            <p className="font-medium mb-1.5 text-muted-foreground">Estado</p>
            <select
              className="w-full rounded border bg-background px-2 py-1 text-xs"
              value=""
              onChange={(e) => {
                if (e.target.value) setFiltros((f) => ({ ...f, estados: toggleArray(f.estados, e.target.value) }));
              }}
            >
              <option value="">Seleccionar estado…</option>
              {estadosDisponibles.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-1 mt-1">
              {filtros.estados.map((e) => (
                <Badge key={e} variant="secondary" className="text-[10px] cursor-pointer" onClick={() => setFiltros((f) => ({ ...f, estados: f.estados.filter((x) => x !== e) }))}>
                  {e} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Sector */}
          <div>
            <p className="font-medium mb-1.5 text-muted-foreground">Sector</p>
            <div className="flex gap-1">
              {(["publica", "privada", "nd"] as const).map((s) => (
                <Badge
                  key={s}
                  variant={filtros.sector.includes(s) ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  onClick={() => setFiltros((f) => ({ ...f, sector: toggleArray(f.sector, s) }))}
                >
                  {s === "publica" ? "Pública" : s === "privada" ? "Privada" : "N/D"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Dueño */}
          <div>
            <p className="font-medium mb-1.5 text-muted-foreground">Dueño/Operador</p>
            <select
              className="w-full rounded border bg-background px-2 py-1 text-xs"
              value=""
              onChange={(e) => {
                if (e.target.value) setFiltros((f) => ({ ...f, dueno: toggleArray(f.dueno, e.target.value) }));
              }}
            >
              <option value="">Seleccionar…</option>
              {duenosDisponibles.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-1 mt-1">
              {filtros.dueno.map((d) => (
                <Badge key={d} variant="secondary" className="text-[10px] cursor-pointer" onClick={() => setFiltros((f) => ({ ...f, dueno: f.dueno.filter((x) => x !== d) }))}>
                  {d} ×
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
