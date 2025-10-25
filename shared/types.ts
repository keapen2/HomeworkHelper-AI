// Shared TypeScript interfaces and types

export interface User {
  _id: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
  studyPreferences?: {
    subjects: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface Question {
  _id: string;
  userId: string;
  subject: string;
  questionText: string;
  aiAnswer?: string;
  upvotes: number;
  createdAt: Date;
  trendingScore: number;
  tags?: string[];
}

export interface Vote {
  _id: string;
  userId: string;
  questionId: string;
  createdAt: Date;
}

export interface StudyPath {
  _id: string;
  userId: string;
  topics: StudyTopic[];
  progress: ProgressEntry[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface StudyTopic {
  id: string;
  name: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  estimatedTime: number; // in minutes
  resources: string[];
}

export interface ProgressEntry {
  topicId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // in minutes
  notes?: string;
}

export interface Analytics {
  _id: string;
  date: Date;
  totalUsers: number;
  totalQuestions: number;
  questionsBySubject: Record<string, number>;
  topStruggles: string[];
  averageResponseTime: number;
  userEngagement: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  firebaseToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuestionFilters {
  subject?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'trending' | 'recent' | 'votes';
  limit?: number;
  page?: number;
}

export interface StudyPathRequest {
  userId: string;
  regenerate?: boolean;
}

export interface VoteRequest {
  questionId: string;
  userId: string;
}

export interface QuestionSubmission {
  subject: string;
  questionText: string;
  tags?: string[];
}

export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    totalQuestions: number;
    activeUsers: number;
    averageQuestionsPerUser: number;
  };
  trends: {
    date: string;
    questions: number;
    users: number;
  }[];
  subjects: {
    subject: string;
    count: number;
    percentage: number;
  }[];
  struggles: {
    topic: string;
    frequency: number;
    difficulty: string;
  }[];
  quality: {
    averageRating: number;
    totalRatings: number;
    improvementAreas: string[];
  };
}
