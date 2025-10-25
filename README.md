# AI Homework Helper

An AI-powered homework helper application with personalized study paths, peer voting, and comprehensive analytics.

## Features

- **AI-Powered Answers**: Students can ask homework questions and receive intelligent AI-generated responses
- **Peer Voting**: Community-driven question prioritization through upvoting
- **Personalized Study Paths**: AI-generated learning roadmaps based on individual progress
- **Admin Dashboard**: Comprehensive analytics and insights for educators
- **Cross-Platform**: React Native mobile app + React web dashboard

## Tech Stack

- **Frontend**: React Native (mobile), React (admin dashboard)
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT API
- **Authentication**: Firebase Auth
- **Hosting**: AWS EC2 + S3
- **Deployment**: GitHub Actions CI/CD

## Project Structure

```
/HomeworkHelper-AI
  /client-mobile        # React Native (iOS + Android)
  /client-admin         # React web app (admin dashboard)
  /server               # Node.js + Express backend
  /shared               # Shared types, constants, utilities
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Setup environment variables**:
   - Copy `.env.example` to `.env` in each workspace
   - Configure MongoDB Atlas, Firebase, and OpenAI API keys

3. **Start development servers**:
   ```bash
   # Backend + Admin dashboard
   npm run dev
   
   # Mobile app (separate terminal)
   npm run dev:mobile
   ```

## Development

- **Backend**: `npm run dev:server`
- **Admin Dashboard**: `npm run dev:admin` 
- **Mobile App**: `npm run dev:mobile`

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Questions
- `POST /questions` - Submit new question
- `GET /questions/trending` - Get trending questions
- `GET /questions/feed` - Get question feed
- `POST /questions/:id/vote` - Upvote question

### Study Paths
- `GET /study-path/:userId` - Get personalized study path
- `PUT /study-path/:userId/progress` - Update progress

### Admin Analytics
- `GET /admin/analytics/overview` - Dashboard overview
- `GET /admin/analytics/trends` - Usage trends
- `GET /admin/analytics/subjects` - Subject breakdown

## Environment Variables

### Server (.env)
```
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
JWT_SECRET=...
PORT=5000
```

### Mobile (.env)
```
API_BASE_URL=http://localhost:5000
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
```

### Admin (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

## Deployment

1. **Backend**: Deploy to AWS EC2
2. **Admin Dashboard**: Deploy to S3/CloudFront
3. **Mobile**: Build for App Store/Play Store

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
