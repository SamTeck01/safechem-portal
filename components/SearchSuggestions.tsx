import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Suggestion {
  cid: number;
  name: string;
  formula: string;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  onSelectSuggestion: (suggestion: Suggestion) => void;
  onViewAll: () => void;
  loading?: boolean;
}

export function SearchSuggestions({ 
  suggestions, 
  onSelectSuggestion, 
  onViewAll,
  loading 
}: SearchSuggestionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (suggestions.length === 0 && !loading) return null;

  return (
    <View 
      className="absolute top-full left-0 right-0 mt-2 mx-4 rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: isDark ? '#1F2C34' : '#FFFFFF',
        borderColor: isDark ? '#2A3942' : '#EFF3F4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        maxHeight: 300,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {suggestions.slice(0, 5).map((suggestion, index) => (
          <TouchableOpacity
            key={suggestion.cid}
            onPress={() => onSelectSuggestion(suggestion)}
            className="flex-row items-center px-4 py-3 border-b"
            style={{
              borderBottomColor: isDark ? '#2A3942' : '#EFF3F4',
              borderBottomWidth: index === suggestions.length - 1 ? 0 : 1,
            }}
          >
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: isDark ? '#111B21' : '#F7F9F9' }}
            >
              <Ionicons name="flask" size={20} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text 
                className="text-base font-semibold"
                style={{ color: isDark ? '#E9EDEF' : '#0F1419' }}
              >
                {suggestion.name}
              </Text>
              <Text 
                className="text-sm"
                style={{ color: isDark ? '#8696A0' : '#536471' }}
              >
                {suggestion.formula}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={isDark ? '#8696A0' : '#536471'} />
          </TouchableOpacity>
        ))}
        
        {suggestions.length > 5 && (
          <TouchableOpacity
            onPress={onViewAll}
            className="flex-row items-center justify-center px-4 py-3"
            style={{ backgroundColor: isDark ? '#111B21' : '#F7F9F9' }}
          >
            <Text 
              className="text-sm font-semibold mr-2"
              style={{ color: '#10B981' }}
            >
              View all {suggestions.length} results
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#10B981" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
