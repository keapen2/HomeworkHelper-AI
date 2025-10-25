import React, { useState } from 'react';
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
  List,
  Switch,
  Divider,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { ProfileScreenProps } from '../../types/navigation';

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { user, signOut, updateProfile } = useAuth();
  const navigation = useNavigation();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleUpdatePreferences = async () => {
    try {
      setLoading(true);
      await updateProfile({
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        difficulty: 'intermediate',
      });
      Alert.alert('Success', 'Preferences updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  const getRoleColor = (role: string): string => {
    return role === 'admin' ? '#f44336' : '#6200ee';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text 
              size={80} 
              label={getInitials(user?.email || 'U')}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.userName}>
                {user?.email || 'User'}
              </Title>
              <Chip 
                style={[styles.roleChip, { backgroundColor: getRoleColor(user?.role || 'student') }]}
                textStyle={styles.roleText}
              >
                {user?.role || 'student'}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Study Preferences */}
      <Card style={styles.preferencesCard}>
        <Card.Content>
          <Title>Study Preferences</Title>
          <Paragraph style={styles.sectionDescription}>
            Customize your learning experience
          </Paragraph>
          
          <View style={styles.preferenceItem}>
            <Paragraph>Preferred Subjects</Paragraph>
            <View style={styles.subjectsContainer}>
              {user?.studyPreferences?.subjects?.map((subject, index) => (
                <Chip key={index} style={styles.subjectChip}>
                  {subject}
                </Chip>
              )) || (
                <Paragraph style={styles.noPreferences}>No subjects selected</Paragraph>
              )}
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <Paragraph>Difficulty Level</Paragraph>
            <Chip style={styles.difficultyChip}>
              {user?.studyPreferences?.difficulty || 'Not set'}
            </Chip>
          </View>

          <Button 
            mode="outlined" 
            onPress={handleUpdatePreferences}
            loading={loading}
            style={styles.updateButton}
          >
            Update Preferences
          </Button>
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title>Settings</Title>
          
          <List.Item
            title="Notifications"
            description="Receive push notifications for new answers"
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Dark Mode"
            description="Use dark theme"
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Study Statistics"
            description="View your learning progress"
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('StudyPath')}
          />
          
          <Divider />
          
          <List.Item
            title="Question History"
            description="View all your questions"
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('History')}
          />
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title>Account</Title>
          
          <Button 
            mode="outlined" 
            onPress={() => Alert.alert('Coming Soon', 'Password change feature coming soon')}
            style={styles.actionButton}
          >
            Change Password
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => Alert.alert('Coming Soon', 'Account deletion feature coming soon')}
            style={styles.actionButton}
          >
            Delete Account
          </Button>
          
          <Button 
            mode="contained" 
            onPress={handleSignOut}
            style={[styles.actionButton, styles.signOutButton]}
            buttonColor="#f44336"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      {/* App Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>About</Title>
          <Paragraph style={styles.appInfo}>
            Homework Helper AI v1.0.0
          </Paragraph>
          <Paragraph style={styles.appInfo}>
            Powered by OpenAI GPT
          </Paragraph>
          <Button 
            mode="text" 
            onPress={() => Alert.alert('Support', 'Contact support at help@homeworkhelper.ai')}
            style={styles.supportButton}
          >
            Contact Support
          </Button>
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
  profileCard: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#6200ee',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
  },
  preferencesCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    borderRadius: 12,
  },
  sectionDescription: {
    color: '#666',
    marginBottom: 16,
  },
  preferenceItem: {
    marginBottom: 16,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  subjectChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  noPreferences: {
    color: '#999',
    fontStyle: 'italic',
  },
  difficultyChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  updateButton: {
    marginTop: 8,
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    borderRadius: 12,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    borderRadius: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  signOutButton: {
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    borderRadius: 12,
  },
  appInfo: {
    color: '#666',
    marginBottom: 4,
  },
  supportButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
