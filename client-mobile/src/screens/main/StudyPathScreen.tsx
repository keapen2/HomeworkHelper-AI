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
  ProgressBar,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StudyPath, StudyTopic, ProgressEntry } from '@homework-helper/shared';
import ApiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StudyPathScreenProps } from '../../types/navigation';

const StudyPathScreen: React.FC<StudyPathScreenProps> = () => {
  const [studyPath, setStudyPath] = useState<StudyPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      loadStudyPath();
    }
  }, [user]);

  const loadStudyPath = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const studyPathData = await ApiService.getStudyPath(user._id);
      setStudyPath(studyPathData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load study path');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (topicId: string, completed: boolean, timeSpent: number = 0) => {
    if (!user) return;

    try {
      setUpdating(true);
      await ApiService.updateStudyProgress(user._id, topicId, completed, timeSpent);
      await loadStudyPath(); // Refresh the study path
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const regenerateStudyPath = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const newStudyPath = await ApiService.regenerateStudyPath(user._id);
      setStudyPath(newStudyPath);
      Alert.alert('Success', 'Study path has been regenerated based on your recent activity');
    } catch (error) {
      Alert.alert('Error', 'Failed to regenerate study path');
    } finally {
      setLoading(false);
    }
  };

  const getProgressForTopic = (topicId: string): ProgressEntry | undefined => {
    return studyPath?.progress.find(p => p.topicId === topicId);
  };

  const getCompletionRate = (): number => {
    if (!studyPath || studyPath.topics.length === 0) return 0;
    const completedTopics = studyPath.progress.filter(p => p.completed).length;
    return (completedTopics / studyPath.topics.length) * 100;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!studyPath) {
    return (
      <View style={styles.errorContainer}>
        <Title>No study path available</Title>
        <Paragraph>Complete some questions to generate your personalized study path.</Paragraph>
        <Button mode="contained" onPress={() => navigation.navigate('AskQuestion')}>
          Ask a Question
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.overviewCard}>
        <Card.Content>
          <Title>Your Learning Journey</Title>
          <Paragraph style={styles.completionText}>
            {Math.round(getCompletionRate())}% Complete
          </Paragraph>
          <ProgressBar 
            progress={getCompletionRate() / 100} 
            color="#6200ee"
            style={styles.progressBar}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{studyPath.topics.length}</Title>
              <Paragraph>Total Topics</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>
                {studyPath.progress.filter(p => p.completed).length}
              </Title>
              <Paragraph>Completed</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>
                {Math.round(studyPath.progress.reduce((total, p) => total + p.timeSpent, 0) / 60)}
              </Title>
              <Paragraph>Hours Studied</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.topicsCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Study Topics</Title>
            <Button 
              mode="outlined" 
              onPress={regenerateStudyPath}
              loading={loading}
              compact
            >
              Regenerate
            </Button>
          </View>
          
          {studyPath.topics.map((topic, index) => {
            const progress = getProgressForTopic(topic.id);
            const isCompleted = progress?.completed || false;
            
            return (
              <Card key={topic.id} style={[styles.topicCard, isCompleted && styles.completedTopic]}>
                <Card.Content>
                  <View style={styles.topicHeader}>
                    <View style={styles.topicInfo}>
                      <Title style={styles.topicTitle}>{topic.name}</Title>
                      <Chip 
                        size="small" 
                        style={styles.difficultyChip}
                        textStyle={styles.difficultyText}
                      >
                        {topic.difficulty}
                      </Chip>
                    </View>
                    <Chip 
                      icon={isCompleted ? "check" : "clock"}
                      style={[styles.statusChip, isCompleted && styles.completedChip]}
                    >
                      {isCompleted ? "Completed" : "In Progress"}
                    </Chip>
                  </View>
                  
                  <Paragraph style={styles.topicDescription}>
                    Subject: {topic.subject} • Est. {topic.estimatedTime} min
                  </Paragraph>
                  
                  {topic.prerequisites.length > 0 && (
                    <Paragraph style={styles.prerequisites}>
                      Prerequisites: {topic.prerequisites.join(', ')}
                    </Paragraph>
                  )}
                  
                  <View style={styles.topicActions}>
                    <Button
                      mode={isCompleted ? "outlined" : "contained"}
                      onPress={() => updateProgress(topic.id, !isCompleted, 30)}
                      disabled={updating}
                      loading={updating}
                      compact
                    >
                      {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </Card.Content>
      </Card>

      {studyPath.recommendations.length > 0 && (
        <Card style={styles.recommendationsCard}>
          <Card.Content>
            <Title>AI Recommendations</Title>
            {studyPath.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Paragraph>• {recommendation}</Paragraph>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
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
  overviewCard: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  topicsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topicCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  completedTopic: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 10,
  },
  statusChip: {
    marginLeft: 8,
  },
  completedChip: {
    backgroundColor: '#4caf50',
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  prerequisites: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  topicActions: {
    marginTop: 8,
  },
  recommendationsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    borderRadius: 12,
  },
  recommendationItem: {
    marginBottom: 8,
  },
});

export default StudyPathScreen;
