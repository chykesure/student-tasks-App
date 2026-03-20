import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { 
  AuthContextType, 
  User, 
  UserProfileUpdate 
} from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async (): Promise<void> => {
    try {
      const [storedToken, storedUser] = await AsyncStorage.multiGet(['token', 'user']);
      
      if (storedToken[1] && storedUser[1]) {
        setToken(storedToken[1]);
        setUser(JSON.parse(storedUser[1]));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        
        // Store in AsyncStorage
        await AsyncStorage.multiSet([
          ['token', authToken],
          ['user', JSON.stringify(userData)],
        ]);
        
        // Update state
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const err = error as { message?: string };
      return { 
        success: false, 
        message: err.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.register(name, email, password);
      
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        
        // Store in AsyncStorage
        await AsyncStorage.multiSet([
          ['token', authToken],
          ['user', JSON.stringify(userData)],
        ]);
        
        // Update state
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const err = error as { message?: string };
      return { 
        success: false, 
        message: err.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['token', 'user']);
      
      // Reset state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = async (userData: UserProfileUpdate): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      if (response.success && response.data) {
        const updatedUser = response.data.user;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const err = error as { message?: string };
      return { 
        success: false, 
        message: err.message || 'Failed to update profile.' 
      };
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data) {
        const userData = response.data.user;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
