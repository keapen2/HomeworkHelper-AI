import mongoose, { Document, Schema } from 'mongoose';
import { Question as IQuestion } from '@homework-helper/shared';

export interface QuestionDocument extends IQuestion, Document {
  calculateTrendingScore(): number;
}

const questionSchema = new Schema<QuestionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Literature', 'Geography', 'Economics', 'Psychology', 'Philosophy', 'Art', 'Music', 'Foreign Language', 'Other'],
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [2000, 'Question text cannot exceed 2000 characters'],
  },
  aiAnswer: {
    type: String,
    trim: true,
    maxlength: [5000, 'AI answer cannot exceed 5000 characters'],
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0,
  },
  trendingScore: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
});

// Method to calculate trending score
questionSchema.methods.calculateTrendingScore = function(): number {
  const hoursSincePosted = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  const decayFactor = 1.5;
  const timeOffset = 2;
  
  return this.upvotes / Math.pow(hoursSincePosted + timeOffset, decayFactor);
};

// Update trending score before saving
questionSchema.pre('save', function(next) {
  this.trendingScore = this.calculateTrendingScore();
  next();
});

// Indexes for performance
questionSchema.index({ userId: 1 });
questionSchema.index({ subject: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ trendingScore: -1 });
questionSchema.index({ upvotes: -1 });
questionSchema.index({ subject: 1, trendingScore: -1 });

export const Question = mongoose.model<QuestionDocument>('Question', questionSchema);
