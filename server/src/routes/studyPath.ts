import express from 'express';
import { body, validationResult } from 'express-validator';
import { StudyPath, Question, User } from '../models';
import { authenticateJWT } from '../middleware/auth';
import { generateStudyPath } from '../services/openai';
import { logger } from '../utils/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, STUDY_PATH_CONFIG } from '@homework-helper/shared';

const router = express.Router();

// Validation middleware
const validateProgressUpdate = [
  body('topicId').isString().withMessage('Topic ID is required'),
  body('completed').isBoolean().withMessage('Completed status must be boolean'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative integer'),
  body('notes').optional().isString().withMessage('Notes must be string'),
];

// GET /study-path/:userId - Get or generate study path
router.get('/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Check if user is accessing their own study path or is admin
    if (currentUser._id.toString() !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    // Find existing study path
    let studyPath = await StudyPath.findOne({ userId });

    // If no study path exists or it's outdated, generate a new one
    const shouldRegenerate = !studyPath || 
      (Date.now() - studyPath.lastUpdated.getTime()) > STUDY_PATH_CONFIG.UPDATE_INTERVAL;

    if (shouldRegenerate) {
      try {
        // Get user's question history
        const userQuestions = await Question.find({ userId })
          .sort({ createdAt: -1 })
          .limit(50) // Last 50 questions
          .lean();

        // Get user preferences
        const user = await User.findById(userId);
        const preferences = user?.studyPreferences || {};

        // Generate new study path
        const aiStudyPath = await generateStudyPath(userQuestions, preferences);

        if (studyPath) {
          // Update existing study path
          studyPath.topics = aiStudyPath.topics;
          studyPath.recommendations = aiStudyPath.recommendations;
          studyPath.lastUpdated = new Date();
          await studyPath.save();
        } else {
          // Create new study path
          studyPath = new StudyPath({
            userId,
            topics: aiStudyPath.topics,
            recommendations: aiStudyPath.recommendations,
            progress: [],
          });
          await studyPath.save();
        }

        logger.info(`Study path generated for user: ${userId}`);
      } catch (aiError) {
        logger.error('Study path generation failed:', aiError);
        
        // Return existing study path or create default one
        if (!studyPath) {
          studyPath = new StudyPath({
            userId,
            topics: [],
            recommendations: ['Start with basic concepts', 'Practice regularly'],
            progress: [],
          });
          await studyPath.save();
        }
      }
    }

    res.json({
      success: true,
      data: {
        studyPath: {
          _id: studyPath._id,
          userId: studyPath.userId,
          topics: studyPath.topics,
          progress: studyPath.progress,
          recommendations: studyPath.recommendations,
          lastUpdated: studyPath.lastUpdated,
        },
      },
    });
  } catch (error) {
    logger.error('Study path fetch error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// PUT /study-path/:userId/progress - Update progress
router.put('/:userId/progress', authenticateJWT, validateProgressUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errors.array(),
      });
    }

    const { userId } = req.params;
    const currentUser = req.user;

    // Check if user is accessing their own study path
    if (currentUser._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    const { topicId, completed, timeSpent = 0, notes } = req.body;

    // Find study path
    const studyPath = await StudyPath.findOne({ userId });
    if (!studyPath) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.STUDY_PATH_NOT_FOUND,
      });
    }

    // Find existing progress entry
    let progressEntry = studyPath.progress.find(p => p.topicId === topicId);

    if (progressEntry) {
      // Update existing entry
      progressEntry.completed = completed;
      progressEntry.timeSpent += timeSpent;
      if (completed && !progressEntry.completedAt) {
        progressEntry.completedAt = new Date();
      }
      if (notes) {
        progressEntry.notes = notes;
      }
    } else {
      // Create new progress entry
      studyPath.progress.push({
        topicId,
        completed,
        timeSpent,
        notes,
        completedAt: completed ? new Date() : undefined,
      });
    }

    await studyPath.save();

    logger.info(`Progress updated for user: ${userId}, topic: ${topicId}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.PROGRESS_UPDATED,
      data: {
        progress: studyPath.progress,
      },
    });
  } catch (error) {
    logger.error('Progress update error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// POST /study-path/:userId/regenerate - Regenerate study path
router.post('/:userId/regenerate', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Check if user is accessing their own study path or is admin
    if (currentUser._id.toString() !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    // Get user's question history
    const userQuestions = await Question.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get user preferences
    const user = await User.findById(userId);
    const preferences = user?.studyPreferences || {};

    // Generate new study path
    const aiStudyPath = await generateStudyPath(userQuestions, preferences);

    // Update or create study path
    let studyPath = await StudyPath.findOne({ userId });
    if (studyPath) {
      studyPath.topics = aiStudyPath.topics;
      studyPath.recommendations = aiStudyPath.recommendations;
      studyPath.lastUpdated = new Date();
      // Keep existing progress
      await studyPath.save();
    } else {
      studyPath = new StudyPath({
        userId,
        topics: aiStudyPath.topics,
        recommendations: aiStudyPath.recommendations,
        progress: [],
      });
      await studyPath.save();
    }

    logger.info(`Study path regenerated for user: ${userId}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.STUDY_PATH_GENERATED,
      data: {
        studyPath: {
          _id: studyPath._id,
          userId: studyPath.userId,
          topics: studyPath.topics,
          progress: studyPath.progress,
          recommendations: studyPath.recommendations,
          lastUpdated: studyPath.lastUpdated,
        },
      },
    });
  } catch (error) {
    logger.error('Study path regeneration error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// GET /study-path/:userId/stats - Get study path statistics
router.get('/:userId/stats', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Check if user is accessing their own study path or is admin
    if (currentUser._id.toString() !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    const studyPath = await StudyPath.findOne({ userId });
    if (!studyPath) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.STUDY_PATH_NOT_FOUND,
      });
    }

    // Calculate statistics
    const totalTopics = studyPath.topics.length;
    const completedTopics = studyPath.progress.filter(p => p.completed).length;
    const totalTimeSpent = studyPath.progress.reduce((total, p) => total + p.timeSpent, 0);
    const completionRate = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    // Get recent activity
    const recentQuestions = await Question.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('subject questionText createdAt')
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalTopics,
          completedTopics,
          completionRate: Math.round(completionRate * 100) / 100,
          totalTimeSpent,
          averageTimePerTopic: completedTopics > 0 ? Math.round(totalTimeSpent / completedTopics) : 0,
        },
        recentActivity: recentQuestions,
        lastUpdated: studyPath.lastUpdated,
      },
    });
  } catch (error) {
    logger.error('Study path stats error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

export default router;
