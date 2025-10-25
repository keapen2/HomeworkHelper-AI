import mongoose, { Document, Schema } from 'mongoose';
import { Vote as IVote } from '@homework-helper/shared';

export interface VoteDocument extends IVote, Document {}

const voteSchema = new Schema<VoteDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure one vote per user per question
voteSchema.index({ userId: 1, questionId: 1 }, { unique: true });

// Indexes for performance
voteSchema.index({ questionId: 1 });
voteSchema.index({ userId: 1 });
voteSchema.index({ createdAt: -1 });

export const Vote = mongoose.model<VoteDocument>('Vote', voteSchema);
