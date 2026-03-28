import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AppStateProvider } from "@/context/AppStateContext";
import { OfflineBanner } from "@/components/OfflineBanner";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <>
      <OfflineBanner />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            title: 'Log Food',
            headerTintColor: '#2196F3'
          }} 
        />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            headerShown: false,
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="auth/register" 
          options={{ 
            headerShown: false,
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="auth/profileWizard" 
          options={{ 
            headerShown: false,
            gestureEnabled: false
          }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay to allow for initialization
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppStateProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AppStateProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}