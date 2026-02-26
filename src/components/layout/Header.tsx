import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-primary text-primary-foreground px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="container mx-auto flex items-center gap-2 sm:gap-3">
        <Zap className="h-5 w-5 sm:h-7 sm:w-7 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-bold tracking-tight leading-tight truncate">
            Recursos Energéticos
          </h1>
          <p className="text-[10px] sm:text-xs opacity-80 truncate">
            Análisis del Sistema Energético de México y Mundial
          </p>
        </div>
      </div>
    </header>
  );
}