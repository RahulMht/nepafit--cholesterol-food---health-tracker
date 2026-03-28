import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { AppLogo } from "@/components/AppLogo";
import { Colors } from "@/constants/colors";

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
        <Plus size={20} color={Colors.onPrimary} />
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
    color: Colors.onBackground,
    marginBottom: 12,
    marginTop: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});