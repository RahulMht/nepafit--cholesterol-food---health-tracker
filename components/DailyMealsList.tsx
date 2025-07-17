import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { Clock } from "lucide-react-native";
import { Meal } from "@/types";

interface DailyMealsListProps {
  meals: Meal[];
}

export const DailyMealsList: React.FC<DailyMealsListProps> = ({ meals }) => {
  if (!meals.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No meals logged today</Text>
      </View>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMealItem = (item: Meal) => (
    <View key={item.id} style={styles.mealItem}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.mealImage} />
      ) : (
        <View style={[styles.mealImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>{item.description[0]}</Text>
        </View>
      )}
      
      <View style={styles.mealInfo}>
        <Text style={styles.mealName}>{item.description}</Text>
        <Text style={styles.mealTime}>{formatTime(item.timestamp)}</Text>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.calories}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.cholesterol}</Text>
            <Text style={styles.macroLabel}>chol</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.saturatedFat}</Text>
            <Text style={styles.macroLabel}>sat fat</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.fiber}</Text>
            <Text style={styles.macroLabel}>fiber</Text>
          </View>
        </View>
        
        {item.status === "queued" && (
          <View style={styles.queuedBadge}>
            <Clock size={12} color="#FF9800" />
            <Text style={styles.queuedText}>Queued</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.listContainer}>
      {meals.map(renderMealItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
  },
  mealItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#BDBDBD",
  },
  mealInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#212121",
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 8,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#424242",
  },
  macroLabel: {
    fontSize: 10,
    color: "#757575",
  },
  queuedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  queuedText: {
    fontSize: 10,
    color: "#FF9800",
    marginLeft: 4,
  },
});