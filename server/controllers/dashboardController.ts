import { Request, Response, NextFunction } from 'express';
import { dbGetAllCandidates } from '../config/db.ts';
import { HiringStage, HIRING_STAGES, DashboardStats } from '../types.ts';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const candidates = await dbGetAllCandidates({ sortBy: 'appliedAt', sortOrder: 'desc' });

    const totalCandidates = candidates.length;

    // Stage counts
    const stageCounts: Record<HiringStage, number> = {
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Hired: 0,
      Rejected: 0,
    };

    candidates.forEach((c) => {
      if (stageCounts[c.stage] !== undefined) {
        stageCounts[c.stage] += 1;
      }
    });

    // 7 days window
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const newApplicantsLast7Days = candidates.filter((c) => {
      const appliedTime = new Date(c.appliedAt).getTime();
      return appliedTime >= sevenDaysAgo.getTime();
    }).length;

    // Generate day buckets for each of the last 7 days (from 6 days ago up to today)
    const dailyBuckets: { [key: string]: { label: string; count: number; date: string } } = {};
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      const monthName = months[d.getMonth()];
      const dayNum = d.getDate();
      const label = `${dayName}, ${monthName} ${dayNum}`;

      dailyBuckets[dateKey] = {
        date: dateKey,
        label,
        count: 0,
      };
    }

    candidates.forEach((c) => {
      const candidateDate = new Date(c.appliedAt).toISOString().split('T')[0];
      if (dailyBuckets[candidateDate]) {
        dailyBuckets[candidateDate].count += 1;
      }
    });

    const dailyApplicationsLast7Days = Object.values(dailyBuckets);

    // Recent applicants (most recent 6)
    const recentApplicants = candidates.slice(0, 6);

    const stats: DashboardStats = {
      totalCandidates,
      newApplicantsLast7Days,
      stageCounts,
      dailyApplicationsLast7Days,
      recentApplicants,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
