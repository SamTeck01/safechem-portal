import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useRef } from "react";
import {
  Animated,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface LiquidGlassSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

export function LiquidGlassSearch({
  value,
  onChangeText,
  placeholder = "Search...",
  onFocus,
}: LiquidGlassSearchProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocusIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
      tension: 100,
      friction: 7,
    }).start();
    onFocus?.();
  };

  const handleFocusOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 7,
    }).start();
  };

  return (
    <Animated.View
      className="px-4 py-4"
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <BlurView
        intensity={isDark ? 20 : 80}
        tint={isDark ? "dark" : "light"}
        className="rounded-full overflow-hidden border"
        style={{
          borderColor: isDark ? "#2A3942" : "#EFF3F4",
        }}
      >
        <View
          className="flex-row items-center px-5 py-2"
          style={{
            backgroundColor: isDark
              ? "rgba(31, 44, 52, 0.95)"
              : "rgba(247, 249, 249, 0.8)",
          }}
        >
          <Ionicons
            name="search"
            size={20}
            color={isDark ? "#8696A0" : "#536471"}
          />
          <TextInput
            className="flex-1 text-base px-2"
            placeholder={placeholder}
            placeholderTextColor={isDark ? "#8696A0" : "#536471"}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocusIn}
            onBlur={handleFocusOut}
            style={{
              color: isDark ? "#E9EDEF" : "#0F1419",
            }}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={isDark ? "#8696A0" : "#536471"}
              />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
}
