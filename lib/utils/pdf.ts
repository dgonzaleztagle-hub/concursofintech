/**
 * @file pdf.ts
 * @description Utilidad para generar y descargar la carta de reclamo en formato PDF.
 */

import { jsPDF } from "jspdf";
import { LetterTemplate } from "./letters";

/**
 * Genera un PDF profesional a partir de una plantilla de carta.
 */
export function downloadLetterPDF(letter: LetterTemplate, fileName: string = "Carta_Reclamo_Beeper.pdf") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);

  // Configuración de Fuente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  // 1. Encabezado
  let currentY = 30;
  const headerLines = doc.splitTextToSize(letter.header, contentWidth);
  doc.text(headerLines, margin, currentY);
  currentY += (headerLines.length * 6) + 10;

  // 2. Cuerpo
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  const bodyLines = doc.splitTextToSize(letter.body, contentWidth);
  doc.text(bodyLines, margin, currentY);
  currentY += (bodyLines.length * 7) + 15;

  // 3. Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const footerLines = doc.splitTextToSize(letter.footer, contentWidth);
  doc.text(footerLines, margin, currentY);

  // 4. Marca de Agua / Sello de Auditoría (Opcional pero Profesional)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, 280, pageWidth - margin, 280);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Documento generado por Beeper Financiero Pro - Auditoría Digital Certificada", margin, 285);

  // Descarga
  doc.save(fileName);
}
