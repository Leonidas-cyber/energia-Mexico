import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, GraduationCap, Target, User } from "lucide-react";

export function TabAcercaDe() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      {/* Autor */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Leonardo González Pacheco</CardTitle>
              <p className="text-sm text-muted-foreground">
                Estudiante de Ingeniería Eléctrica
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary shrink-0" />
            Universidad Autónoma Metropolitana — Unidad Azcapotzalco
          </p>
          <p className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            Materia: Recursos Energéticos
          </p>
        </CardContent>
      </Card>

      {/* Propósito */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            ¿Por qué este proyecto?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
          <p>
            Este proyecto nació con el objetivo de integrar, visualizar y analizar de manera
            interactiva la información del sistema energético de México, así como su posición
            frente a las principales potencias mundiales en cada tipo de energía.
          </p>
          <p>
            Como estudiante de Ingeniería Eléctrica, considero fundamental comprender no solo
            la generación y transmisión de energía, sino también los factores económicos,
            ambientales y geopolíticos que definen el panorama energético actual.
          </p>
          <p>
            A través de mapas interactivos, gráficas comparativas y datos actualizados, esta
            herramienta busca facilitar el estudio y la toma de decisiones informadas sobre
            la transición energética en México.
          </p>
        </CardContent>
      </Card>

      {/* Alcance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alcance del proyecto</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1.5">
            <li>Plantas de generación eléctrica en México por tipo de energía</li>
            <li>Potencia instalada y distribución por estado</li>
            <li>Propiedad pública vs. privada de la infraestructura</li>
            <li>Red de gasoductos y sistema de transmisión (SEN)</li>
            <li>Comparativa global: Top 5 mundial vs. México en 11 energías</li>
            <li>Emisiones de CO₂ e intensidad de carbono por tecnología</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
