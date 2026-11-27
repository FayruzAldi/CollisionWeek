import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { differenceInHours } from "date-fns";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Otorisasi: `analytics.view` (dosen/admin).
    const { user } = await requireCapability("analytics.view");

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const where: any = {};
    if (user.role !== "ADMIN") {
      where.assignment = {
        course: { programId: user.programId },
        ...(courseId && courseId !== "all" ? { courseId } : {}),
      };
    } else if (courseId && courseId !== "all") {
      where.assignment = { courseId };
    }

    const allRequests = await prisma.helpRequest.findMany({
      where,
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            weekNumber: true,
            course: {
              select: {
                id: true,
                courseCode: true,
                courseName: true,
                color: true,
              },
            },
          },
        },
        responses: {
          select: {
            id: true,
            responseType: true,
            createdAt: true,
          },
        },
      },
    });

    // Group by subtopic and course
    const subtopicStatsMap = new Map<
      string,
      {
        subtopic: string;
        courseCode: string;
        courseName: string;
        courseColor: string;
        totalRequests: number;
        openCount: number;
        inProgressCount: number;
        resolvedCount: number;
        responseTimesHours: number[];
        responseTypes: {
          written: number;
          recorded: number;
          session: number;
        };
      }
    >();

    for (const r of allRequests) {
      const key = `${r.assignment.course.courseCode}:::${r.subtopicLabel}`;
      if (!subtopicStatsMap.has(key)) {
        subtopicStatsMap.set(key, {
          subtopic: r.subtopicLabel,
          courseCode: r.assignment.course.courseCode,
          courseName: r.assignment.course.courseName,
          courseColor: r.assignment.course.color || "#3b82f6",
          totalRequests: 0,
          openCount: 0,
          inProgressCount: 0,
          resolvedCount: 0,
          responseTimesHours: [],
          responseTypes: {
            written: 0,
            recorded: 0,
            session: 0,
          },
        });
      }

      const item = subtopicStatsMap.get(key)!;
      item.totalRequests += 1;
      if (r.status === "OPEN") item.openCount += 1;
      else if (r.status === "IN_PROGRESS") item.inProgressCount += 1;
      else if (r.status === "RESOLVED") item.resolvedCount += 1;

      if (r.firstResponseAt) {
        const hours = differenceInHours(new Date(r.firstResponseAt), new Date(r.createdAt));
        item.responseTimesHours.push(Math.max(0, hours));
      }

      for (const res of r.responses) {
        if (res.responseType === "WRITTEN") item.responseTypes.written += 1;
        else if (res.responseType === "RECORDED_LINK") item.responseTypes.recorded += 1;
        else if (res.responseType === "SESSION_20MIN") item.responseTypes.session += 1;
      }
    }

    const subtopicRankings = Array.from(subtopicStatsMap.values()).map((s) => {
      const avgResponseTimeHours =
        s.responseTimesHours.length > 0
          ? Math.round(
              s.responseTimesHours.reduce((a, b) => a + b, 0) / s.responseTimesHours.length
            )
          : null;

      const resolutionRate =
        s.totalRequests > 0
          ? Math.round((s.resolvedCount / s.totalRequests) * 100)
          : 0;

      // Pedagogical recommendation for lecturer
      let recommendation = "Topic understanding is stable. Continue standard pacing.";
      let severity: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

      if (s.totalRequests >= 2 && resolutionRate < 60) {
        recommendation = `High academic friction detected (${s.totalRequests} help requests, ${resolutionRate}% resolved). Recommended action: Host a 20-min review session or supplement with code walkthroughs.`;
        severity = "CRITICAL";
      } else if (s.totalRequests >= 2) {
        recommendation = `Popular inquiry topic (${s.totalRequests} requests). Peer responses are active (${resolutionRate}% resolved). Consider sharing best-practice examples.`;
        severity = "WARNING";
      }

      return {
        ...s,
        avgResponseTimeHours,
        resolutionRate,
        recommendation,
        severity,
      };
    });

    // Sort by total requests descending
    subtopicRankings.sort((a, b) => b.totalRequests - a.totalRequests);

    // High level metrics
    const totalRequestsCount = allRequests.length;
    const resolvedTotal = allRequests.filter((r) => r.status === "RESOLVED").length;
    const overallResolutionRate =
      totalRequestsCount > 0 ? Math.round((resolvedTotal / totalRequestsCount) * 100) : 0;

    const allFirstResponseTimes = allRequests
      .filter((r) => r.firstResponseAt)
      .map((r) => differenceInHours(new Date(r.firstResponseAt!), new Date(r.createdAt)));

    const overallAvgFirstResponseHours =
      allFirstResponseTimes.length > 0
        ? Math.round(allFirstResponseTimes.reduce((a, b) => a + b, 0) / allFirstResponseTimes.length)
        : 4;

    return NextResponse.json({
      summary: {
        totalRequests: totalRequestsCount,
        resolvedTotal,
        overallResolutionRate,
        overallAvgFirstResponseHours,
        criticalSubtopicsCount: subtopicRankings.filter((s) => s.severity === "CRITICAL").length,
      },
      rankings: subtopicRankings,
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching subtopic analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch subtopic analytics" },
      { status: 500 }
    );
  }
}
