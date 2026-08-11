import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [totalStudents, totalCourses, totalReviews, totalRevenue, totalEnrollments, publishedCourses, recentEnrollments, pendingReviews, avgRatingResult] =
      await Promise.all([
        db.user.count({ where: { role: 'student' } }),
        db.course.count(),
        db.review.count({ where: { status: 'approved' } }),
        db.payment.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
        db.enrollment.count(),
        db.course.count({ where: { status: 'published' } }),
        db.enrollment.findMany({
          take: 5,
          orderBy: { enrolledAt: 'desc' },
          include: {
            user: { select: { name: true } },
            course: { select: { title: true } },
          },
        }),
        db.review.findMany({
          where: { status: 'pending' },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        }),
        db.review.aggregate({
          where: { status: 'approved' },
          _avg: { rating: true },
        }),
      ])

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalReviews,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalEnrollments,
        publishedCourses,
        recentEnrollments: recentEnrollments.map((e) => ({
          userName: e.user.name || 'Student',
          courseTitle: e.course.title,
          enrolledAt: e.enrolledAt,
        })),
        pendingReviews: pendingReviews.map((r) => ({
          id: r.id,
          userName: r.user.name || 'Student',
          rating: r.rating,
          comment: r.comment,
          courseId: r.courseId,
          createdAt: r.createdAt,
        })),
        avgRating: avgRatingResult._avg.rating || 0,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load stats' },
      { status: 500 }
    )
  }
}
