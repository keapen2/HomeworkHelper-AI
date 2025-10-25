import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from 'react-native-dotenv';
import { ApiResponse, AuthResponse, User, Question, StudyPath } from '@homework-helper/shared';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL || 'http://localhost:5000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Clear stored auth data
          await AsyncStorage.multiRemove(['authToken', 'user']);
          // You might want to redirect to login screen here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(email: string, password: string, role: string = 'student'): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/api/auth/signup', {
      email,
      password,
      role,
    });
    return response.data.data!;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  }

  async firebaseLogin(idToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/api/auth/firebase-login', {}, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data.data!;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.get('/api/auth/profile');
    return response.data.data!.user;
  }

  async updateProfile(studyPreferences: any): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.put('/api/auth/profile', {
      studyPreferences,
    });
    return response.data.data!.user;
  }

  // Question endpoints
  async submitQuestion(subject: string, questionText: string, tags: string[] = []): Promise<Question> {
    const response: AxiosResponse<ApiResponse<{ question: Question }>> = await this.api.post('/api/questions', {
      subject,
      questionText,
      tags,
    });
    return response.data.data!.question;
  }

  async getQuestion(id: string): Promise<Question> {
    const response: AxiosResponse<ApiResponse<{ question: Question }>> = await this.api.get(`/api/questions/${id}`);
    return response.data.data!.question;
  }

  async getTrendingQuestions(limit: number = 20, subject?: string): Promise<Question[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (subject) params.append('subject', subject);

    const response: AxiosResponse<ApiResponse<{ questions: Question[] }>> = await this.api.get(
      `/api/questions/trending?${params.toString()}`
    );
    return response.data.data!.questions;
  }

  async getQuestionFeed(page: number = 1, limit: number = 20, subject?: string, sortBy: string = 'trending'): Promise<{
    questions: Question[];
    pagination: any;
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sortBy', sortBy);
    if (subject) params.append('subject', subject);

    const response: AxiosResponse<ApiResponse<{ questions: Question[]; pagination: any }>> = await this.api.get(
      `/api/questions/feed?${params.toString()}`
    );
    return response.data.data!;
  }

  async voteQuestion(questionId: string): Promise<{ upvotes: number; trendingScore: number }> {
    const response: AxiosResponse<ApiResponse<{ upvotes: number; trendingScore: number }>> = await this.api.post(
      `/api/questions/${questionId}/vote`
    );
    return response.data.data!;
  }

  async removeVote(questionId: string): Promise<{ upvotes: number; trendingScore: number }> {
    const response: AxiosResponse<ApiResponse<{ upvotes: number; trendingScore: number }>> = await this.api.delete(
      `/api/questions/${questionId}/vote`
    );
    return response.data.data!;
  }

  // Study path endpoints
  async getStudyPath(userId: string): Promise<StudyPath> {
    const response: AxiosResponse<ApiResponse<{ studyPath: StudyPath }>> = await this.api.get(`/api/study-path/${userId}`);
    return response.data.data!.studyPath;
  }

  async updateStudyProgress(userId: string, topicId: string, completed: boolean, timeSpent: number = 0, notes?: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<{ progress: any }>> = await this.api.put(`/api/study-path/${userId}/progress`, {
      topicId,
      completed,
      timeSpent,
      notes,
    });
    return response.data.data!.progress;
  }

  async regenerateStudyPath(userId: string): Promise<StudyPath> {
    const response: AxiosResponse<ApiResponse<{ studyPath: StudyPath }>> = await this.api.post(`/api/study-path/${userId}/regenerate`);
    return response.data.data!.studyPath;
  }

  async getStudyPathStats(userId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/api/study-path/${userId}/stats`);
    return response.data.data!;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default new ApiService();
