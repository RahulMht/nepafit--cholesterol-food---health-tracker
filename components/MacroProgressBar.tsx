import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";

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
    if (name === "Saturated Fat" || name === "Cholesterol") {
      // For cholesterol and saturated fat, lower is better
      if (percent < 50) return "#4CAF50"; // Green - Good
      if (percent < 75) return "#FF9800"; // Orange - Moderate
      return "#F44336"; // Red - High
    } else {
      // For other macros, moderate levels are good
      if (percent < 50) return "#4CAF50"; // Green
      if (percent < 75) return "#2196F3"; // Blue
      if (percent < 90) return "#FF9800"; // Orange
      return "#F44336"; // Red
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
    color: "#424242",
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
  },
  targetText: {
    fontWeight: "400",
    color: "#757575",
  },
  progressContainer: {
    height: 12,
    backgroundColor: "#E0E0E0",
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