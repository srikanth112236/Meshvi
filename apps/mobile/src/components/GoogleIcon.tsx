import React from 'react';
import { Image, ImageStyle, StyleSheet, View } from 'react-native';

interface GoogleIconProps {
  size?: number;
  style?: ImageStyle;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({ size = 20, style }) => {
  return (
    <Image
      source={require('../../assets/google-icon.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};
