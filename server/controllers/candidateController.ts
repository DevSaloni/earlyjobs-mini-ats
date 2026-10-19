import { Request, Response, NextFunction } from 'express';
import {
  dbGetAllCandidates,
  dbGetCandidateById,
  dbCreateCandidate,
  dbUpdateCandidate,
  dbUpdateCandidateStage,
  dbDeleteCandidate,
} from '../config/db.ts';
import { CandidateSchema, CandidateUpdateSchema, StageUpdateSchema } from '../validation/candidateValidation.ts';
import { HiringStage } from '../types.ts';

export async function getCandidates(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, stage, jobTitle, sortBy, sortOrder, page = '1', limit = '50' } = req.query;

    const all = await dbGetAllCandidates({
      search: typeof search === 'string' ? search : undefined,
      stage: typeof stage === 'string' ? stage : undefined,
      jobTitle: typeof jobTitle === 'string' ? jobTitle : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : 'appliedAt',
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    });

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 50));
    const total = all.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = all.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      totalPages,
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCandidateById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const candidate = await dbGetCandidateById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: `Candidate with ID "${id}" was not found.`,
      });
    }

    res.json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCandidate(req: Request, res: Response, next: NextFunction) {
  try {
    const validationResult = CandidateSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed. Please verify your inputs.',
        details: formattedErrors,
      });
    }

    try {
      const candidate = await dbCreateCandidate(validationResult.data);
      res.status(201).json({
        success: true,
        message: 'Candidate created successfully.',
        data: candidate,
      });
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: err.message,
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
}

export async function updateCandidate(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validationResult = CandidateUpdateSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed. Please check updated fields.',
        details: formattedErrors,
      });
    }

    try {
      const updated = await dbUpdateCandidate(id, validationResult.data);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Candidate with ID "${id}" was not found.`,
        });
      }

      res.json({
        success: true,
        message: 'Candidate profile updated successfully.',
        data: updated,
      });
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: err.message,
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
}

export async function updateCandidateStage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validationResult = StageUpdateSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid stage supplied.',
        details: validationResult.error.issues,
      });
    }

    const { stage, notes } = validationResult.data;
    const updated = await dbUpdateCandidateStage(id, stage, notes);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Candidate with ID "${id}" was not found.`,
      });
    }

    res.json({
      success: true,
      message: `Candidate moved to ${stage} stage.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCandidate(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await dbDeleteCandidate(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Candidate with ID "${id}" was not found.`,
      });
    }

    res.json({
      success: true,
      message: 'Candidate deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
