import React from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, Image } from "react-native";
import { Clock } from "lucide-react-native";
import { Meal } from "@/types";

interface RecentMealsProps {
  meals: Meal[];
}

export const RecentMeals: React.FC<RecentMealsProps> = ({ meals }) => {
  if (!meals.length) {
    return null;
  }

  // Sort meals by timestamp (newest first) and take first 5
  const recentMeals = [...meals]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Meals</Text>
        <Text style={styles.subtitle}>{meals.length} meal{meals.length !== 1 ? 's' : ''} logged</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealsContainer}
      >
        {recentMeals.map((meal, index) => (
          <Pressable key={`recent-meal-${meal.id || `${meal.timestamp}-${index}`}`} style={styles.mealCard}>
            {meal.imageUrl ? (
              <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
            ) : (
              <View style={[styles.mealImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>{meal.description[0] || 'F'}</Text>
              </View>
            )}
            <View style={styles.mealInfo}>
              <Text style={styles.mealName} numberOfLines={1}>
                {meal.description}
              </Text>
              <Text style={styles.mealTime}>{formatTime(meal.timestamp)}</Text>
              <Text style={styles.mealMacros}>
                {meal.calories} kcal • {meal.cholesterol}mg chol
              </Text>
              {meal.status === "queued" && (
                <View style={styles.queuedBadge}>
                  <Clock size={12} color="#FF9800" />
                  <Text style={styles.queuedText}>Queued</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
  },
  mealsContainer: {
    paddingRight: 16,
  },
  mealCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  mealImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#E0E0E0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#BDBDBD",
  },
  mealInfo: {
    padding: 12,
  },
  mealName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
  },
  mealMacros: {
    fontSize: 12,
    color: "#757575",
  },
  queuedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  queuedText: {
    fontSize: 10,
    color: "#FF9800",
    marginLeft: 4,
  },
});