import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '../constants';
import { ButtonProps } from '../types';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const styles: ViewStyle[] = [buttonStyles.base, buttonStyles[size]];
    
    switch (variant) {
      case 'secondary':
        styles.push(buttonStyles.secondary);
        break;
      case 'outline':
        styles.push(buttonStyles.outline);
        break;
      case 'ghost':
        styles.push(buttonStyles.ghost);
        break;
      default:
        styles.push(buttonStyles.primary);
    }
    
    if (disabled || loading) {
      styles.push(buttonStyles.disabled);
    }
    
    if (fullWidth) {
      styles.push(buttonStyles.fullWidth);
    }
    
    if (style) {
      styles.push(style as ViewStyle);
    }
    
    return styles;
  };

  const getTextStyle = (): TextStyle[] => {
    const styles: TextStyle[] = [buttonStyles.text, buttonStyles[`${size}Text` as keyof typeof buttonStyles] as TextStyle];
    
    switch (variant) {
      case 'outline':
      case 'ghost':
        styles.push(buttonStyles.outlineText);
        break;
      default:
        styles.push(buttonStyles.primaryText);
    }
    
    if (textStyle) {
      styles.push(textStyle as TextStyle);
    }
    
    return styles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} 
          size="small" 
        />
      ) : (
        <View style={buttonStyles.content}>
          {icon && iconPosition === 'left' && (
            <View style={buttonStyles.iconLeft}>{icon}</View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={buttonStyles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  } as ViewStyle,
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  } as ViewStyle,
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  } as ViewStyle,
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
  } as ViewStyle,
  primary: {
    backgroundColor: COLORS.primary,
  } as ViewStyle,
  secondary: {
    backgroundColor: COLORS.secondary,
  } as ViewStyle,
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  } as ViewStyle,
  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  disabled: {
    opacity: 0.6,
  } as ViewStyle,
  fullWidth: {
    width: '100%',
  } as ViewStyle,
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  iconLeft: {
    marginRight: 8,
  } as ViewStyle,
  iconRight: {
    marginLeft: 8,
  } as ViewStyle,
  text: {
    fontWeight: '600',
  } as TextStyle,
  smallText: {
    fontSize: 14,
  } as TextStyle,
  mediumText: {
    fontSize: 16,
  } as TextStyle,
  largeText: {
    fontSize: 18,
  } as TextStyle,
  primaryText: {
    color: COLORS.white,
  } as TextStyle,
  outlineText: {
    color: COLORS.primary,
  } as TextStyle,
});

export default Button;
