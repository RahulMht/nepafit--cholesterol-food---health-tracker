import React from "react";
import { Image } from "react-native";

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 240 }) => {
  return (
    <Image
      source={require("@/assets/images/logo.png")}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
};