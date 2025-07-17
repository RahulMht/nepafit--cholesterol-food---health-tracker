import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";
import { Colors } from "@/constants/colors";

interface MacroProgressBarProps {
  name: string;
  grams: number;
  target: number;
  percent: number;
  unit?: string;
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  name,
  grams,
  target,
  percent,
  unit = "g",
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percent / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  // Determine color based on percentage and macro type
  const getColor = () => {
    if (name === "Cholesterol") {
      // For cholesterol: light green (0-50%), yellow (50-80%), orange (80%+)
      if (percent < 50) return "#81C784"; // Light green - Good
      if (percent < 80) return "#FFC107"; // Yellow - Moderate
      return "#FF9800"; // Orange - High
    } else if (name === "Saturated Fat") {
      // For saturated fat, lower is better
      if (percent < 50) return Colors.success; // Green - Good
      if (percent < 75) return Colors.warning; // Orange - Moderate
      return Colors.error; // Red - High
    } else {
      // For other macros, moderate levels are good
      if (percent < 50) return Colors.success; // Green
      if (percent < 75) return Colors.primary; // Primary green
      if (percent < 90) return Colors.warning; // Orange
      return Colors.error; // Red
    }
  };

  const color = getColor();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.macroName}>{name}</Text>
        <Text style={styles.macroValue}>
          {grams.toFixed(1)}{unit} <Text style={styles.targetText}>/ {target}{unit}</Text>
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: color,
            },
          ]}
        />
        <Text style={[styles.percentText, { color }]}>{percent}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  macroName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray700,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray700,
  },
  targetText: {
    fontWeight: "400",
    color: Colors.gray600,
  },
  progressContainer: {
    height: 12,
    backgroundColor: Colors.gray200,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    position: "absolute",
    left: 0,
    top: 0,
  },
  percentText: {
    position: "absolute",
    right: 8,
    top: -2,
    fontSize: 10,
    fontWeight: "700",
  },
});