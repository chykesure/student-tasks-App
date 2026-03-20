import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Loading } from '../../components';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/helpers';
import { AuthStackParamList } from '../../types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  
  const { register } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await register(name.trim(), email.trim(), password);
      
      if (!result.success) {
        Alert.alert('Registration Failed', result.message || 'Could not create account');
      }
      // Navigation is handled by AuthContext
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Creating account..." />;
  }

  return (
    <SafeAreaView style={registerStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={registerStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={registerStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={registerStyles.header}>
            <TouchableOpacity 
              style={registerStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <View style={registerStyles.logoContainer}>
              <Ionicons name="person-add" size={40} color={COLORS.primary} />
            </View>
            <Text style={registerStyles.title}>Create Account</Text>
            <Text style={registerStyles.subtitle}>
              Sign up to start organizing your tasks
            </Text>
          </View>

          {/* Form */}
          <View style={registerStyles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.name}
              leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.textLight} />}
              required
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.textLight} />}
              required
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />}
              required
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textLight} />}
              required
            />

            <View style={registerStyles.termsContainer}>
              <Text style={registerStyles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={registerStyles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={registerStyles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              fullWidth
              size="large"
              loading={loading}
            />
          </View>

          {/* Footer */}
          <View style={registerStyles.footer}>
            <Text style={registerStyles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={registerStyles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  keyboardView: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  } as ViewStyle,
  header: {
    alignItems: 'center',
    marginBottom: 32,
  } as ViewStyle,
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  } as ViewStyle,
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 32,
  } as ViewStyle,
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  } as TextStyle,
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
  } as TextStyle,
  form: {
    marginBottom: 24,
  } as ViewStyle,
  termsContainer: {
    marginBottom: 24,
  } as ViewStyle,
  termsText: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  } as ViewStyle,
  footerText: {
    fontSize: 14,
    color: COLORS.textLight,
  } as TextStyle,
  signInText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  } as TextStyle,
});

export default RegisterScreen;
