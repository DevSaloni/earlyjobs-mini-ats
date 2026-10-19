import { Router, Request, Response } from 'express';
import {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  updateCandidateStage,
  deleteCandidate,
} from '../controllers/candidateController.ts';
import { getDashboardStats } from '../controllers/dashboardController.ts';
import { getJobs } from '../controllers/jobController.ts';
import { getConnectionStatus, dbSeedCandidates, isDbConnected } from '../config/db.ts';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', async (req: Request, res: Response) => {
  const status = getConnectionStatus();
  const uptimeSeconds = process.uptime();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeSeconds)}s`,
    database: status,
    service: 'EarlyJobs ATS Mini API',
    version: '1.0.0',
  });
});

// Candidate routes
apiRouter.get('/candidates', getCandidates);
apiRouter.get('/candidates/:id', getCandidateById);
apiRouter.post('/candidates', createCandidate);
apiRouter.put('/candidates/:id', updateCandidate);
apiRouter.patch('/candidates/:id/stage', updateCandidateStage);
apiRouter.delete('/candidates/:id', deleteCandidate);

// Dashboard routes
apiRouter.get('/dashboard/stats', getDashboardStats);

// Job categories routes
apiRouter.get('/jobs', getJobs);

// Database seeding endpoint
apiRouter.post('/seed', async (req: Request, res: Response) => {
  try {
    const reset = req.query.reset === 'true' || req.body?.reset === true;
    const result = await dbSeedCandidates(reset);
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Seeding failed',
    });
  }
});
