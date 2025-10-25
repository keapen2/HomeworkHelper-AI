import mongoose, { Document, Schema } from 'mongoose';
import { StudyPath as IStudyPath, StudyTopic, ProgressEntry } from '@homework-helper/shared';

export interface StudyPathDocument extends IStudyPath, Document {}

const studyTopicSchema = new Schema<StudyTopic>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Topic name is required'],
    trim: true,
    maxlength: [200, 'Topic name cannot exceed 200 characters'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Literature', 'Geography', 'Economics', 'Psychology', 'Philosophy', 'Art', 'Music', 'Foreign Language', 'Other'],
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  prerequisites: [{
    type: String,
    trim: true,
  }],
  estimatedTime: {
    type: Number,
    required: [true, 'Estimated time is required'],
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [10080, 'Estimated time cannot exceed 1 week'],
  },
  resources: [{
    type: String,
    trim: true,
    maxlength: [500, 'Resource URL cannot exceed 500 characters'],
  }],
}, { _id: false });

const progressEntrySchema = new Schema<ProgressEntry>({
  topicId: {
    type: String,
    required: [true, 'Topic ID is required'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: [0, 'Time spent cannot be negative'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
}, { _id: false });

const studyPathSchema = new Schema<StudyPathDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  topics: [studyTopicSchema],
  progress: [progressEntrySchema],
  recommendations: [{
    type: String,
    trim: true,
    maxlength: [500, 'Recommendation cannot exceed 500 characters'],
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for performance
studyPathSchema.index({ userId: 1 });
studyPathSchema.index({ lastUpdated: -1 });

export const StudyPath = mongoose.model<StudyPathDocument>('StudyPath', studyPathSchema);
