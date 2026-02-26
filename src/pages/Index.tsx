import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KPIBar } from "@/components/layout/KPIBar";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabSEN } from "@/components/tabs/TabSEN";
import { TabPlantas } from "@/components/tabs/TabPlantas";
import { TabPotenciaEstado } from "@/components/tabs/TabPotenciaEstado";
import { TabPlantasEstado } from "@/components/tabs/TabPlantasEstado";
import { TabDuenos } from "@/components/tabs/TabDuenos";
import { TabPotenciasMundiales } from "@/components/tabs/TabPotenciasMundiales";
import { TabGasoductos } from "@/components/tabs/TabGasoductos";
import { TabAcercaDe } from "@/components/tabs/TabAcercaDe";
import { useSearchParams } from "react-router-dom";

const TAB_MAP: Record<string, string> = {
  potencias: "potencias-mundiales",
};

const Index = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = (tabParam && TAB_MAP[tabParam]) || tabParam || "plantas";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <KPIBar />
      <FilterPanel />

      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4">
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="overflow-x-auto -mx-2 px-2 pb-2 scrollbar-hide">
            <TabsList className="inline-flex w-max h-auto gap-1 p-1">
              <TabsTrigger value="sen" className="text-xs px-2.5 py-2 min-w-max">SEN: Transmisión</TabsTrigger>
              <TabsTrigger value="plantas" className="text-xs px-2.5 py-2 min-w-max">Plantas por Energía</TabsTrigger>
              <TabsTrigger value="potencia-estado" className="text-xs px-2.5 py-2 min-w-max">Potencia por Estado</TabsTrigger>
              <TabsTrigger value="plantas-estado" className="text-xs px-2.5 py-2 min-w-max">Plantas por Estado</TabsTrigger>
              <TabsTrigger value="duenos" className="text-xs px-2.5 py-2 min-w-max">Propiedad y Dueños</TabsTrigger>
              <TabsTrigger value="gasoductos" className="text-xs px-2.5 py-2 min-w-max">Gasoductos</TabsTrigger>
              <TabsTrigger value="potencias-mundiales" className="text-xs px-2.5 py-2 min-w-max">Potencias Mundiales</TabsTrigger>
              <TabsTrigger value="acerca-de" className="text-xs px-2.5 py-2 min-w-max">Acerca de</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sen"><TabSEN /></TabsContent>
          <TabsContent value="plantas"><TabPlantas /></TabsContent>
          <TabsContent value="potencia-estado"><TabPotenciaEstado /></TabsContent>
          <TabsContent value="plantas-estado"><TabPlantasEstado /></TabsContent>
          <TabsContent value="duenos"><TabDuenos /></TabsContent>
          <TabsContent value="gasoductos"><TabGasoductos /></TabsContent>
          <TabsContent value="potencias-mundiales"><TabPotenciasMundiales /></TabsContent>
          <TabsContent value="acerca-de"><TabAcercaDe /></TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
