// Shared constants and configuration

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Literature',
  'Geography',
  'Economics',
  'Psychology',
  'Philosophy',
  'Art',
  'Music',
  'Foreign Language',
  'Other'
] as const;

export const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate', 
  'advanced'
] as const;

export const USER_ROLES = [
  'student',
  'admin'
] as const;

export const API_ENDPOINTS = {
  // Auth
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
  VERIFY: '/auth/verify',
  
  // Questions
  QUESTIONS: '/questions',
  QUESTION_BY_ID: (id: string) => `/questions/${id}`,
  TRENDING_QUESTIONS: '/questions/trending',
  QUESTION_FEED: '/questions/feed',
  VOTE_QUESTION: (id: string) => `/questions/${id}/vote`,
  
  // Study Paths
  STUDY_PATH: (userId: string) => `/study-path/${userId}`,
  STUDY_PATH_PROGRESS: (userId: string) => `/study-path/${userId}/progress`,
  REGENERATE_STUDY_PATH: (userId: string) => `/study-path/${userId}/regenerate`,
  
  // Admin Analytics
  ADMIN_OVERVIEW: '/admin/analytics/overview',
  ADMIN_TRENDS: '/admin/analytics/trends',
  ADMIN_SUBJECTS: '/admin/analytics/subjects',
  ADMIN_STRUGGLES: '/admin/analytics/struggles',
  ADMIN_QUALITY: '/admin/analytics/quality',
  
  // Health
  HEALTH: '/health'
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
} as const;

export const TRENDING_ALGORITHM = {
  DECAY_FACTOR: 1.5,
  TIME_OFFSET: 2, // hours
  UPDATE_INTERVAL: 3600000 // 1 hour in milliseconds
} as const;

export const STUDY_PATH_CONFIG = {
  MAX_TOPICS: 10,
  MIN_TOPICS: 3,
  UPDATE_INTERVAL: 86400000, // 24 hours in milliseconds
  AI_MODEL: 'gpt-3.5-turbo'
} as const;

export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
  },
  QUESTIONS: {
    windowMs: 60 * 1000, // 1 minute
    max: 10 // limit each IP to 10 requests per windowMs
  },
  VOTES: {
    windowMs: 60 * 1000, // 1 minute
    max: 30 // limit each IP to 30 requests per windowMs
  }
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_EXISTS: 'User already exists',
  QUESTION_NOT_FOUND: 'Question not found',
  STUDY_PATH_NOT_FOUND: 'Study path not found'
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESS: 'Login successful',
  QUESTION_SUBMITTED: 'Question submitted successfully',
  VOTE_RECORDED: 'Vote recorded successfully',
  STUDY_PATH_GENERATED: 'Study path generated successfully',
  PROGRESS_UPDATED: 'Progress updated successfully'
} as const;

export const MOBILE_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  CACHE_DURATION: 300000, // 5 minutes
  MAX_QUESTIONS_PER_PAGE: 20,
  PULL_TO_REFRESH_ENABLED: true
} as const;

export const ADMIN_CONFIG = {
  DASHBOARD_REFRESH_INTERVAL: 60000, // 1 minute
  CHART_ANIMATION_DURATION: 1000,
  EXPORT_FORMATS: ['csv', 'json', 'pdf'],
  MAX_EXPORT_RECORDS: 10000
} as const;
