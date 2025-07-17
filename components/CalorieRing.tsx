import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { AlertCircle } from "lucide-react-native";

interface CalorieRingProps {
  consumed: number;
  target: number;
  isStale?: boolean;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
  isStale = false,
}) => {
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(consumed / target, 1);
  const strokeDashoffset = circumference - percent * circumference;

  // Determine color based on percentage
  const getColor = () => {
    if (percent < 0.5) return "#4CAF50"; // Green
    if (percent < 0.75) return "#2196F3"; // Blue
    if (percent < 0.9) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="transparent"
            transform={`rotate(-90 ${centerX} ${centerY})`}
          />
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${centerX} ${centerY})`}
          />
        </G>
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.calorieText}>{consumed}</Text>
        <Text style={styles.targetText}>of {target} kcal</Text>
        {isStale && (
          <View style={styles.staleIndicator}>
            <AlertCircle size={16} color="#FF9800" />
            <Text style={styles.staleText}>Data may be outdated</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
  },
  calorieText: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#212121",
  },
  targetText: {
    fontSize: 16,
    color: "#757575",
  },
  staleIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  staleText: {
    fontSize: 12,
    color: "#FF9800",
    marginLeft: 4,
  },
});