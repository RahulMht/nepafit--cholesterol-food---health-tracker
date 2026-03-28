import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image as ImageIcon, Type, X, Camera, Plus, Minus } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { useAppState } from "@/context/AppStateContext";
import { Colors } from "@/constants/colors";

type TabType = "gallery" | "camera" | "text";
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Drink";

export default function LogFoodModal() {
  const router = useRouter();
  const { isOffline, logMeal } = useAppState();
  const [activeTab, setActiveTab] = useState<TabType>("gallery");
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("Snack");
  const [servings, setServings] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: TabType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const handleMealTypeSelect = (type: MealType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMealType(type);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setActiveTab("text"); // Switch to text tab to add description
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take photos!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setActiveTab("text"); // Switch to text tab to add description
    }
  };

  // Updated validation: either image OR description (min 3 chars) is required
  const isFormValid = () => {
    const hasImage = !!image;
    const hasValidDescription = description.trim().length >= 3;
    return hasImage || hasValidDescription;
  };

  const handleServingsChange = (increment: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (increment) {
      setServings(prev => Math.min(10, prev + 0.25));
    } else {
      setServings(prev => Math.max(0.25, prev - 0.25));
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setIsLoading(true);

    try {
      const mealData = {
        description: description.trim() || (image ? "" : "Food item"), // Make description optional if image exists
        image,
        mealType,
        servings,
      };

      console.log("Submitting meal data:", mealData);
      
      const result = await logMeal(mealData);

      if (result.success) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.back();
      } else {
        // Show error message for food identification failure
        Alert.alert(
          "Food Identification Issue",
          result.error || "We had trouble identifying your food. Please try again with a clearer image or add a description.",
          [
            {
              text: "Try Again",
              style: "default",
            },
          ]
        );
        
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error("Error logging meal:", error);
      Alert.alert(
        "Error",
        "Failed to log meal. Please check your connection and try again.",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "gallery":
        return (
          <View style={styles.galleryContainer}>
            {image ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <Pressable 
                  style={styles.removeImageButton} 
                  onPress={() => setImage(null)}
                >
                  <X size={20} color={Colors.onPrimary} />
                </Pressable>
              </View>
            ) : (
              <Pressable 
                style={styles.pickImageButton} 
                onPress={handlePickImage}
              >
                <ImageIcon size={48} color={Colors.primary} />
                <Text style={styles.pickImageText}>Select from Gallery</Text>
              </Pressable>
            )}
          </View>
        );
      
      case "camera":
        return (
          <View style={styles.galleryContainer}>
            {image ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <Pressable 
                  style={styles.removeImageButton} 
                  onPress={() => setImage(null)}
                >
                  <X size={20} color={Colors.onPrimary} />
                </Pressable>
              </View>
            ) : (
              <Pressable 
                style={styles.pickImageButton} 
                onPress={handleTakePhoto}
              >
                <Camera size={48} color={Colors.primary} />
                <Text style={styles.pickImageText}>Take Photo</Text>
              </Pressable>
            )}
          </View>
        );
      
      case "text":
        return (
          <View style={styles.textContainer}>
            {image && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <Pressable 
                  style={styles.removeImageButton} 
                  onPress={() => setImage(null)}
                >
                  <X size={20} color={Colors.onPrimary} />
                </Pressable>
              </View>
            )}
            <TextInput
              style={styles.descriptionInput}
              placeholder={image ? "Describe your meal (optional)" : "Describe your meal (e.g., 'Chicken salad with olive oil')"}
              placeholderTextColor={Colors.gray500}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
            />
            {!image && (
              <Text style={styles.helperText}>
                Minimum 3 characters required when no image is provided
              </Text>
            )}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Log Food",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.onSurface,
          },
          headerTintColor: Colors.primary,
          headerRight: () => (
            <Pressable
              onPress={router.back}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <X size={24} color={Colors.gray600} />
            </Pressable>
          ),
        }} 
      />

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "gallery" && styles.activeTab]}
          onPress={() => handleTabChange("gallery")}
        >
          <ImageIcon size={20} color={activeTab === "gallery" ? Colors.primary : Colors.gray600} />
          <Text style={[styles.tabText, activeTab === "gallery" && styles.activeTabText]}>
            Gallery
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "camera" && styles.activeTab]}
          onPress={() => handleTabChange("camera")}
        >
          <Camera size={20} color={activeTab === "camera" ? Colors.primary : Colors.gray600} />
          <Text style={[styles.tabText, activeTab === "camera" && styles.activeTabText]}>
            Camera
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "text" && styles.activeTab]}
          onPress={() => handleTabChange("text")}
        >
          <Type size={20} color={activeTab === "text" ? Colors.primary : Colors.gray600} />
          <Text style={[styles.tabText, activeTab === "text" && styles.activeTabText]}>
            Text
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}

        <View style={styles.mealTypeContainer}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealTypeScroll}
          >
            {["Breakfast", "Lunch", "Dinner", "Snack", "Drink"].map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.mealTypeChip,
                  mealType === type && styles.activeMealTypeChip,
                ]}
                onPress={() => handleMealTypeSelect(type as MealType)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    mealType === type && styles.activeMealTypeText,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.servingsContainer}>
          <Text style={styles.sectionTitle}>Servings</Text>
          <View style={styles.servingsControls}>
            <Pressable
              style={[styles.servingButton, servings <= 0.25 && styles.disabledServingButton]}
              onPress={() => handleServingsChange(false)}
              disabled={servings <= 0.25}
            >
              <Minus size={20} color={servings <= 0.25 ? Colors.gray400 : Colors.primary} />
            </Pressable>
            
            <View style={styles.servingValueContainer}>
              <Text style={styles.servingValue}>{servings.toFixed(2)}</Text>
              <Text style={styles.servingLabel}>servings</Text>
            </View>
            
            <Pressable
              style={[styles.servingButton, servings >= 10 && styles.disabledServingButton]}
              onPress={() => handleServingsChange(true)}
              disabled={servings >= 10}
            >
              <Plus size={20} color={servings >= 10 ? Colors.gray400 : Colors.primary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.analyzeButton,
            !isFormValid() && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.onPrimary} />
          ) : (
            <Text style={styles.analyzeButtonText}>
              {isOffline ? "Save for Later" : "Analyze Now"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.gray600,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  galleryContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  pickImageButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  pickImageText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },
  previewContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  descriptionInput: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  helperText: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 8,
    fontStyle: "italic",
  },
  mealTypeContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.onSurface,
  },
  mealTypeScroll: {
    paddingRight: 16,
  },
  mealTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  activeMealTypeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  mealTypeText: {
    fontSize: 14,
    color: Colors.gray700,
  },
  activeMealTypeText: {
    color: Colors.onPrimary,
    fontWeight: "500",
  },
  servingsContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  servingsControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  servingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  disabledServingButton: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
  },
  servingValueContainer: {
    alignItems: "center",
    minWidth: 80,
  },
  servingValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },
  servingLabel: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.surface,
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: Colors.gray400,
    elevation: 0,
    shadowOpacity: 0,
  },
  analyzeButtonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});