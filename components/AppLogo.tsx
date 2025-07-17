import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 240 }) => {
  // Use a text-based logo instead of image to avoid asset resolution issues
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.logoCircle, { width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4 }]}>
        <Text style={[styles.logoText, { fontSize: size * 0.2 }]}>NF</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    color: Colors.onPrimary,
    fontWeight: "700",
    textAlign: "center",
  },
});