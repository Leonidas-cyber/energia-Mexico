import { TransmisionMap } from "@/components/map/TransmisionMap";

/** Tab 1: SEN Transmisión y Ductos */
export function TabSEN() {
  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">SEN: Red Nacional de Transmisión</h2>
      <p className="text-sm text-muted-foreground">
        Mapa de las principales líneas de transmisión eléctrica de México, clasificadas por nivel de voltaje.
        Trazos aproximados basados en cartografía pública (PRODESEN / CENACE). Longitud total del SEN: 87,318 km.
      </p>
      <TransmisionMap altura="550px" />
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
        <p><strong>Nota:</strong> Los trazos son aproximados y representan las rutas principales de la red de transmisión.
        El 45.5% de las líneas corresponden al rango 52–131 kV, seguido por 220–329 kV (26.5%) y 330–549 kV (23.8%).</p>
      </div>
    </div>
  );
}
