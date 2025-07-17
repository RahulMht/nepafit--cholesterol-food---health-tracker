import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Text, Pressable, Platform } from "react-native";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { Plus, Menu } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { CalorieRing } from "@/components/CalorieRing";
import { MacroProgressBar } from "@/components/MacroProgressBar";
import { RecentMeals } from "@/components/RecentMeals";
import { FoodInfoPopup } from "@/components/FoodInfoPopup";
import { Sidebar } from "@/components/Sidebar";
import { useAppState } from "@/context/AppStateContext";
import { EmptyDashboard } from "@/components/EmptyDashboard";
import { Colors } from "@/constants/colors";

export default function DashboardScreen() {
  const router = useRouter();
  const { 
    summary, 
    isLoading, 
    isOffline, 
    hasMeals, 
    todayMeals,
    foodInfoPopup, 
    hideFoodInfoPopup 
  } = useAppState();
  
  const [showSidebar, setShowSidebar] = useState(false);

  const handleAddMeal = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/modal");
  };

  const handleShowSidebar = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowSidebar(true);
  };

  // Debug logging
  useEffect(() => {
    console.log("Dashboard - hasMeals:", hasMeals);
    console.log("Dashboard - todayMeals count:", todayMeals.length);
    console.log("Dashboard - todayMeals:", todayMeals);
  }, [hasMeals, todayMeals]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            title: "Today's Heart Health",
            headerStyle: {
              backgroundColor: Colors.surface,
            },
            headerTitleStyle: {
              color: Colors.onSurface,
            },
          }}
        />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Today's Heart Health",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.onSurface,
          },
        }}
      />

      {!hasMeals ? (
        <EmptyDashboard onAddMeal={handleAddMeal} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ringContainer}>
            <CalorieRing
              consumed={summary.achieved?.cal || 0}
              target={summary.targets?.cal || 1800}
              isStale={isOffline && summary.stale}
            />
          </View>

          <View style={styles.macrosContainer}>
            <MacroProgressBar
              key="saturated-fat"
              name="Saturated Fat"
              grams={summary.achieved?.saturatedFat || 0}
              target={summary.targets?.saturatedFat || 20}
              percent={summary.percent_of_target?.saturatedFat || 0}
            />
            <MacroProgressBar
              key="cholesterol"
              name="Cholesterol"
              grams={summary.achieved?.cholesterol || 0}
              target={summary.targets?.cholesterol || 200}
              percent={summary.percent_of_target?.cholesterol || 0}
              unit="mg"
            />
            <MacroProgressBar
              key="fiber"
              name="Fiber"
              grams={summary.achieved?.fiber || 0}
              target={summary.targets?.fiber || 25}
              percent={summary.percent_of_target?.fiber || 0}
            />
            <MacroProgressBar
              key="protein"
              name="Protein"
              grams={summary.achieved?.protein || 0}
              target={summary.targets?.protein || 120}
              percent={summary.percent_of_target?.protein || 0}
            />
          </View>

          <RecentMeals meals={todayMeals} />
        </ScrollView>
      )}

      {/* Floating Menu Button */}
      <Pressable
        style={styles.menuFab}
        onPress={handleShowSidebar}
        onLongPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }}
      >
        <Menu color={Colors.onPrimary} size={24} />
      </Pressable>

      {/* Add Meal FAB */}
      <Pressable
        style={styles.fab}
        onPress={handleAddMeal}
        onLongPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }}
      >
        <Plus color={Colors.onPrimary} size={24} />
      </Pressable>

      <FoodInfoPopup
        visible={foodInfoPopup.visible}
        meal={foodInfoPopup.meal}
        onClose={hideFoodInfoPopup}
      />

      <Sidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray600,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  ringContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  macrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  menuFab: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});