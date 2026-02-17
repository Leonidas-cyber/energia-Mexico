import { useNavigate } from "react-router-dom";
import { Sun, Wind, Droplets, Flame, Atom, Mountain, Leaf, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ENERGIAS = [
  { key: "solar", label: "Solar", icon: Sun, color: "from-amber-400 to-yellow-500" },
  { key: "eolica", label: "Eólica", icon: Wind, color: "from-sky-400 to-cyan-500" },
  { key: "hidroelectrica", label: "Hidroeléctrica", icon: Droplets, color: "from-blue-500 to-indigo-500" },
  { key: "termica", label: "Térmica", icon: Flame, color: "from-orange-500 to-red-500" },
  { key: "nuclear", label: "Nuclear", icon: Atom, color: "from-violet-500 to-purple-600" },
  { key: "geotermica", label: "Geotérmica", icon: Mountain, color: "from-emerald-500 to-teal-600" },
  { key: "bioenergia", label: "Bioenergía", icon: Leaf, color: "from-green-500 to-lime-500" },
  { key: "otras", label: "Otras", icon: Zap, color: "from-gray-400 to-slate-500" },
] as const;

export function TabPotenciasMundiales() {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Potencias Mundiales por Energía</h2>
      <p className="text-sm text-muted-foreground">
        Selecciona un tipo de energía para explorar los principales países productores.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ENERGIAS.map(({ key, label, icon: Icon, color }) => (
          <Card
            key={key}
            className="cursor-pointer hover:scale-[1.03] transition-transform border-2 hover:border-primary/40"
            onClick={() => navigate(`/potencias-mundiales/${key}`)}
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
              <div className={`rounded-full p-3 bg-gradient-to-br ${color} text-white`}>
                <Icon className="h-7 w-7" />
              </div>
              <span className="font-medium text-sm text-center">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
