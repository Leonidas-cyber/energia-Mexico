import { GasoductosMap } from "@/components/map/GasoductosMap";

/** Tab dedicado: Red de Gasoductos de México */
export function TabGasoductos() {
  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">Red de Gasoductos de México</h2>
      <p className="text-sm text-muted-foreground">
        Mapa de la red de gasoductos del país, incluyendo ductos de CENAGAS (operación pública) y 
        ductos privados al servicio de CFE. Datos basados en CFE 2019 y SENER 2018.
      </p>
      <GasoductosMap altura="550px" />
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
        <p><strong>Nota:</strong> Los trazos son aproximados y basados en cartografía pública (CartoCrítica / Fundación Heinrich Böll). 
        Se identificaron 6,777 proyectos de ductos con una longitud total de 68,817 km a nivel nacional.</p>
        <p>El 76.2% de los ductos pertenecen a Pemex, 9.2% a CFE, y el resto a empresas privadas.</p>
      </div>
    </div>
  );
}
