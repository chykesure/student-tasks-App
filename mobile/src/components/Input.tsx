import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const getBorderColor = (): string => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return COLORS.border;
  };

  const getInputStyle = (): TextStyle[] => {
    const styles: TextStyle[] = [inputStyles.input];
    
    if (leftIcon) {
      styles.push(inputStyles.inputWithLeftIcon);
    }
    if (rightIcon || secureTextEntry) {
      styles.push(inputStyles.inputWithRightIcon);
    }
    if (multiline) {
      styles.push(inputStyles.multilineInput);
    }
    if (inputStyle) {
      styles.push(inputStyle);
    }
    
    return styles;
  };

  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && (
        <View style={inputStyles.labelContainer}>
          <Text style={inputStyles.label}>{label}</Text>
          {required && <Text style={inputStyles.required}>*</Text>}
        </View>
      )}
      
      <View
        style={[
          inputStyles.inputContainer,
          { borderColor: getBorderColor() },
          multiline && inputStyles.multilineContainer,
          !editable && inputStyles.disabledContainer,
        ]}
      >
        {leftIcon && (
          <View style={inputStyles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={inputStyles.rightIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={inputStyles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[inputStyles.helperText, error && inputStyles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  } as ViewStyle,
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  } as TextStyle,
  required: {
    color: COLORS.error,
    marginLeft: 4,
  } as TextStyle,
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
  } as ViewStyle,
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  } as ViewStyle,
  disabledContainer: {
    backgroundColor: COLORS.background,
    opacity: 0.7,
  } as ViewStyle,
  leftIcon: {
    marginRight: 12,
  } as ViewStyle,
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 14,
  } as TextStyle,
  inputWithLeftIcon: {
    paddingLeft: 0,
  } as TextStyle,
  inputWithRightIcon: {
    paddingRight: 40,
  } as TextStyle,
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  } as TextStyle,
  rightIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  } as ViewStyle,
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  } as TextStyle,
  errorText: {
    color: COLORS.error,
  } as TextStyle,
});

export default Input;