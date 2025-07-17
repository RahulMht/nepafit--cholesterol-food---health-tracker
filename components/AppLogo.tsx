import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Colors } from "@/constants/colors";

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 80 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="contain"
      />
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
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    borderRadius: 20,
  },
});