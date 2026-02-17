import { Download } from "lucide-react";
import { useRef, useCallback, useState, forwardRef } from "react";
import { downloadMapAsImage } from "@/utils/downloadMap";
import { Button } from "@/components/ui/button";

/** Hook that returns a ref and a download button to capture the ref'd element as PNG */
export function useMapDownload(filename: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      await downloadMapAsImage(ref.current, filename);
    } catch (e) {
      console.error("Error al descargar mapa:", e);
    } finally {
      setDownloading(false);
    }
  }, [filename]);

  const DownloadButton = () => (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs"
      onClick={handleDownload}
      disabled={downloading}
    >
      <Download className="h-3.5 w-3.5" />
      {downloading ? "Descargando…" : "Descargar PNG"}
    </Button>
  );

  return { ref, DownloadButton };
}
