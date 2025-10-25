import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Question } from '@homework-helper/shared';
import ApiService from '../../services/api';
import { QuestionDetailScreenProps } from '../../types/navigation';

const QuestionDetailScreen: React.FC<QuestionDetailScreenProps> = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { questionId } = route.params;

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const questionData = await ApiService.getQuestion(questionId);
      setQuestion(questionData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load question');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!question) return;

    try {
      setVoting(true);
      const result = await ApiService.voteQuestion(questionId);
      setQuestion(prev => prev ? {
        ...prev,
        upvotes: result.upvotes,
        trendingScore: result.trendingScore,
        hasVoted: true,
      } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to vote on question');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.errorContainer}>
        <Title>Question not found</Title>
        <Button onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Chip style={styles.subjectChip}>
              {question.subject}
            </Chip>
            <Paragraph style={styles.timestamp}>
              {new Date(question.createdAt).toLocaleDateString()}
            </Paragraph>
          </View>

          <Title style={styles.questionTitle}>
            {question.questionText}
          </Title>

          {question.tags && question.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {question.tags.map((tag, index) => (
                <Chip key={index} style={styles.tag} size="small">
                  {tag}
                </Chip>
              ))}
            </View>
          )}

          <Divider style={styles.divider} />

          {question.aiAnswer ? (
            <View>
              <Title style={styles.answerTitle}>AI Answer:</Title>
              <Paragraph style={styles.answerText}>
                {question.aiAnswer}
              </Paragraph>
            </View>
          ) : (
            <View style={styles.noAnswerContainer}>
              <Paragraph style={styles.noAnswerText}>
                AI is still generating an answer...
              </Paragraph>
              <ActivityIndicator size="small" color="#6200ee" />
            </View>
          )}

          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleVote}
              disabled={voting || question.hasVoted}
              loading={voting}
              style={styles.voteButton}
            >
              {question.hasVoted ? 'Voted' : `👍 ${question.upvotes}`}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectChip: {
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  noAnswerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noAnswerText: {
    marginRight: 8,
    color: '#666',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  voteButton: {
    borderRadius: 20,
    minWidth: 120,
  },
});

export default QuestionDetailScreen;
