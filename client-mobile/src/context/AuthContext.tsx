import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { User } from '@homework-helper/shared';
import ApiService from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (studyPreferences: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app start
    checkStoredAuth();
    
    // Listen for Firebase auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Login to backend with Firebase token
          const authResponse = await ApiService.firebaseLogin(idToken);
          
          // Store auth data
          await AsyncStorage.setItem('authToken', authResponse.token);
          await AsyncStorage.setItem('user', JSON.stringify(authResponse.user));
          
          setUser(authResponse.user);
        } catch (error) {
          console.error('Firebase auth state change error:', error);
          // Clear stored data on error
          await clearAuthData();
        }
      } else {
        await clearAuthData();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkStoredAuth = async () => {
    try {
      const [token, userData] = await AsyncStorage.multiGet(['authToken', 'user']);
      
      if (token[1] && userData[1]) {
        const user = JSON.parse(userData[1]);
        setUser(user);
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = async () => {
    await AsyncStorage.multiRemove(['authToken', 'user']);
    setUser(null);
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Sign in with Firebase
      await auth().signInWithEmailAndPassword(email, password);
      
      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: string = 'student') => {
    try {
      setLoading(true);
      
      // Create user with Firebase
      await auth().createUserWithEmailAndPassword(email, password);
      
      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement Google Sign-In
      // This would require additional setup with Google Sign-In
      throw new Error('Google Sign-In not implemented yet');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Sign out from Firebase
      await auth().signOut();
      
      // Clear stored data
      await clearAuthData();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (studyPreferences: any) => {
    try {
      const updatedUser = await ApiService.updateProfile(studyPreferences);
      setUser(updatedUser);
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
