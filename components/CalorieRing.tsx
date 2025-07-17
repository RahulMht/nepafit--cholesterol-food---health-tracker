import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { AlertCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";

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
    if (percent < 0.5) return "#81C784"; // Light green
    if (percent < 0.75) return Colors.primary; // Primary green
    if (percent < 0.9) return "#FFC107"; // Yellow
    return "#FF9800"; // Orange
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
            stroke={Colors.gray200}
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
            <AlertCircle size={16} color={Colors.warning} />
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
    color: Colors.onBackground,
  },
  targetText: {
    fontSize: 16,
    color: Colors.gray600,
  },
  staleIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  staleText: {
    fontSize: 12,
    color: Colors.warning,
    marginLeft: 4,
  },
});