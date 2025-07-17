import React, { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAppState } from "@/context/AppStateContext";
import { AppLogo } from "@/components/AppLogo";

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, checkAuthStatus } = useAppState();

  useEffect(() => {
    const initializeApp = async () => {
      await checkAuthStatus();
      
      // Add a minimum splash duration for better UX
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth/login");
        }
      }, 1500);
    };

    if (!isLoading) {
      initializeApp();
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <AppLogo size={192} />
      <ActivityIndicator 
        size="large" 
        color="#FFFFFF" 
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    marginTop: 32,
  },
});