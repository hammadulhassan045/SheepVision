import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'sentences',
  leftElement,
  rightElement,
  error,
}) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {leftElement ? <View style={styles.left}>{leftElement}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={editable}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          style={styles.input}
          placeholderTextColor="#7C8B82"
        />
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D2A24',
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FAF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEDE4',
    paddingHorizontal: 12,
    minHeight: 52,
  },
  fieldError: {
    borderColor: '#D64545',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1B2A27',
    paddingVertical: 12,
  },
  left: {
    marginRight: 10,
  },
  right: {
    marginLeft: 8,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: '#D64545',
  },
});
