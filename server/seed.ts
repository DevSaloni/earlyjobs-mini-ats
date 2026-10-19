import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, dbSeedCandidates } from './config/db.ts';

async function runSeed() {
  console.log('🌱 Starting EarlyJobs ATS database seed process...');
  await connectDatabase();
  const res = await dbSeedCandidates(true);
  console.log(`✅ Seed finished: ${res.message} (Total: ${res.count})`);
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seed script error:', err);
  process.exit(1);
});
