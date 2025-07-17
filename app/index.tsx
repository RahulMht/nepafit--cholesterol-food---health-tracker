import React, { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAppState } from "@/context/AppStateContext";
import { AppLogo } from "@/components/AppLogo";
import { Colors } from "@/constants/colors";

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
      <AppLogo size={120} />
      <Text style={styles.appName}>NepaFit</Text>
      <Text style={styles.tagline}>Your Heart Health Companion</Text>
      <ActivityIndicator 
        size="large" 
        color={Colors.onPrimary} 
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.onPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.onPrimary,
    opacity: 0.9,
    marginBottom: 32,
  },
  spinner: {
    marginTop: 32,
  },
});