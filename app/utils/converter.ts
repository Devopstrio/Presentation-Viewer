import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function convertPptToPdf(pptBuffer: Buffer, extension: string): Promise<Buffer> {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const pptPath = path.join(tempDir, `temp_${uniqueId}${extension}`);
  const pdfPath = path.join(tempDir, `temp_${uniqueId}.pdf`);

  try {
    // Save uploaded file to disk
    await fs.promises.writeFile(pptPath, pptBuffer);

    // Run PowerPoint COM automation converter script
    const pythonScript = path.join(process.cwd(), "convert_ppt.py");
    const { stdout, stderr } = await execAsync(`python "${pythonScript}" "${pptPath}" "${pdfPath}"`);
    console.log("Converter stdout:", stdout);
    if (stderr) console.error("Converter stderr:", stderr);

    // Read converted PDF
    if (!fs.existsSync(pdfPath)) {
      throw new Error("Conversion failed: Converted PDF file was not found.");
    }

    const pdfBuffer = await fs.promises.readFile(pdfPath);
    return pdfBuffer;
  } catch (error) {
    console.error("Error in convertPptToPdf:", error);
    throw error;
  } finally {
    // Cleanup temporary files
    try {
      if (fs.existsSync(pptPath)) await fs.promises.unlink(pptPath);
      if (fs.existsSync(pdfPath)) await fs.promises.unlink(pdfPath);
    } catch (err) {
      console.error("Failed to clean up temp files:", err);
    }
  }
}
