import { useState, useEffect, useCallback } from "react";
import { useEnergy } from "@/contexts/EnergyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Save, RotateCcw, FileText, ClipboardPaste } from "lucide-react";
import type { ContenidoDiapositiva, Rubrica } from "@/types/energy";
import { topDuenosPorMW, potenciaPorEstado } from "@/utils/kpis";

const STORAGE_KEY_SLIDE = "diapositiva_contenido";
const STORAGE_KEY_RUBRICA = "diapositiva_rubrica";

const CONTENIDO_VACIO: ContenidoDiapositiva = {
  titulo: "", objetivo: "", contexto: "", metodologia: "", resultados: "",
  interpretacion: "", conclusion: "", limitaciones: "", trabajoFuturo: "",
  bibliografia: "", mensajePrincipal: "",
};

const RUBRICA_VACIA: Rubrica = {
  claridad: 0, calidadVisual: 0, sustentoTecnico: 0, citas: 0, dominioTema: 0, comentarios: "",
};

/** Tab 6: Diapositiva / Evaluación */
export function TabDiapositiva() {
  const { kpis, plantasFiltradas, filtros } = useEnergy();
  const [contenido, setContenido] = useState<ContenidoDiapositiva>(CONTENIDO_VACIO);
  const [rubrica, setRubrica] = useState<Rubrica>(RUBRICA_VACIA);

  // Load from localStorage
  useEffect(() => {
    try {
      const c = localStorage.getItem(STORAGE_KEY_SLIDE);
      if (c) setContenido(JSON.parse(c));
      const r = localStorage.getItem(STORAGE_KEY_RUBRICA);
      if (r) setRubrica(JSON.parse(r));
    } catch { /* ignore */ }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SLIDE, JSON.stringify(contenido));
  }, [contenido]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RUBRICA, JSON.stringify(rubrica));
  }, [rubrica]);

  const updateField = useCallback((field: keyof ContenidoDiapositiva, value: string) => {
    setContenido((prev) => ({ ...prev, [field]: value }));
  }, []);

  const insertarMetricas = useCallback(() => {
    const topEstados = potenciaPorEstado(plantasFiltradas).slice(0, 5);
    const topDuenos = topDuenosPorMW(plantasFiltradas, 5);
    const now = new Date().toLocaleString("es-MX");
    const filtrosActivos = Object.entries(filtros)
      .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : v != null))
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("; ") || "Ninguno";

    const metricas = [
      `— Métricas del mapa (${now}) —`,
      `Potencia total: ${kpis.potenciaTotal.toLocaleString()} MW`,
      `Total de plantas: ${kpis.totalPlantas}`,
      `Pública: ${kpis.porcentajePublica}% | Privada: ${kpis.porcentajePrivada}%`,
      `Dueños únicos: ${kpis.duenosUnicos}`,
      `Top estados: ${topEstados.map((e) => `${e.estado} (${e.mw} MW)`).join(", ") || "No disponible en datos cargados"}`,
      `Top dueños: ${topDuenos.map((d) => `${d.dueno} (${d.mw} MW)`).join(", ") || "No disponible en datos cargados"}`,
      `Filtros activos: ${filtrosActivos}`,
    ].join("\n");

    setContenido((prev) => ({ ...prev, resultados: prev.resultados ? prev.resultados + "\n\n" + metricas : metricas }));
  }, [kpis, plantasFiltradas, filtros]);

  const generarBorrador = useCallback(
    (largo: boolean) => {
      const topEstados = potenciaPorEstado(plantasFiltradas).slice(0, 3);
      const topDuenos = topDuenosPorMW(plantasFiltradas, 3);
      const resumen = largo
        ? `El análisis del sistema energético de México comprende ${kpis.totalPlantas} plantas con una capacidad instalada total de ${kpis.potenciaTotal.toLocaleString()} MW. La distribución por sector indica que ${kpis.porcentajePublica}% corresponde al sector público y ${kpis.porcentajePrivada}% al privado, con ${kpis.duenosUnicos} entidades propietarias identificadas. Los principales estados por potencia instalada son ${topEstados.map((e) => `${e.estado} (${e.mw.toLocaleString()} MW, ${e.count} plantas)`).join(", ") || "no disponible en datos cargados"}. Entre los principales propietarios se encuentran ${topDuenos.map((d) => `${d.dueno} (${d.mw.toLocaleString()} MW)`).join(", ") || "no disponible en datos cargados"}. Este análisis permite identificar la concentración geográfica y empresarial de la generación eléctrica, elemento fundamental para la planeación energética nacional y la evaluación de políticas públicas en el sector.`
        : `México cuenta con ${kpis.totalPlantas} plantas de generación eléctrica con ${kpis.potenciaTotal.toLocaleString()} MW de capacidad instalada. El ${kpis.porcentajePublica}% es pública y el ${kpis.porcentajePrivada}% privada. Los principales estados son ${topEstados.map((e) => `${e.estado} (${e.mw.toLocaleString()} MW)`).join(", ") || "no disponible"}. Los datos revelan la estructura de propiedad y distribución geográfica del sistema eléctrico nacional.`;
      setContenido((prev) => ({ ...prev, resultados: prev.resultados ? prev.resultados + "\n\n" + resumen : resumen }));
    },
    [kpis, plantasFiltradas]
  );

  const limpiar = useCallback(() => {
    setContenido(CONTENIDO_VACIO);
    setRubrica(RUBRICA_VACIA);
  }, []);

  const campos: { key: keyof ContenidoDiapositiva; label: string; multiline?: boolean }[] = [
    { key: "titulo", label: "Título de la diapositiva" },
    { key: "objetivo", label: "Objetivo" },
    { key: "contexto", label: "Contexto y problema", multiline: true },
    { key: "metodologia", label: "Metodología", multiline: true },
    { key: "resultados", label: "Resultados clave", multiline: true },
    { key: "interpretacion", label: "Interpretación técnica", multiline: true },
    { key: "conclusion", label: "Conclusión", multiline: true },
    { key: "limitaciones", label: "Limitaciones de datos", multiline: true },
    { key: "trabajoFuturo", label: "Trabajo futuro", multiline: true },
    { key: "bibliografia", label: "Bibliografía / Fuentes", multiline: true },
    { key: "mensajePrincipal", label: "Mensaje principal (1 frase)" },
  ];

  const criterios: { key: keyof Omit<Rubrica, "comentarios">; label: string }[] = [
    { key: "claridad", label: "Claridad de la explicación" },
    { key: "calidadVisual", label: "Calidad visual del mapa" },
    { key: "sustentoTecnico", label: "Sustento técnico" },
    { key: "citas", label: "Citas y fuentes" },
    { key: "dominioTema", label: "Dominio del tema" },
  ];

  const totalRubrica = criterios.reduce((s, c) => s + rubrica[c.key], 0);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Diapositiva / Evaluación</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={insertarMetricas} className="gap-1 text-xs">
            <ClipboardPaste className="h-3.5 w-3.5" /> Insertar métricas
          </Button>
          <Button size="sm" variant="outline" onClick={() => generarBorrador(false)} className="gap-1 text-xs">
            <FileText className="h-3.5 w-3.5" /> Borrador corto
          </Button>
          <Button size="sm" variant="outline" onClick={() => generarBorrador(true)} className="gap-1 text-xs">
            <FileText className="h-3.5 w-3.5" /> Borrador largo
          </Button>
          <Button size="sm" variant="ghost" onClick={limpiar} className="text-xs text-destructive">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Editor de contenido */}
      <div className="space-y-3">
        {campos.map(({ key, label, multiline }) => (
          <div key={key}>
            <Label className="text-xs">{label}</Label>
            {multiline ? (
              <Textarea
                value={contenido[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="mt-1 text-sm"
                rows={3}
              />
            ) : (
              <Input
                value={contenido[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="mt-1 text-sm"
              />
            )}
          </div>
        ))}
      </div>

      {/* Rúbrica */}
      <div className="border rounded-md p-4 space-y-4">
        <h3 className="text-sm font-semibold">Rúbrica de Evaluación</h3>
        {criterios.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{label}</span>
              <span className="font-mono font-semibold">{rubrica[key]} / 10</span>
            </div>
            <Slider
              value={[rubrica[key]]}
              max={10}
              step={1}
              onValueChange={([v]) => setRubrica((prev) => ({ ...prev, [key]: v }))}
            />
          </div>
        ))}
        <div className="pt-2 border-t flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{totalRubrica} / 50</span>
        </div>
        <div>
          <Label className="text-xs">Comentarios del profesor</Label>
          <Textarea
            value={rubrica.comentarios}
            onChange={(e) => setRubrica((prev) => ({ ...prev, comentarios: e.target.value }))}
            className="mt-1 text-sm"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
