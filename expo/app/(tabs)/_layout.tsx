import { Tabs } from "expo-router";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import { BarChart2, MessageSquare, Home } from "lucide-react-native";
import React, { useEffect } from "react";
import { Colors } from "@/constants/colors";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TabLayout() {
  // Apply layout animation when tabs change
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.gray200,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
          color: Colors.onSurface,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Coach",
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}