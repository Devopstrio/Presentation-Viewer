import { PDFDocument } from "pdf-lib";

export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  try {
    // Load the PDF document in memory
    const pdfDoc = await PDFDocument.load(buffer);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error("Error getting PDF page count:", error);
    throw error;
  }
}
