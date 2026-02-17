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
import { TabDiapositiva } from "@/components/tabs/TabDiapositiva";
import { TabGasoductos } from "@/components/tabs/TabGasoductos";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <KPIBar />
      <FilterPanel />

      <main className="flex-1 container mx-auto px-4 py-4">
        <Tabs defaultValue="plantas" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1">
            <TabsTrigger value="sen" className="text-xs">SEN: Transmisión</TabsTrigger>
            <TabsTrigger value="plantas" className="text-xs">Plantas por Energía</TabsTrigger>
            <TabsTrigger value="potencia-estado" className="text-xs">Potencia por Estado</TabsTrigger>
            <TabsTrigger value="plantas-estado" className="text-xs">Plantas por Estado</TabsTrigger>
            <TabsTrigger value="duenos" className="text-xs">Propiedad y Dueños</TabsTrigger>
            <TabsTrigger value="gasoductos" className="text-xs">Gasoductos</TabsTrigger>
            <TabsTrigger value="diapositiva" className="text-xs">Diapositiva / Evaluación</TabsTrigger>
          </TabsList>

          <TabsContent value="sen"><TabSEN /></TabsContent>
          <TabsContent value="plantas"><TabPlantas /></TabsContent>
          <TabsContent value="potencia-estado"><TabPotenciaEstado /></TabsContent>
          <TabsContent value="plantas-estado"><TabPlantasEstado /></TabsContent>
          <TabsContent value="duenos"><TabDuenos /></TabsContent>
          <TabsContent value="gasoductos"><TabGasoductos /></TabsContent>
          <TabsContent value="diapositiva"><TabDiapositiva /></TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
