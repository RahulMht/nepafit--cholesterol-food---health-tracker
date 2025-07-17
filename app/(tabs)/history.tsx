import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Stack } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { WeeklyBarChart } from "@/components/WeeklyBarChart";
import { DailyMealsList } from "@/components/DailyMealsList";
import { useAppState } from "@/context/AppStateContext";

export default function HistoryScreen() {
  const { weeklySummary, isLoading, loadWeeklySummaryData } = useAppState();
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, -1 = last week, etc.

  // Load data when week changes
  useEffect(() => {
    loadWeeklySummaryData(currentWeek);
  }, [currentWeek]);

  const navigateWeek = (direction: number) => {
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

      <View style={styles.content}>
        <View style={styles.weekSelector}>
          <Pressable
            onPress={() => navigateWeek(-1)}
            style={({ pressed }) => [
              styles.weekButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ChevronLeft size={20} color="#2196F3" />
          </Pressable>
          
          <Text style={styles.weekTitle}>
            {getWeekTitle(currentWeek)}
          </Text>
          
          <Pressable
            onPress={() => navigateWeek(1)}
            disabled={currentWeek >= 0}
            style={({ pressed }) => [
              styles.weekButton,
              { opacity: currentWeek >= 0 ? 0.3 : pressed ? 0.7 : 1 },
            ]}
          >
            <ChevronRight size={20} color="#2196F3" />
          </Pressable>
        </View>

        <View style={styles.chartContainer}>
          <WeeklyBarChart data={weeklySummary.dailyCholesterol || []} />
        </View>

        <View style={styles.insightContainer}>
          <Text style={styles.insightTitle}>Weekly Insight</Text>
          <Text style={styles.insightText}>
            {weeklySummary.insight || "Track your meals consistently to get personalized heart health insights."}
          </Text>
        </View>

        <View style={styles.dailyContainer}>
          <Text style={styles.dailyTitle}>
            {currentWeek === 0 ? "Today's Meals" : "Recent Meals"}
          </Text>
          <DailyMealsList meals={weeklySummary.todayMeals || []} />
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingBottom: 16,
  },
  weekSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  dailyContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#212121",
    marginBottom: 16,
  },
});