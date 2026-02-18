import html2canvas from "html2canvas";

export async function downloadMapAsImage(element: HTMLElement, filename: string) {
  // Llevar el mapa a viewport antes de capturar (evita recortes en pantallas pequeñas)
  element.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });

  // Espera breve para que terminen de renderizarse tiles/capas
  await new Promise((resolve) => setTimeout(resolve, 350));

  const canvas = await html2canvas(element, {
    useCORS: true,
    // Evita canvas "tainted" que puede romper toDataURL
    allowTaint: false,
    backgroundColor: "#ffffff",
    scale: 2,
    logging: false,
  });

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
