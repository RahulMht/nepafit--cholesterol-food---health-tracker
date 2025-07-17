import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Ellipse } from "react-native-svg";
import { Colors } from "@/constants/colors";

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 80 }) => {
  const scale = size / 80; // Base size is 80

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        {/* Background circle */}
        <Circle
          cx="40"
          cy="40"
          r="35"
          fill={Colors.surface}
          stroke={Colors.gray200}
          strokeWidth="1"
        />
        
        {/* Main leaf/stem */}
        <Path
          d="M40 15 L40 45 Q40 50 35 50 Q30 50 30 45 L30 35 Q30 30 35 30 L40 30"
          fill={Colors.primary}
        />
        
        {/* Left leaf */}
        <Ellipse
          cx="30"
          cy="25"
          rx="8"
          ry="12"
          fill={Colors.primaryDark}
          transform="rotate(-30 30 25)"
        />
        
        {/* Right leaf */}
        <Ellipse
          cx="50"
          cy="25"
          rx="8"
          ry="12"
          fill={Colors.primaryLight}
          transform="rotate(30 50 25)"
        />
        
        {/* Orange fruit */}
        <Circle
          cx="25"
          cy="45"
          r="6"
          fill={Colors.secondary}
        />
        
        {/* Yellow fruit */}
        <Ellipse
          cx="55"
          cy="40"
          rx="7"
          ry="5"
          fill={Colors.accent}
        />
        
        {/* Small berries */}
        <Circle
          cx="45"
          cy="55"
          r="3"
          fill={Colors.secondaryLight}
        />
        <Circle
          cx="35"
          cy="58"
          r="2"
          fill={Colors.accentLight}
        />
        
        {/* Highlight dots */}
        <Circle
          cx="32"
          cy="42"
          r="1.5"
          fill={Colors.surface}
          opacity="0.8"
        />
        <Circle
          cx="52"
          cy="37"
          r="1"
          fill={Colors.surface}
          opacity="0.8"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    backgroundColor: Colors.surface,
  },
});