import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { AppLogo } from "@/components/AppLogo";

interface EmptyDashboardProps {
  onAddMeal: () => void;
}

export const EmptyDashboard: React.FC<EmptyDashboardProps> = ({ onAddMeal }) => {
  return (
    <View style={styles.container}>
      <AppLogo size={200} />
      <Text style={styles.title}>Track Your First Meal</Text>
      <Text style={styles.description}>
        Start tracking your meals to get personalized insights and maintain healthy cholesterol levels.
      </Text>
      <Pressable style={styles.button} onPress={onAddMeal}>
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Log Your First Meal</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 12,
    marginTop: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});