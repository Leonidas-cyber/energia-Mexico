import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-primary text-primary-foreground px-4 py-3">
      <div className="container mx-auto flex items-center gap-3">
        <Zap className="h-7 w-7" />
        <div>
          <h1 className="text-lg font-bold tracking-tight leading-tight">
            Recursos Energéticos UAM AZC
          </h1>
          <p className="text-xs opacity-80">
            Análisis del Sistema Energético de México
          </p>
        </div>
      </div>
    </header>
  );
}
