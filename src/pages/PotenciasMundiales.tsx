import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LABELS: Record<string, string> = {
  solar: "Solar",
  eolica: "Eólica",
  hidroelectrica: "Hidroeléctrica",
  termica: "Térmica",
  nuclear: "Nuclear",
  geotermica: "Geotérmica",
  bioenergia: "Bioenergía",
  otras: "Otras",
};

const PotenciasMundiales = () => {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();
  const label = LABELS[tipo || ""] || tipo;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver al tablero
        </Button>
        <h1 className="text-2xl font-bold">Potencias Mundiales — {label}</h1>
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center text-muted-foreground">
          <p className="text-lg">Sección en construcción</p>
          <p className="text-sm mt-2">Aquí se mostrará el análisis de los principales países productores de energía {label?.toLowerCase()}.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PotenciasMundiales;
