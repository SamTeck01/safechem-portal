import React, { useState } from 'react';
import { View, Text, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LiquidGlassSearch } from '@/components/LiquidGlassSearch';
import { ChemicalCard } from '@/components/ChemicalCard';
import { useHybridSearch } from '@/hooks/useHybridSearch';

export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  // Use hybrid search (cached + API)
  const { results: searchResults, loading: searchLoading, hasCachedResults } = useHybridSearch(searchQuery);

  const handleChemicalPress = (id: string) => {
    router.push(`/chemical/${id}` as any);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#111B21' : '#FFFFFF' }}>
      {/* Header */}
      <View className="pt-16 pb-4">
        <LiquidGlassSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search SafeChem..."
        />
      </View>

      {/* Results */}
      {searchQuery.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View 
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: isDark ? '#1F2C34' : '#F7F9F9' }}
          >
            <Ionicons 
              name="search" 
              size={48} 
              color={isDark ? '#8696A0' : '#536471'} 
            />
          </View>
          <Text 
            className="text-xl font-bold mb-2 text-center"
            style={{ color: isDark ? '#E9EDEF' : '#0F1419' }}
          >
            Search for chemicals
          </Text>
          <Text 
            className="text-base text-center"
            style={{ color: isDark ? '#8696A0' : '#536471' }}
          >
            Find safety data sheets by name, formula, or CAS number
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View className="px-4 py-3 border-b" style={{ borderBottomColor: isDark ? '#2A3942' : '#EFF3F4' }}>
              <View className="flex-row items-center justify-between">
                <Text 
                  className="text-sm font-semibold"
                  style={{ color: isDark ? '#8696A0' : '#536471' }}
                >
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                </Text>
                {hasCachedResults && (
                  <View 
                    className="flex-row items-center px-2 py-1 rounded-full"
                    style={{ backgroundColor: isDark ? '#1F2C34' : '#F0FDF4' }}
                  >
                    <Ionicons name="flash" size={12} color="#10B981" />
                    <Text 
                      className="ml-1 text-xs font-semibold"
                      style={{ color: '#10B981' }}
                    >
                      Instant
                    </Text>
                  </View>
                )}
                {searchLoading && (
                  <ActivityIndicator size="small" color="#10B981" />
                )}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <ChemicalCard
              chemical={item}
              onPress={() => handleChemicalPress(item.id)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-20">
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: isDark ? '#1F2C34' : '#F7F9F9' }}
              >
                <Ionicons 
                  name="alert-circle-outline" 
                  size={40} 
                  color={isDark ? '#8696A0' : '#536471'} 
                />
              </View>
              <Text 
                className="text-lg font-bold mb-2 text-center"
                style={{ color: isDark ? '#E9EDEF' : '#0F1419' }}
              >
                No results found
              </Text>
              <Text 
                className="text-base text-center"
                style={{ color: isDark ? '#8696A0' : '#536471' }}
              >
                Try searching with different keywords
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
