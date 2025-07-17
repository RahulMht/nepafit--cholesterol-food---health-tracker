import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { WeeklyBarChart } from "@/components/WeeklyBarChart";
import { useAppState } from "@/context/AppStateContext";

export default function HistoryScreen() {
  const { weeklySummary, isLoading, loadWeeklySummaryData } = useAppState();
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, -1 = last week, etc.
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data when week changes with debounce
  useEffect(() => {
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Set loading state
    setIsLoadingWeek(true);

    // Debounce the load request
    loadTimeoutRef.current = setTimeout(async () => {
      try {
        await loadWeeklySummaryData(currentWeek);
      } catch (error) {
        console.error("Error loading weekly data:", error);
      } finally {
        setIsLoadingWeek(false);
      }
    }, 300); // 300ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [currentWeek]);

  const navigateWeek = (direction: number) => {
    // Prevent navigation while loading
    if (isLoadingWeek) return;
    
    const newWeek = currentWeek + direction;
    setCurrentWeek(newWeek);
  };

  const getWeekTitle = (weekOffset: number) => {
    if (weekOffset === 0) return "This Week";
    if (weekOffset === -1) return "Last Week";
    if (weekOffset < -1) return `${Math.abs(weekOffset)} Weeks Ago`;
    return "Future Week"; // This shouldn't happen as we disable future navigation
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "History" }} />

      <View style={styles.weekSelector}>
        <Pressable
          onPress={() => navigateWeek(-1)}
          disabled={isLoadingWeek}
          style={({ pressed }) => [
            styles.weekButton,
            { opacity: isLoadingWeek ? 0.3 : pressed ? 0.7 : 1 },
          ]}
        >
          <ChevronLeft size={20} color="#2196F3" />
        </Pressable>
        
        <Text style={styles.weekTitle}>
          {isLoadingWeek ? "Loading..." : getWeekTitle(currentWeek)}
        </Text>
        
        <Pressable
          onPress={() => navigateWeek(1)}
          disabled={currentWeek >= 0 || isLoadingWeek}
          style={({ pressed }) => [
            styles.weekButton,
            { opacity: (currentWeek >= 0 || isLoadingWeek) ? 0.3 : pressed ? 0.7 : 1 },
          ]}
        >
          <ChevronRight size={20} color="#2196F3" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.chartContainer}>
          <WeeklyBarChart data={weeklySummary.dailyCholesterol || []} />
        </View>

        <View style={styles.insightContainer}>
          <Text style={styles.insightTitle}>Weekly Insight</Text>
          <Text style={styles.insightText}>
            {weeklySummary.insight || "Track your meals consistently to get personalized heart health insights."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 16,
    color: "#757575",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  weekSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  weekButton: {
    padding: 8,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#212121",
  },
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  insightContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#212121",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 16,
    color: "#424242",
    lineHeight: 24,
  },
});