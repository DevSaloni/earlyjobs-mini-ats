import mongoose from 'mongoose';
import { sampleCandidates } from '../seedData.ts';
import { ICandidate, HiringStage } from '../types.ts';

let isConnected = false;
let connectionError: string | null = null;

// In-memory fallback store used exclusively when MONGODB_URI is not configured in environment
let memoryStore: ICandidate[] = [];

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getConnectionStatus() {
  return {
    connected: isDbConnected(),
    readyState: mongoose.connection.readyState,
    readyStateText: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][mongoose.connection.readyState] || 'Unknown',
    uriConfigured: Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== ''),
    error: connectionError,
    activeEngine: isDbConnected() ? 'MongoDB Atlas (Mongoose)' : 'Development Local Repository (Set MONGODB_URI for Atlas)',
  };
}

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('<username>')) {
    connectionError = 'MONGODB_URI environment variable is not configured or contains placeholder credentials.';
    console.warn('⚠️ [MongoDB Atlas] MONGODB_URI is not set. Running in development local repository mode.');
    console.warn('👉 To connect to MongoDB Atlas, add your connection string to MONGODB_URI in the environment.');
    // Initialize development memory store with initial seed
    if (memoryStore.length === 0) {
      memoryStore = sampleCandidates.map((c, index) => ({
        ...c,
        _id: `mem_${index + 1}_${Date.now()}`,
        createdAt: c.appliedAt,
        updatedAt: c.appliedAt,
      }));
    }
    return;
  }

  try {
    console.log('🔄 [MongoDB Atlas] Connecting to cluster via Mongoose...');
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    connectionError = null;
    console.log('✅ [MongoDB Atlas] Successfully connected to database via Mongoose.');

    // Auto-seed if database is completely empty
    const { Candidate } = await import('../models/Candidate.ts');
    const count = await Candidate.countDocuments();
    if (count === 0) {
      console.log('🌱 [MongoDB Atlas] Empty database detected. Seeding 10 demo candidates...');
      await Candidate.insertMany(sampleCandidates);
      console.log('✅ [MongoDB Atlas] Initial seed completed successfully.');
    }
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message || 'Failed to connect to MongoDB Atlas';
    console.error('❌ [MongoDB Atlas] Connection error:', connectionError);
    // Fall back to memory store so server remains functional during development
    if (memoryStore.length === 0) {
      memoryStore = sampleCandidates.map((c, index) => ({
        ...c,
        _id: `mem_${index + 1}_${Date.now()}`,
        createdAt: c.appliedAt,
        updatedAt: c.appliedAt,
      }));
    }
  }
}

// Data access operations that seamlessly use Mongoose when connected or memoryStore when unconfigured
export async function dbGetAllCandidates(query: {
  search?: string;
  stage?: string;
  jobTitle?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ICandidate[]> {
  const { search, stage, jobTitle, sortBy = 'appliedAt', sortOrder = 'desc' } = query;

  if (isDbConnected()) {
    const { Candidate } = await import('../models/Candidate.ts');
    const filter: any = {};

    if (stage && stage !== 'All') {
      filter.stage = stage;
    }

    if (jobTitle && jobTitle !== 'All') {
      filter.jobTitle = jobTitle;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { jobTitle: regex }];
    }

    const sortOption: any = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    sortOption[sortBy] = order;

    const docs = await Candidate.find(filter).sort(sortOption).lean();
    return docs.map((d: any) => ({
      ...d,
      _id: d._id.toString(),
    })) as ICandidate[];
  }

  // Local fallback
  let list = [...memoryStore];

  if (stage && stage !== 'All') {
    list = list.filter((c) => c.stage === stage);
  }

  if (jobTitle && jobTitle !== 'All') {
    list = list.filter((c) => c.jobTitle.toLowerCase() === jobTitle.toLowerCase());
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => {
    let valA: any = (a as any)[sortBy];
    let valB: any = (b as any)[sortBy];
    if (sortBy === 'appliedAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return list;
}

export async function dbGetCandidateById(id: string): Promise<ICandidate | null> {
  if (isDbConnected()) {
    const { Candidate } = await import('../models/Candidate.ts');
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc: any = await Candidate.findById(id).lean();
    if (!doc) return null;
    return {
      ...doc,
      _id: doc._id.toString(),
    } as ICandidate;
  }
  return memoryStore.find((c) => c._id === id) || null;
}

export async function dbCreateCandidate(candidateData: Partial<ICandidate>): Promise<ICandidate> {
  if (isDbConnected()) {
    const { Candidate } = await import('../models/Candidate.ts');
    const existing = await Candidate.findOne({ email: candidateData.email?.toLowerCase().trim() });
    if (existing) {
      throw new Error(`A candidate with email "${candidateData.email}" already exists.`);
    }

    const newCandidate = new Candidate({
      ...candidateData,
      stage: candidateData.stage || 'Applied',
      appliedAt: candidateData.appliedAt || new Date(),
      stageHistory: [
        {
          stage: candidateData.stage || 'Applied',
          timestamp: new Date(),
          notes: 'Candidate created in system',
        },
      ],
    });

    const saved: any = await newCandidate.save();
    const obj = saved.toObject();
    return {
      ...obj,
      _id: obj._id.toString(),
    } as ICandidate;
  }

  // Local fallback
  const existing = memoryStore.find(
    (c) => c.email.toLowerCase().trim() === candidateData.email?.toLowerCase().trim()
  );
  if (existing) {
    throw new Error(`A candidate with email "${candidateData.email}" already exists.`);
  }

  const newRecord: ICandidate = {
    _id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: candidateData.name!,
    email: candidateData.email!.toLowerCase().trim(),
    phone: candidateData.phone || '',
    jobTitle: candidateData.jobTitle!,
    experience: Number(candidateData.experience) || 0,
    skills: candidateData.skills || [],
    resumeUrl: candidateData.resumeUrl || '',
    stage: (candidateData.stage as HiringStage) || 'Applied',
    appliedAt: candidateData.appliedAt ? new Date(candidateData.appliedAt) : new Date(),
    notes: candidateData.notes || '',
    stageHistory: [
      {
        stage: (candidateData.stage as HiringStage) || 'Applied',
        timestamp: new Date(),
        notes: 'Candidate created in system',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryStore.unshift(newRecord);
  return newRecord;
}

export async function dbUpdateCandidate(
  id: string,
  updates: Partial<ICandidate>
): Promise<ICandidate | null> {
  if (isDbConnected()) {
    const { Candidate } = await import('../models/Candidate.ts');
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    if (updates.email) {
      const existing = await Candidate.findOne({
        email: updates.email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new Error(`Another candidate with email "${updates.email}" already exists.`);
      }
    }

    const current = await Candidate.findById(id);
    if (!current) return null;

    // Check if stage is changing to record in stageHistory
    if (updates.stage && updates.stage !== current.stage) {
      current.stageHistory.push({
        stage: updates.stage,
        timestamp: new Date(),
        notes: updates.notes ? `Stage updated: ${updates.notes}` : `Moved to ${updates.stage}`,
      });
    }

    Object.assign(current, updates);
    const updated: any = await current.save();
    const obj = updated.toObject();
    return {
      ...obj,
      _id: obj._id.toString(),
    } as ICandidate;
  }

  // Local fallback
  const index = memoryStore.findIndex((c) => c._id === id);
  if (index === -1) return null;

  if (updates.email) {
    const duplicate = memoryStore.find(
      (c) => c.email.toLowerCase().trim() === updates.email!.toLowerCase().trim() && c._id !== id
    );
    if (duplicate) {
      throw new Error(`Another candidate with email "${updates.email}" already exists.`);
    }
  }

  const current = memoryStore[index];
  const history = [...(current.stageHistory || [])];

  if (updates.stage && updates.stage !== current.stage) {
    history.push({
      stage: updates.stage,
      timestamp: new Date(),
      notes: updates.notes ? `Stage updated: ${updates.notes}` : `Moved to ${updates.stage}`,
    });
  }

  const updatedRecord: ICandidate = {
    ...current,
    ...updates,
    stageHistory: history,
    updatedAt: new Date(),
  };

  memoryStore[index] = updatedRecord;
  return updatedRecord;
}

export async function dbUpdateCandidateStage(
  id: string,
  stage: HiringStage,
  notes?: string
): Promise<ICandidate | null> {
  if (isDbConnected()) {
    const { Candidate } = await import('../models/Candidate.ts');
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const candidate = await Candidate.findById(id);
    if (!candidate) return null;

    const previousStage = candidate.stage;
    candidate.stage = stage;
    candidate.stageHistory.push({
      stage,
      timestamp: new Date(),
      notes: notes || `Stage transitioned from ${previousStage} to ${stage}`,
    });

    const saved: any = await candidate.save();
    const obj = saved.toObject();
    return {
      ...obj,
      _id: obj._id.toString(),
    } as ICandidate;
  }

  // Local fallback
  const index = memoryStore.findIndex((c) => c._id === id);
  if (index === -1) return null;

  const current = memoryStore[index];
  const previousStage = current.stage;
  const history = [...(current.stageHistory || [])];

  history.push({
    stage,
    timestamp: new Date(),
    notes: notes || `Stage transitioned from ${previousStage} to ${stage}`,
  });

  const updated: ICandidate = {
    ...current,
    stage,
    stageHistory: history,
    updatedAt: new Date(),
  };

  memoryStore[index] = updated;
  return updated;
}

export async function dbDeleteCandidate(id: string): Promise<boolean> {
  if (isDbConnected()) {
    const { Candidate } = await import('../models/Candidate.ts');
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await Candidate.findByIdAndDelete(id);
    return Boolean(res);
  }

  const index = memoryStore.findIndex((c) => c._id === id);
  if (index === -1) return false;
  memoryStore.splice(index, 1);
  return true;
}

export async function dbGetDistinctJobs(): Promise<string[]> {
  if (isDbConnected()) {
    const { Candidate } = await import('../models/Candidate.ts');
    const jobs = await Candidate.distinct('jobTitle');
    return jobs.sort();
  }

  const jobs = Array.from(new Set(memoryStore.map((c) => c.jobTitle))).sort();
  return jobs;
}

export async function dbSeedCandidates(reset = false): Promise<{ count: number; message: string }> {
  if (isDbConnected()) {
    const { Candidate } = await import('../models/Candidate.ts');
    if (reset) {
      await Candidate.deleteMany({});
    }
    const currentCount = await Candidate.countDocuments();
    if (currentCount > 0 && !reset) {
      return { count: currentCount, message: 'Database already has candidates. Pass ?reset=true to re-seed.' };
    }
    const inserted = await Candidate.insertMany(sampleCandidates);
    return { count: inserted.length, message: `Successfully seeded ${inserted.length} candidates.` };
  }

  if (reset || memoryStore.length === 0) {
    memoryStore = sampleCandidates.map((c, index) => ({
      ...c,
      _id: `mem_${index + 1}_${Date.now()}`,
      createdAt: c.appliedAt,
      updatedAt: c.appliedAt,
    }));
  }
  return { count: memoryStore.length, message: `Successfully seeded ${memoryStore.length} demo candidates.` };
}
