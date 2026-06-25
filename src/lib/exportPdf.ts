import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/** Remove acentos/caracteres inválidos pra usar no nome do arquivo. */
function slugify(name: string): string {
  return (name || "pagina")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "pagina";
}

/**
 * Captura um elemento do DOM e gera um PDF (A4 retrato, multi-página) pra download.
 * Funciona bem com o tema escuro/gradientes; imagens externas precisam permitir CORS.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  // Cor de fundo real do elemento (evita fundo transparente/preto inesperado no PDF).
  const bg = getComputedStyle(element).backgroundColor || "#0d0d0d";

  const canvas = await html2canvas(element, {
    scale: Math.min(window.devicePixelRatio || 1, 2),
    useCORS: true,
    allowTaint: false,
    backgroundColor: bg === "rgba(0, 0, 0, 0)" ? "#0d0d0d" : bg,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Largura da imagem = largura da página; altura proporcional.
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  // Páginas adicionais, deslocando a mesma imagem pra cima.
  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${slugify(fileName)}.pdf`);
}
