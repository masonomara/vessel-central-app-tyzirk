
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../styles/commonStyles';
import { ValidationResult } from '../utils/validation';
import { IconSymbol } from './IconSymbol';

interface ValidatedInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  validate?: (value: string) => ValidationResult;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: {
    ios: string;
    android: string;
  };
  rightIcon?: {
    ios: string;
    android: string;
  };
}

export function ValidatedInput({
  label,
  value,
  onChangeText,
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  required = false,
  error: externalError,
  helperText,
  leftIcon,
  rightIcon,
  ...textInputProps
}: ValidatedInputProps) {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const error = externalError || internalError;
  const showError = touched && error;

  useEffect(() => {
    if (validateOnChange && touched && validate) {
      const result = validate(value);
      setInternalError(result.valid ? undefined : result.message);
    }
  }, [value, validateOnChange, touched, validate]);

  const handleBlur = () => {
    setTouched(true);
    setIsFocused(false);
    
    if (validateOnBlur && validate) {
      const result = validate(value);
      setInternalError(result.valid ? undefined : result.message);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    
    if (validateOnChange && touched && validate) {
      const result = validate(text);
      setInternalError(result.valid ? undefined : result.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        showError && styles.inputContainerError,
      ]}>
        {leftIcon && (
          <IconSymbol
            ios_icon_name={leftIcon.ios}
            android_material_icon_name={leftIcon.android}
            size={20}
            color={showError ? colors.danger : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
          ]}
          value={value}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholderTextColor={colors.textSecondary}
          {...textInputProps}
        />
        
        {rightIcon && (
          <IconSymbol
            ios_icon_name={rightIcon.ios}
            android_material_icon_name={rightIcon.android}
            size={20}
            color={showError ? colors.danger : colors.textSecondary}
            style={styles.rightIcon}
          />
        )}
        
        {showError && (
          <IconSymbol
            ios_icon_name="exclamationmark.circle.fill"
            android_material_icon_name="error"
            size={20}
            color={colors.danger}
            style={styles.errorIcon}
          />
        )}
      </View>
      
      {showError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 6,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
});
