import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Presentation from "@/app/models/Presentation";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid presentation ID" }, { status: 400 });
    }

    const presentation = await Presentation.findById(id);

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    return NextResponse.json({
      metadata: {
        id: presentation._id,
        title: presentation.title,
        presenterName: presentation.presenterName,
        presentationDate: presentation.presentationDate,
        fileName: presentation.fileName,
        fileUrl: presentation.fileUrl,
        uploadedAt: presentation.uploadedAt,
        createdAt: presentation.createdAt,
      },
    });
  } catch (error: any) {
    console.error("GET Presentation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch presentation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid presentation ID" }, { status: 400 });
    }

    const presentation = await Presentation.findById(id);

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    // Delete file from local filesystem or GridFS
    if (presentation.fileId) {
      // 1. Try local filesystem first
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const localFileName = `${presentation.fileId.toString()}-${presentation.fileName}`;
      const localFilePath = path.join(uploadDir, localFileName);
      
      let deletedLocally = false;
      try {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
          console.log(`Local file ${localFilePath} deleted`);
          deletedLocally = true;
        }
      } catch (err) {
        console.warn("Failed to delete local file:", err);
      }

      // 2. Fall back to GridFS delete if not deleted locally (legacy support)
      if (!deletedLocally) {
        const db = mongoose.connection.db;
        if (db) {
          const bucket = new GridFSBucket(db as any, { bucketName: "presentations" });
          try {
            await bucket.delete(new mongoose.Types.ObjectId(presentation.fileId));
            console.log(`GridFS file ${presentation.fileId} deleted`);
          } catch (err) {
            console.warn("Failed to delete GridFS file:", err);
          }
        }
      }
    }

    // Delete from database
    await Presentation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Presentation deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE Presentation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete presentation" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid presentation ID" }, { status: 400 });
    }

    const body = await request.json();
    const { presenterName, presentationDate } = body;

    if (!presenterName || !presentationDate) {
      return NextResponse.json(
        { error: "Presentation name and scheduled date are required." },
        { status: 400 }
      );
    }

    const dateVal = new Date(presentationDate);
    if (isNaN(dateVal.getTime())) {
      return NextResponse.json({ error: "Invalid scheduled date." }, { status: 400 });
    }

    const updated = await Presentation.findByIdAndUpdate(
      id,
      { presenterName, presentationDate: dateVal },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Presentation updated successfully.",
      data: {
        id: updated._id,
        title: updated.title,
        presenterName: updated.presenterName,
        presentationDate: updated.presentationDate,
        fileName: updated.fileName,
        fileUrl: updated.fileUrl,
        uploadedAt: updated.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error("PUT Presentation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update presentation" },
      { status: 500 }
    );
  }
}
