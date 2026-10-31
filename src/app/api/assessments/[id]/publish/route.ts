import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: assessmentId } = await params;

  try {
    // Update assessment to published
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        publicationStatus: "published",
        publishedAt: new Date(),
        status: "completed",
      },
    });

    // Copy overallFinalScore to publishedScore for all final submissions
    const submissions = await prisma.submission.findMany({
      where: {
        assessmentId,
        statusGrading: "final",
      },
    });

    for (const sub of submissions) {
      if (sub.overallFinalScore !== null) {
        await prisma.submission.update({
          where: { id: sub.id },
          data: {
            publishedScore: sub.overallFinalScore,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      publishedCount: submissions.length,
    });
  } catch (err: any) {
    console.error("Publish assessment error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menerbitkan nilai" },
      { status: 500 }
    );
  }
}
