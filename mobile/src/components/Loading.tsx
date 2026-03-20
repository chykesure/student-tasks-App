import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants';
import { LoadingProps } from '../types';

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'large', 
  fullScreen = false 
}) => {
  if (fullScreen) {
    return (
      <View style={loadingStyles.fullScreen}>
        <ActivityIndicator size={size} color={COLORS.primary} />
        {message && <Text style={loadingStyles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message && <Text style={loadingStyles.message}>{message}</Text>}
    </View>
  );
};

const loadingStyles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  } as ViewStyle,
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textLight,
  } as TextStyle,
});

export default Loading;
