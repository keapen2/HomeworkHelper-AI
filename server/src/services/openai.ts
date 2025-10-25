import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { STUDY_PATH_CONFIG } from '@homework-helper/shared';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache for storing responses to reduce API costs
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Generate AI answer for a question
export const generateAnswer = async (question: string, subject: string): Promise<string> => {
  try {
    // Create cache key
    const cacheKey = `${subject}:${question}`.toLowerCase();
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info('Returning cached response');
      return cached.response;
    }

    // Create subject-specific prompt
    const systemPrompt = getSubjectPrompt(subject);
    
    const completion = await openai.chat.completions.create({
      model: STUDY_PATH_CONFIG.AI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

    // Cache the response
    responseCache.set(cacheKey, {
      response,
      timestamp: Date.now(),
    });

    logger.info(`Generated AI response for ${subject} question`);
    return response;

  } catch (error) {
    logger.error('OpenAI API error:', error);
    
    // Return fallback response
    return `I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question or try again later. If this is a ${subject} question, consider breaking it down into smaller parts or providing more context.`;
  }
};

// Generate personalized study path
export const generateStudyPath = async (userHistory: any[], userPreferences: any): Promise<any> => {
  try {
    const historyText = userHistory.map(h => 
      `Subject: ${h.subject}, Question: ${h.questionText}`
    ).join('\n');

    const prompt = `Based on the following student's question history and preferences, generate a personalized study path with 5-8 topics they should focus on:

Student History:
${historyText}

Student Preferences:
- Subjects: ${userPreferences.subjects?.join(', ') || 'Not specified'}
- Difficulty: ${userPreferences.difficulty || 'beginner'}

Please respond with a JSON object containing:
{
  "topics": [
    {
      "id": "unique_id",
      "name": "Topic Name",
      "subject": "Subject",
      "difficulty": "beginner|intermediate|advanced",
      "prerequisites": ["prerequisite1", "prerequisite2"],
      "estimatedTime": 60,
      "resources": ["resource1", "resource2"]
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"]
}

Focus on areas where the student seems to struggle and build a logical progression.`;

    const completion = await openai.chat.completions.create({
      model: STUDY_PATH_CONFIG.AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational advisor. Generate personalized study paths based on student history and preferences. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      logger.error('Failed to parse study path response:', parseError);
      return getDefaultStudyPath(userPreferences);
    }

  } catch (error) {
    logger.error('Study path generation error:', error);
    return getDefaultStudyPath(userPreferences);
  }
};

// Get subject-specific system prompt
const getSubjectPrompt = (subject: string): string => {
  const basePrompt = `You are an expert tutor helping students with their homework. Provide clear, step-by-step explanations that help students understand the concepts, not just get the answer.`;

  const subjectPrompts: Record<string, string> = {
    'Mathematics': `${basePrompt} Focus on showing the mathematical process, explain each step clearly, and suggest similar problems for practice. Use mathematical notation when appropriate.`,
    'Physics': `${basePrompt} Explain the physical principles involved, use diagrams when helpful, and relate concepts to real-world examples. Show all calculations step by step.`,
    'Chemistry': `${basePrompt} Explain chemical processes, show balanced equations, and help students understand the underlying chemical principles. Include safety considerations when relevant.`,
    'Biology': `${basePrompt} Explain biological processes clearly, use diagrams to illustrate concepts, and help students understand the relationships between different biological systems.`,
    'Computer Science': `${basePrompt} Explain programming concepts, algorithms, and data structures clearly. Provide code examples and explain the logic behind solutions.`,
    'History': `${basePrompt} Provide historical context, explain cause-and-effect relationships, and help students understand the significance of historical events.`,
    'Literature': `${basePrompt} Analyze literary works, explain themes and literary devices, and help students develop critical thinking skills about texts.`,
    'Geography': `${basePrompt} Explain geographical concepts, use maps and visual aids in your descriptions, and help students understand the relationships between physical and human geography.`,
    'Economics': `${basePrompt} Explain economic principles, use graphs and charts in your descriptions, and help students understand how economic concepts apply to real-world situations.`,
    'Psychology': `${basePrompt} Explain psychological concepts clearly, provide examples from everyday life, and help students understand human behavior and mental processes.`,
    'Philosophy': `${basePrompt} Explain philosophical concepts clearly, present different viewpoints, and help students develop critical thinking skills.`,
    'Art': `${basePrompt} Explain artistic concepts, techniques, and historical context. Help students understand the creative process and artistic movements.`,
    'Music': `${basePrompt} Explain musical concepts, theory, and history. Help students understand composition, performance, and musical analysis.`,
    'Foreign Language': `${basePrompt} Explain language concepts clearly, provide examples of proper usage, and help students understand grammar, vocabulary, and cultural context.`,
  };

  return subjectPrompts[subject] || basePrompt;
};

// Default study path when AI generation fails
const getDefaultStudyPath = (userPreferences: any) => {
  const subjects = userPreferences.subjects || ['Mathematics'];
  const difficulty = userPreferences.difficulty || 'beginner';

  return {
    topics: [
      {
        id: 'basic_concepts',
        name: `Basic ${subjects[0]} Concepts`,
        subject: subjects[0],
        difficulty,
        prerequisites: [],
        estimatedTime: 60,
        resources: [`${subjects[0]} textbook chapter 1`, 'Online tutorial videos'],
      },
      {
        id: 'practice_problems',
        name: 'Practice Problems',
        subject: subjects[0],
        difficulty,
        prerequisites: ['basic_concepts'],
        estimatedTime: 90,
        resources: ['Practice worksheets', 'Problem-solving guides'],
      },
    ],
    recommendations: [
      'Start with the basics and build your understanding gradually',
      'Practice regularly to reinforce concepts',
      'Don\'t hesitate to ask for help when you get stuck',
    ],
  };
};

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      responseCache.delete(key);
    }
  }
  logger.info('Cleared expired cache entries');
}, CACHE_DURATION);

export default {
  generateAnswer,
  generateStudyPath,
};
