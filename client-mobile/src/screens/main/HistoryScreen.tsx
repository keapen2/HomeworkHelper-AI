import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Question } from '@homework-helper/shared';
import ApiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HistoryScreenProps } from '../../types/navigation';

const HistoryScreen: React.FC<HistoryScreenProps> = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { user } = useAuth();
  const navigation = useNavigation();

  const subjects = [
    'All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Geography', 'Economics', 'Psychology',
    'Philosophy', 'Art', 'Music', 'Foreign Language', 'Other'
  ];

  const loadUserQuestions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // For now, we'll use the general feed endpoint with user filtering
      // In a real app, you'd have a dedicated user history endpoint
      const response = await ApiService.getQuestionFeed(1, 50, selectedSubject === 'All' ? undefined : selectedSubject || undefined);
      setQuestions(response.questions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your questions');
    } finally {
      setLoading(false);
    }
  }, [user, selectedSubject]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserQuestions();
    setRefreshing(false);
  }, [loadUserQuestions]);

  useEffect(() => {
    loadUserQuestions();
  }, [loadUserQuestions]);

  const handleQuestionPress = (questionId: string) => {
    navigation.navigate('QuestionDetail', { questionId });
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (question.aiAnswer && question.aiAnswer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const renderQuestion = ({ item }: { item: Question }) => (
    <Card style={styles.questionCard} onPress={() => handleQuestionPress(item._id)}>
      <Card.Content>
        <View style={styles.questionHeader}>
          <Chip style={styles.subjectChip} textStyle={styles.chipText}>
            {item.subject}
          </Chip>
          <Paragraph style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Paragraph>
        </View>
        
        <Title style={styles.questionTitle} numberOfLines={2}>
          {item.questionText}
        </Title>
        
        {item.aiAnswer && (
          <Paragraph style={styles.answerPreview} numberOfLines={3}>
            {item.aiAnswer}
          </Paragraph>
        )}
        
        <View style={styles.questionFooter}>
          <View style={styles.statsContainer}>
            <Chip 
              icon="thumb-up" 
              style={styles.statChip}
              textStyle={styles.statText}
            >
              {item.upvotes} votes
            </Chip>
            <Chip 
              icon="trending-up" 
              style={styles.statChip}
              textStyle={styles.statText}
            >
              Score: {Math.round(item.trendingScore * 10) / 10}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Search your questions..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={subjects}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              selected={selectedSubject === item}
              onPress={() => setSelectedSubject(selectedSubject === item ? null : item)}
              style={styles.filterChip}
            >
              {item}
            </Chip>
          )}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Title>No Questions Yet</Title>
      <Paragraph style={styles.emptyText}>
        You haven't asked any questions yet. Start your learning journey by asking your first question!
      </Paragraph>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('AskQuestion')}
        style={styles.emptyButton}
      >
        Ask Your First Question
      </Button>
    </View>
  );

  if (loading && questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredQuestions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterChip: {
    marginRight: 8,
  },
  questionCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  answerPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  questionFooter: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    backgroundColor: '#f0f0f0',
  },
  statText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
  },
  emptyButton: {
    marginTop: 16,
  },
});

export default HistoryScreen;
