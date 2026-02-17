export function Footer() {
  return (
    <footer className="border-t bg-muted px-4 py-3 text-xs text-muted-foreground">
      <div className="container mx-auto flex flex-wrap gap-x-4 gap-y-1 justify-between">
        <span>© {new Date().getFullYear()} Recursos Energéticos UAM AZC</span>
        <div className="flex flex-wrap gap-x-3">
          <span>Datos: OpenStreetMap / OpenInfraMap</span>
          <span>•</span>
          <span>PLANEAS / CONACYT</span>
          <span>•</span>
          <span>CFEnergía</span>
        </div>
      </div>
    </footer>
  );
}
