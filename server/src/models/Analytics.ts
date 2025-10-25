import mongoose, { Document, Schema } from 'mongoose';
import { Analytics as IAnalytics } from '@homework-helper/shared';

export interface AnalyticsDocument extends IAnalytics, Document {}

const analyticsSchema = new Schema<AnalyticsDocument>({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    unique: true,
  },
  totalUsers: {
    type: Number,
    required: [true, 'Total users is required'],
    min: [0, 'Total users cannot be negative'],
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions is required'],
    min: [0, 'Total questions cannot be negative'],
  },
  questionsBySubject: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  topStruggles: [{
    type: String,
    trim: true,
    maxlength: [200, 'Struggle topic cannot exceed 200 characters'],
  }],
  averageResponseTime: {
    type: Number,
    required: [true, 'Average response time is required'],
    min: [0, 'Average response time cannot be negative'],
  },
  userEngagement: {
    type: Number,
    required: [true, 'User engagement is required'],
    min: [0, 'User engagement cannot be negative'],
    max: [100, 'User engagement cannot exceed 100%'],
  },
}, {
  timestamps: true,
});

// Indexes for performance
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ totalUsers: -1 });
analyticsSchema.index({ totalQuestions: -1 });

export const Analytics = mongoose.model<AnalyticsDocument>('Analytics', analyticsSchema);
