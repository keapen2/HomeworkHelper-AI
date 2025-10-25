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
  FAB,
  ActivityIndicator,
  Searchbar,
  Menu,
  Provider as PaperProvider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Question } from '@homework-helper/shared';
import ApiService from '../../services/api';
import { HomeScreenProps } from '../../types/navigation';

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trending' | 'recent' | 'votes'>('trending');
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Geography', 'Economics', 'Psychology',
    'Philosophy', 'Art', 'Music', 'Foreign Language', 'Other'
  ];

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getQuestionFeed(1, 20, selectedSubject || undefined, sortBy);
      setQuestions(response.questions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, sortBy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQuestions();
    setRefreshing(false);
  }, [loadQuestions]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleQuestionPress = (questionId: string) => {
    navigation.navigate('QuestionDetail', { questionId });
  };

  const handleAskQuestion = () => {
    navigation.navigate('AskQuestion');
  };

  const handleVote = async (questionId: string) => {
    try {
      await ApiService.voteQuestion(questionId);
      // Refresh the question list to show updated votes
      await loadQuestions();
    } catch (error) {
      Alert.alert('Error', 'Failed to vote on question');
    }
  };

  const renderQuestion = ({ item }: { item: Question }) => (
    <Card style={styles.questionCard} onPress={() => handleQuestionPress(item._id)}>
      <Card.Content>
        <View style={styles.questionHeader}>
          <Chip style={styles.subjectChip} textStyle={styles.chipText}>
            {item.subject}
          </Chip>
          <Title style={styles.questionTitle} numberOfLines={2}>
            {item.questionText}
          </Title>
        </View>
        
        {item.aiAnswer && (
          <Paragraph style={styles.answerPreview} numberOfLines={3}>
            {item.aiAnswer}
          </Paragraph>
        )}
        
        <View style={styles.questionFooter}>
          <View style={styles.voteContainer}>
            <Button
              mode="outlined"
              compact
              onPress={() => handleVote(item._id)}
              style={styles.voteButton}
            >
              👍 {item.upvotes}
            </Button>
          </View>
          <Paragraph style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Search questions..."
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

      <View style={styles.sortContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.sortButton}
            >
              Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setSortBy('trending'); setMenuVisible(false); }} title="Trending" />
          <Menu.Item onPress={() => { setSortBy('recent'); setMenuVisible(false); }} title="Recent" />
          <Menu.Item onPress={() => { setSortBy('votes'); setMenuVisible(false); }} title="Most Voted" />
        </Menu>
      </View>
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
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAskQuestion}
        label="Ask Question"
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
  sortContainer: {
    alignItems: 'flex-start',
  },
  sortButton: {
    borderRadius: 20,
  },
  questionCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  questionHeader: {
    marginBottom: 8,
  },
  subjectChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  answerPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteContainer: {
    flexDirection: 'row',
  },
  voteButton: {
    borderRadius: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default HomeScreen;
