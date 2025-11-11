import { ChemicalCard } from "@/components/ChemicalCard";
import { LiquidGlassSearch } from "@/components/LiquidGlassSearch";
import { Sidebar } from "@/components/Sidebar";
import { Chemical } from "@/types/chemical";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useHybridSearch } from "@/hooks/useHybridSearch";
import { getCompoundsByCIDs, PubChemCompound } from "@/services/pubchemApi";


// Random CID generation (same as pubchem-demo)
const MAX_CID = 100000000;
const MIN_CID = 1;

const getRandomCID = () => {
  return Math.floor(Math.random() * (MAX_CID - MIN_CID + 1)) + MIN_CID;
};

const getRandomCIDs = (count: number): number[] => {
  const cids = new Set<number>();
  while (cids.size < count) {
    cids.add(getRandomCID());
  }
  return Array.from(cids);
};

// Category detection
const categorizeChemical = (name: string, formula: string): string => {
  const lowerName = name.toLowerCase();
  const lowerFormula = formula.toLowerCase();
  
  if (lowerName.includes("acid")) return "Acid";
  if (lowerName.includes("hydroxide") || lowerName.includes("base")) return "Base";
  if (lowerName.includes("ethanol") || lowerName.includes("acetone") || lowerName.includes("methanol")) return "Solvent";
  if (lowerName.includes("chloride") || lowerName.includes("salt")) return "Salt";
  if (lowerFormula.includes("c") && lowerFormula.includes("h")) return "Organic";
  return "Inorganic";
};

// Convert PubChem compound to Chemical
const convertToChemical = (compound: PubChemCompound): Chemical => {
  const hazardLevels: ("Low" | "Moderate" | "High" | "Extreme")[] = ["Low", "Moderate", "High", "Extreme"];
  const randomHazard = hazardLevels[Math.floor(Math.random() * hazardLevels.length)];
  
  return {
    id: compound.cid.toString(),
    name: compound.name || compound.iupacName || `Compound ${compound.cid}`,
    formula: compound.molecularFormula,
    casNumber: "",
    category: categorizeChemical(compound.name || compound.iupacName || '', compound.molecularFormula) as any,
    hazardLevel: randomHazard,
    description: `Molecular Weight: ${compound.molecularWeight.toFixed(2)} g/mol`,
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recentChemicals, setRecentChemicals] = useState<Chemical[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Feed state (PubChem API)
  const [feedChemicals, setFeedChemicals] = useState<Chemical[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPage, setFeedPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Hybrid search
  const { results: searchResults, loading: searchLoading, hasCachedResults } = useHybridSearch(searchQuery);

  // Display logic: search results or feed
  const displayChemicals = useMemo(() => {
    if (isSearchMode && searchQuery.length > 0) {
      return searchResults;
    }
    return feedChemicals;
  }, [isSearchMode, searchQuery, searchResults, feedChemicals]);

  // Load feed and recent chemicals on mount
  useEffect(() => {
    loadRecentChemicals();
    loadDefaultFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load more when page changes
  useEffect(() => {
    if (feedPage > 0) {
      loadMoreFeedItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedPage]);

  // Load default feed
  const loadDefaultFeed = async () => {
    setFeedLoading(true);
    try {
      const randomCIDs = getRandomCIDs(20);
      const compounds = await getCompoundsByCIDs(randomCIDs);
      const chemicals = compounds.map(convertToChemical).filter(c => c.name && c.formula);
      setFeedChemicals(chemicals);
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setFeedLoading(false);
    }
  };

  // Load more items
  const loadMoreFeedItems = async () => {
    if (feedLoading || isSearchMode) return;
    
    setFeedLoading(true);
    try {
      const randomCIDs = getRandomCIDs(20);
      const compounds = await getCompoundsByCIDs(randomCIDs);
      const newChemicals = compounds.map(convertToChemical).filter(c => c.name && c.formula);
      setFeedChemicals((prev) => [...prev, ...newChemicals]);
    } catch (error) {
      console.error("Error loading more items:", error);
    } finally {
      setFeedLoading(false);
    }
  };

  // Reload feed
  const handleReloadFeed = async () => {
    setRefreshing(true);
    setFeedPage(0);
    await loadDefaultFeed();
    setRefreshing(false);
  };

  // Handle search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setIsSearchMode(text.length > 0);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!feedLoading && !isSearchMode) {
      setFeedPage((prev) => prev + 1);
    }
  };

  const loadRecentChemicals = async () => {
    try {
      const stored = await AsyncStorage.getItem("recentChemicals");
      if (stored) {
        const ids = JSON.parse(stored);
        const recents = ids
          .map((id: string) => feedChemicals.find((c) => c.id === id))
          .filter(Boolean)
          .slice(0, 5);
        setRecentChemicals(recents);
      }
    } catch (error) {
      console.error("Error loading recent chemicals:", error);
    }
  };

  const handleChemicalPress = async (id: string) => {
    // Save to recent chemicals
    try {
      const stored = await AsyncStorage.getItem("recentChemicals");
      let ids = stored ? JSON.parse(stored) : [];
      ids = [id, ...ids.filter((i: string) => i !== id)].slice(0, 5);
      await AsyncStorage.setItem("recentChemicals", JSON.stringify(ids));
      await loadRecentChemicals();
    } catch (error) {
      console.error("Error saving recent chemical:", error);
    }
    router.push(`/chemical/${id}` as any);
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: isDark ? "#111B21" : "#FFFFFF" }}
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* U-Shaped Hero */}
        <LinearGradient
          colors={isDark ? ["#111B21", "#1F2C34"] : ["#FFFFFF", "#F7F9F9"]}
          style={{
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          <View className="pt-28 px-6 pb-4">
            <View className="flex-row items-center mb-2">
              <Text
                className="text-3xl font-bold mr-3"
                style={{ color: isDark ? "#E9EDEF" : "#0F1419" }}
              >
                Hi, Chemist!
              </Text>
              <Ionicons name="flask" size={32} color="#10B981" />
            </View>
            <Text
              className="text-base mb-2"
              style={{ color: isDark ? "#8696A0" : "#536471" }}
            >
              Search and explore safety data sheets
            </Text>
          </View>

          {/* Liquid Glass Search inside hero */}
          <LiquidGlassSearch
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search chemicals, CAS, formula..."
          />
        </LinearGradient>

        {/* Chemical Cards - FlatList for infinite scroll */}
        <FlatList
          data={displayChemicals}
          renderItem={({ item }) => (
            <ChemicalCard
              chemical={item}
              onPress={() => handleChemicalPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            feedLoading ? (
              <View className="py-6">
                <ActivityIndicator size="large" color="#10B981" />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleReloadFeed}
              colors={["#10B981"]}
              tintColor="#10B981"
            />
          }
        />
      </Animated.ScrollView>

      {/* Sticky Hamburger Menu Button */}
      <TouchableOpacity
        onPress={() => setIsSidebarOpen(true)}
        style={{
          position: "absolute",
          top: 40,
          left: 16,
          width: 45,
          height: 45,
          borderRadius: 22.5,
          backgroundColor: isDark
            ? "rgba(31, 44, 52, 0.9)"
            : "rgba(247, 249, 249, 0.9)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 101,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        activeOpacity={0.8}
      >
        <Ionicons
          name="menu"
          size={24}
          color={isDark ? "#E9EDEF" : "#0F1419"}
        />
      </TouchableOpacity>

      {/* Sticky Search Bar - Appears when scrolled past hero */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          zIndex: 100,
          opacity: scrollY.interpolate({
            inputRange: [150, 250],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [150, 250],
                outputRange: [-20, 0],
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      >
        <View style={{ backgroundColor: "none" }} className="ps-[66px]">
          <LiquidGlassSearch
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search chemicals, CAS, formula..."
          />
        </View>
      </Animated.View>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        recentChemicals={recentChemicals}
      />
    </View>
  );
}
