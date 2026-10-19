import { Request, Response, NextFunction } from 'express';
import { dbGetDistinctJobs } from '../config/db.ts';

const DEFAULT_STANDARD_ROLES = [
  'Full Stack Developer Intern',
  'Frontend Engineer',
  'Backend Engineer',
  'Product Designer',
  'DevOps Engineer',
];

export async function getJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const existingJobs = await dbGetDistinctJobs();
    // Combine standard roles with any custom roles added by recruiters
    const allRoles = Array.from(new Set([...DEFAULT_STANDARD_ROLES, ...existingJobs])).sort();

    res.json({
      success: true,
      count: allRoles.length,
      data: allRoles,
    });
  } catch (error) {
    next(error);
  }
}
