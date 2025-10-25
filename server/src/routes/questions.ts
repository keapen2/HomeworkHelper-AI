import express from 'express';
import { body, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { Question, Vote, User } from '../models';
import { authenticateJWT, optionalAuth } from '../middleware/auth';
import { generateAnswer } from '../services/openai';
import { logger } from '../utils/logger';
import { RATE_LIMITS, ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION, TRENDING_ALGORITHM } from '@homework-helper/shared';

const router = express.Router();

// Rate limiting for question endpoints
const questionLimiter = rateLimit({
  windowMs: RATE_LIMITS.QUESTIONS.windowMs,
  max: RATE_LIMITS.QUESTIONS.max,
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
});

const voteLimiter = rateLimit({
  windowMs: RATE_LIMITS.VOTES.windowMs,
  max: RATE_LIMITS.VOTES.max,
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
});

// Validation middleware
const validateQuestion = [
  body('subject').isIn(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Literature', 'Geography', 'Economics', 'Psychology', 'Philosophy', 'Art', 'Music', 'Foreign Language', 'Other']).withMessage('Valid subject is required'),
  body('questionText').isLength({ min: 10, max: 2000 }).withMessage('Question must be between 10 and 2000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

const validateVote = [
  body('questionId').isMongoId().withMessage('Valid question ID is required'),
];

// POST /questions - Submit new question
router.post('/', questionLimiter, authenticateJWT, validateQuestion, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errors.array(),
      });
    }

    const { subject, questionText, tags = [] } = req.body;
    const userId = req.user._id;

    // Create question
    const question = new Question({
      userId,
      subject,
      questionText,
      tags,
    });

    await question.save();

    // Generate AI answer
    try {
      const aiAnswer = await generateAnswer(questionText, subject);
      question.aiAnswer = aiAnswer;
      await question.save();
    } catch (aiError) {
      logger.error('AI answer generation failed:', aiError);
      // Continue without AI answer - it can be generated later
    }

    logger.info(`New question submitted: ${question._id}`);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.QUESTION_SUBMITTED,
      data: {
        question: {
          _id: question._id,
          subject: question.subject,
          questionText: question.questionText,
          aiAnswer: question.aiAnswer,
          upvotes: question.upvotes,
          trendingScore: question.trendingScore,
          tags: question.tags,
          createdAt: question.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Question submission error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// GET /questions/:id - Get single question
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate('userId', 'email')
      .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.QUESTION_NOT_FOUND,
      });
    }

    // Check if user has voted on this question
    let hasVoted = false;
    if (req.user) {
      const vote = await Vote.findOne({ userId: req.user._id, questionId: id });
      hasVoted = !!vote;
    }

    res.json({
      success: true,
      data: {
        question: {
          ...question,
          hasVoted,
        },
      },
    });
  } catch (error) {
    logger.error('Question fetch error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// GET /questions/trending - Get trending questions
router.get('/trending', optionalAuth, [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('subject').optional().isString().withMessage('Subject must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errors.array(),
      });
    }

    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const subject = req.query.subject as string;

    // Build query
    const query: any = {};
    if (subject) {
      query.subject = subject;
    }

    // Get trending questions
    const questions = await Question.find(query)
      .populate('userId', 'email')
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    // Check which questions user has voted on
    let votedQuestions: string[] = [];
    if (req.user) {
      const votes = await Vote.find({ 
        userId: req.user._id, 
        questionId: { $in: questions.map(q => q._id) } 
      });
      votedQuestions = votes.map(v => v.questionId.toString());
    }

    const questionsWithVoteStatus = questions.map(question => ({
      ...question,
      hasVoted: votedQuestions.includes(question._id.toString()),
    }));

    res.json({
      success: true,
      data: {
        questions: questionsWithVoteStatus,
        pagination: {
          limit,
          total: questions.length,
        },
      },
    });
  } catch (error) {
    logger.error('Trending questions fetch error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// GET /questions/feed - Get question feed with filters
router.get('/feed', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('subject').optional().isString().withMessage('Subject must be a string'),
  query('sortBy').optional().isIn(['trending', 'recent', 'votes']).withMessage('Invalid sort option'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errors.array(),
      });
    }

    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const subject = req.query.subject as string;
    const sortBy = req.query.sortBy as string || 'trending';

    // Build query
    const query: any = {};
    if (subject) {
      query.subject = subject;
    }

    // Build sort options
    let sortOptions: any = {};
    switch (sortBy) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'votes':
        sortOptions = { upvotes: -1, createdAt: -1 };
        break;
      case 'trending':
      default:
        sortOptions = { trendingScore: -1, createdAt: -1 };
        break;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get questions with pagination
    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate('userId', 'email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(query),
    ]);

    // Check which questions user has voted on
    let votedQuestions: string[] = [];
    if (req.user) {
      const votes = await Vote.find({ 
        userId: req.user._id, 
        questionId: { $in: questions.map(q => q._id) } 
      });
      votedQuestions = votes.map(v => v.questionId.toString());
    }

    const questionsWithVoteStatus = questions.map(question => ({
      ...question,
      hasVoted: votedQuestions.includes(question._id.toString()),
    }));

    res.json({
      success: true,
      data: {
        questions: questionsWithVoteStatus,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Question feed fetch error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// POST /questions/:id/vote - Vote on question
router.post('/:id/vote', voteLimiter, authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if question exists
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.QUESTION_NOT_FOUND,
      });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ userId, questionId: id });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this question',
      });
    }

    // Create vote
    const vote = new Vote({
      userId,
      questionId: id,
    });

    await vote.save();

    // Update question upvotes and trending score
    question.upvotes += 1;
    question.trendingScore = question.calculateTrendingScore();
    await question.save();

    logger.info(`Vote recorded for question: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.VOTE_RECORDED,
      data: {
        upvotes: question.upvotes,
        trendingScore: question.trendingScore,
      },
    });
  } catch (error) {
    logger.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// DELETE /questions/:id/vote - Remove vote
router.delete('/:id/vote', voteLimiter, authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find and remove vote
    const vote = await Vote.findOneAndDelete({ userId, questionId: id });
    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found',
      });
    }

    // Update question upvotes and trending score
    const question = await Question.findById(id);
    if (question) {
      question.upvotes = Math.max(0, question.upvotes - 1);
      question.trendingScore = question.calculateTrendingScore();
      await question.save();
    }

    logger.info(`Vote removed for question: ${id}`);

    res.json({
      success: true,
      message: 'Vote removed successfully',
      data: {
        upvotes: question?.upvotes || 0,
        trendingScore: question?.trendingScore || 0,
      },
    });
  } catch (error) {
    logger.error('Vote removal error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

export default router;
