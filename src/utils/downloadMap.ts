import html2canvas from "html2canvas";

export async function downloadMapAsImage(element: HTMLElement, filename: string) {
  // Scroll element into view to minimize offset issues
  element.scrollIntoView({ block: "center", behavior: "instant" });
  // Small delay to let tiles settle
  await new Promise((r) => setTimeout(r, 300));

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    scale: 2,
    logging: false,
    // Fix offset: capture from element's position relative to document
    scrollX: 0,
    scrollY: -window.scrollY,
  });
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
