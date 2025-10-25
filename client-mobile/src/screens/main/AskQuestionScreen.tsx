import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../services/api';

const AskQuestionScreen: React.FC<AskQuestionScreenProps> = () => {
  const [questionText, setQuestionText] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Geography', 'Economics', 'Psychology',
    'Philosophy', 'Art', 'Music', 'Foreign Language', 'Other'
  ];

  const commonTags = [
    'homework', 'exam', 'assignment', 'concept', 'formula',
    'theory', 'practice', 'urgent', 'difficult', 'easy'
  ];

  const handleSubmit = async () => {
    if (!questionText.trim() || !subject) {
      Alert.alert('Error', 'Please fill in the question and select a subject');
      return;
    }

    if (questionText.trim().length < 10) {
      Alert.alert('Error', 'Please provide a more detailed question (at least 10 characters)');
      return;
    }

    try {
      setLoading(true);
      const question = await ApiService.submitQuestion(subject, questionText.trim(), tags);
      
      Alert.alert(
        'Question Submitted!',
        'Your question has been submitted and AI is generating an answer.',
        [
          {
            text: 'View Question',
            onPress: () => navigation.navigate('QuestionDetail', { questionId: question._id }),
          },
          { text: 'OK' },
        ]
      );
      
      // Reset form
      setQuestionText('');
      setSubject('');
      setTags([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Ask a Question</Title>
            <Paragraph style={styles.subtitle}>
              Get AI-powered help with your homework and assignments
            </Paragraph>

            <TextInput
              label="Subject *"
              value={subject}
              onChangeText={setSubject}
              mode="outlined"
              style={styles.input}
              placeholder="Select or type a subject"
            />

            <View style={styles.subjectChips}>
              {subjects.map((sub) => (
                <Chip
                  key={sub}
                  selected={subject === sub}
                  onPress={() => setSubject(sub)}
                  style={styles.subjectChip}
                >
                  {sub}
                </Chip>
              ))}
            </View>

            <TextInput
              label="Your Question *"
              value={questionText}
              onChangeText={setQuestionText}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.textArea}
              placeholder="Describe your question in detail..."
            />

            <View style={styles.tagsContainer}>
              <Paragraph style={styles.tagsLabel}>Add tags (optional):</Paragraph>
              <View style={styles.tagsChips}>
                {commonTags.map((tag) => (
                  <Chip
                    key={tag}
                    selected={tags.includes(tag)}
                    onPress={() => toggleTag(tag)}
                    style={styles.tagChip}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={loading || !questionText.trim() || !subject}
              contentStyle={styles.buttonContent}
            >
              {loading ? <ActivityIndicator color="white" /> : 'Submit Question'}
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.tipsCard}>
          <Card.Content>
            <Title style={styles.tipsTitle}>Tips for Better Answers</Title>
            <Paragraph style={styles.tipText}>
              • Be specific about what you need help with
            </Paragraph>
            <Paragraph style={styles.tipText}>
              • Include any relevant context or background
            </Paragraph>
            <Paragraph style={styles.tipText}>
              • Mention what you've already tried
            </Paragraph>
            <Paragraph style={styles.tipText}>
              • Specify the level of detail you need
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    marginBottom: 16,
    minHeight: 100,
  },
  subjectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  subjectChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  tagsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  submitButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  tipsCard: {
    elevation: 2,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default AskQuestionScreen;
