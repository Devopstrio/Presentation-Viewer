import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Presentation from "@/app/models/Presentation";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Safe timeout window

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const presenterName = formData.get("presenterName") as string;
    const presentationDateStr = formData.get("presentationDate") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!presenterName || !presentationDateStr) {
      return NextResponse.json(
        { error: "Presentation name and scheduled date are required." },
        { status: 400 }
      );
    }

    const presentationDate = new Date(presentationDateStr);
    if (isNaN(presentationDate.getTime())) {
      return NextResponse.json({ error: "Invalid scheduled date." }, { status: 400 });
    }

    const fileName = file.name;
    const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

    if (extension !== ".mp4") {
      return NextResponse.json(
        { error: "Invalid file format. Only MP4 video files are supported." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Save the file locally to avoid Cosmos DB vCore GridFS bugs
    const fileId = new mongoose.Types.ObjectId();
    const uniqueFileName = `${fileId.toString()}-${fileName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Write file to local disk
    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.promises.writeFile(filePath, fileBuffer);

    // Create presentation metadata record in MongoDB
    const title = fileName.replace(/\.[^/.]+$/, "");
    const fileUrl = `/uploads/${uniqueFileName}`;

    const presentation = await Presentation.create({
      title,
      presenterName,
      presentationDate,
      fileName,
      fileUrl,
      fileId,
      uploadedAt: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Presentation uploaded successfully.",
      data: {
        id: presentation._id,
        title: presentation.title,
        presenterName: presentation.presenterName,
        presentationDate: presentation.presentationDate,
        fileName: presentation.fileName,
        fileUrl: presentation.fileUrl,
        uploadedAt: presentation.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
