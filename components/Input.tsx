import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, style, ...props }) => {
  if (icon) {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>{icon}</View>
        <TextInput style={[styles.input, styles.inputWithIcon, style]} {...props} />
      </View>
    );
  }

  return <TextInput style={[styles.input, style]} {...props} />;
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  input: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    fontSize: 16,
    color: Colors.text,
  },
  inputWithIcon: {
    paddingLeft: 50,
    flex: 1,
  },
});