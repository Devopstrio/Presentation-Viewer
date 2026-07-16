import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function nodeStreamToWebStream(nodeStream: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      nodeStream.on("end", () => {
        controller.close();
      });
      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    await connectToDatabase();
    const { fileId } = await params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    // 1. Check if the file is stored locally in public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (fs.existsSync(uploadDir)) {
      const dirFiles = await fs.promises.readdir(uploadDir);
      const matchedFile = dirFiles.find((f) => f.startsWith(fileId));
      if (matchedFile) {
        const filePath = path.join(uploadDir, matchedFile);
        const stats = await fs.promises.stat(filePath);
        
        // Convert local Node.js read stream to Web ReadableStream
        const fileStream = fs.createReadStream(filePath);
        const webStream = nodeStreamToWebStream(fileStream as any);

        const ext = matchedFile.substring(matchedFile.lastIndexOf(".")).toLowerCase();
        let contentType = "video/mp4";
        if (ext === ".pptx") {
          contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        } else if (ext === ".ppt") {
          contentType = "application/vnd.ms-powerpoint";
        } else if (ext === ".pdf") {
          contentType = "application/pdf";
        }

        const originalName = matchedFile.substring(fileId.length + 1);

        return new NextResponse(webStream, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${originalName}"`,
            "Content-Length": stats.size.toString(),
          },
        });
      }
    }

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database connection lost" }, { status: 500 });
    }

    const bucket = new GridFSBucket(db as any, { bucketName: "presentations" });
    const objectId = new mongoose.Types.ObjectId(fileId);

    // Fetch file metadata to verify existence and get content length
    const files = await db
      .collection("presentations.files")
      .find({ _id: objectId })
      .toArray();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileMeta = files[0];
    const downloadStream = bucket.openDownloadStream(objectId);
    const webStream = nodeStreamToWebStream(downloadStream);

    const filename = fileMeta.filename || "presentation.mp4";
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".mp4") {
      contentType = "video/mp4";
    } else if (ext === ".pptx") {
      contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    } else if (ext === ".ppt") {
      contentType = "application/vnd.ms-powerpoint";
    } else if (ext === ".pdf") {
      contentType = "application/pdf";
    }

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": fileMeta.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("GET PDF File stream error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve PDF file" },
      { status: 500 }
    );
  }
}
