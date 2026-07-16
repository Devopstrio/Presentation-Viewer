import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Presentation from "@/app/models/Presentation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Fetch all presentations, sorted by presentationDate descending
    const presentations = await Presentation.find({}).sort({ presentationDate: -1 });

    return NextResponse.json({
      success: true,
      data: presentations.map((p) => ({
        id: p._id,
        title: p.title,
        presenterName: p.presenterName,
        presentationDate: p.presentationDate,
        fileName: p.fileName,
        fileUrl: p.fileUrl,
        uploadedAt: p.uploadedAt,
      })),
    });
  } catch (error: any) {
    console.error("GET presentations list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch presentations list" },
      { status: 500 }
    );
  }
}
