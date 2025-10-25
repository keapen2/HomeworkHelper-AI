import { Question, StudyPath } from '@homework-helper/shared';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  QuestionDetail: { questionId: string };
  History: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  AskQuestion: undefined;
  Trending: undefined;
  StudyPath: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// Screen props types
export interface QuestionDetailScreenProps {
  route: {
    params: {
      questionId: string;
    };
  };
  navigation: any;
}

export interface HomeScreenProps {
  navigation: any;
}

export interface AskQuestionScreenProps {
  navigation: any;
}

export interface TrendingScreenProps {
  navigation: any;
}

export interface StudyPathScreenProps {
  navigation: any;
}

export interface ProfileScreenProps {
  navigation: any;
}

export interface HistoryScreenProps {
  navigation: any;
}

export interface LoginScreenProps {
  navigation: any;
}

export interface SignupScreenProps {
  navigation: any;
}
