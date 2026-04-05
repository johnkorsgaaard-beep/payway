import React, { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Søg...' }: Props) {
  const C = useColors();
  const inputRef = useRef<TextInput>(null);
  const clearOpacity = useRef(new Animated.Value(0)).current;

  const handleChange = (text: string) => {
    onChangeText(text);
    Animated.timing(clearOpacity, {
      toValue: text.length > 0 ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleClear = () => {
    onChangeText('');
    Animated.timing(clearOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Ionicons name="search" size={18} color={C.textLight} style={styles.icon} />
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: C.text }]}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={C.textLight}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        returnKeyType="search"
      />
      <Animated.View style={{ opacity: clearOpacity }}>
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={18} color={C.textLight} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
});
