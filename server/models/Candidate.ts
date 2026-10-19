import mongoose, { Schema, Document } from 'mongoose';
import { HiringStage, HIRING_STAGES, IStageHistory } from '../types.ts';

export interface ICandidateDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  experience: number;
  skills: string[];
  resumeUrl?: string;
  stage: HiringStage;
  appliedAt: Date;
  notes?: string;
  stageHistory: IStageHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const StageHistorySchema = new Schema<IStageHistory>(
  {
    stage: {
      type: String,
      required: true,
      enum: HIRING_STAGES,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const CandidateSchema = new Schema<ICandidateDocument>(
  {
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Candidate email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    experience: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Experience cannot be negative'],
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    stage: {
      type: String,
      enum: HIRING_STAGES,
      default: 'Applied',
      required: true,
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    stageHistory: {
      type: [StageHistorySchema],
      default: function (this: ICandidateDocument) {
        return [{ stage: this.stage || 'Applied', timestamp: new Date(), notes: 'Application submitted' }];
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for rapid search and filter query performance
CandidateSchema.index({ name: 'text', jobTitle: 'text', email: 'text' });
CandidateSchema.index({ appliedAt: -1 });
CandidateSchema.index({ stage: 1, jobTitle: 1 });

export const Candidate = mongoose.model<ICandidateDocument>('Candidate', CandidateSchema);
