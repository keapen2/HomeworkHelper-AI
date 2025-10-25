# Homework Helper AI - API Documentation

## Base URL
```
Production: https://api.homeworkhelper.ai
Development: http://localhost:5000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

## Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student" // optional, defaults to "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "student",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "jwt_token_here"
  },
  "message": "User created successfully"
}
```

#### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "student",
      "lastLogin": "2024-01-15T10:30:00Z"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

#### POST /api/auth/firebase-login
Authenticate with Firebase ID token.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here",
    "firebaseToken": "firebase_token_here"
  }
}
```

#### GET /api/auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "student",
      "studyPreferences": {
        "subjects": ["Mathematics", "Physics"],
        "difficulty": "intermediate"
      }
    }
  }
}
```

#### PUT /api/auth/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "studyPreferences": {
    "subjects": ["Mathematics", "Physics", "Chemistry"],
    "difficulty": "advanced"
  }
}
```

### Questions

#### POST /api/questions
Submit a new question.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "subject": "Mathematics",
  "questionText": "How do I solve quadratic equations?",
  "tags": ["algebra", "equations"] // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": {
      "_id": "question_id",
      "subject": "Mathematics",
      "questionText": "How do I solve quadratic equations?",
      "aiAnswer": "To solve quadratic equations...",
      "upvotes": 0,
      "trendingScore": 0,
      "tags": ["algebra", "equations"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Question submitted successfully"
}
```

#### GET /api/questions/:id
Get a specific question by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "question": {
      "_id": "question_id",
      "userId": "user_id",
      "subject": "Mathematics",
      "questionText": "How do I solve quadratic equations?",
      "aiAnswer": "To solve quadratic equations...",
      "upvotes": 5,
      "trendingScore": 2.5,
      "hasVoted": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### GET /api/questions/trending
Get trending questions.

**Query Parameters:**
- `limit` (optional): Number of questions to return (default: 20, max: 100)
- `subject` (optional): Filter by subject

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "question_id",
        "subject": "Mathematics",
        "questionText": "How do I solve quadratic equations?",
        "aiAnswer": "To solve quadratic equations...",
        "upvotes": 15,
        "trendingScore": 8.5,
        "hasVoted": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "total": 150
    }
  }
}
```

#### GET /api/questions/feed
Get paginated question feed.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `subject` (optional): Filter by subject
- `sortBy` (optional): Sort order - "trending", "recent", "votes" (default: "trending")

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### POST /api/questions/:id/vote
Vote on a question.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "upvotes": 16,
    "trendingScore": 9.2
  },
  "message": "Vote recorded successfully"
}
```

#### DELETE /api/questions/:id/vote
Remove vote from a question.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "upvotes": 15,
    "trendingScore": 8.5
  },
  "message": "Vote removed successfully"
}
```

### Study Paths

#### GET /api/study-path/:userId
Get or generate personalized study path.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "studyPath": {
      "_id": "study_path_id",
      "userId": "user_id",
      "topics": [
        {
          "id": "topic_1",
          "name": "Quadratic Equations",
          "subject": "Mathematics",
          "difficulty": "intermediate",
          "prerequisites": ["basic_algebra"],
          "estimatedTime": 60,
          "resources": ["textbook_chapter_5", "video_tutorial"]
        }
      ],
      "progress": [
        {
          "topicId": "topic_1",
          "completed": false,
          "timeSpent": 0,
          "notes": ""
        }
      ],
      "recommendations": [
        "Start with basic algebra concepts",
        "Practice with simple equations first"
      ],
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### PUT /api/study-path/:userId/progress
Update study progress.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "topicId": "topic_1",
  "completed": true,
  "timeSpent": 45,
  "notes": "Completed with help from tutor"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": [ ... ]
  },
  "message": "Progress updated successfully"
}
```

#### POST /api/study-path/:userId/regenerate
Regenerate study path based on recent activity.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "studyPath": { ... }
  },
  "message": "Study path generated successfully"
}
```

#### GET /api/study-path/:userId/stats
Get study path statistics.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalTopics": 10,
      "completedTopics": 3,
      "completionRate": 30.0,
      "totalTimeSpent": 180,
      "averageTimePerTopic": 60
    },
    "recentActivity": [
      {
        "subject": "Mathematics",
        "questionText": "How do I solve quadratic equations?",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### Admin Analytics

#### GET /api/admin/analytics/overview
Get dashboard overview statistics.

**Headers:**
```
Authorization: Bearer <jwt-token> // Admin role required
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "totalQuestions": 3420,
      "activeUsers": 890,
      "averageQuestionsPerUser": 2.7
    }
  }
}
```

#### GET /api/admin/analytics/trends
Get usage trends over time.

**Query Parameters:**
- `days` (optional): Number of days to include (default: 7)

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "date": "2024-01-15",
        "questions": 45,
        "users": 120,
        "answers": 42
      }
    ]
  }
}
```

#### GET /api/admin/analytics/subjects
Get question distribution by subject.

**Response:**
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "subject": "Mathematics",
        "count": 245,
        "percentage": 35.0
      }
    ]
  }
}
```

#### GET /api/admin/analytics/struggles
Get top student struggles.

**Response:**
```json
{
  "success": true,
  "data": {
    "struggles": [
      {
        "topic": "Quadratic Equations",
        "frequency": 45,
        "difficulty": "Medium"
      }
    ]
  }
}
```

#### GET /api/admin/analytics/quality
Get AI answer quality metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "quality": {
      "averageRating": 4.2,
      "totalRatings": 1250,
      "improvementAreas": [
        "Physics explanations",
        "Step-by-step solutions"
      ]
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 5 requests per 15 minutes |
| `/api/questions` | 10 requests per minute |
| `/api/questions/*/vote` | 30 requests per minute |
| Other endpoints | 100 requests per 15 minutes |

## Webhooks

### Question Answered
Triggered when AI generates an answer for a question.

**Payload:**
```json
{
  "event": "question.answered",
  "data": {
    "questionId": "question_id",
    "userId": "user_id",
    "subject": "Mathematics",
    "responseTime": 1.2
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### User Registered
Triggered when a new user signs up.

**Payload:**
```json
{
  "event": "user.registered",
  "data": {
    "userId": "user_id",
    "email": "user@example.com",
    "role": "student"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.homeworkhelper.ai',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Submit question
const question = await api.post('/api/questions', {
  subject: 'Mathematics',
  questionText: 'How do I solve quadratic equations?'
});
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Submit question
response = requests.post(
    'https://api.homeworkhelper.ai/api/questions',
    json={
        'subject': 'Mathematics',
        'questionText': 'How do I solve quadratic equations?'
    },
    headers=headers
)
```

### React Native
```javascript
import ApiService from './services/api';

// Submit question
const question = await ApiService.submitQuestion(
  'Mathematics',
  'How do I solve quadratic equations?'
);
```
