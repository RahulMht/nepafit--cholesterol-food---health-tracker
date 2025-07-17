import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { X, CheckCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Meal } from "@/types";

interface FoodInfoPopupProps {
  visible: boolean;
  meal: Meal | null;
  onClose: () => void;
}

export const FoodInfoPopup: React.FC<FoodInfoPopupProps> = ({
  visible,
  meal,
  onClose,
}) => {
  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  if (!meal) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.successIcon}>
              <CheckCircle size={24} color="#4CAF50" />
              <Text style={styles.successText}>Food Logged Successfully!</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#757575" />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {meal.imageUrl && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: meal.imageUrl }} style={styles.foodImage} />
              </View>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.foodName}>{meal.description}</Text>
              <Text style={styles.mealType}>{meal.mealType} • {meal.servings} serving{meal.servings !== 1 ? 's' : ''}</Text>
            </View>

            <View style={styles.nutritionSection}>
              <Text style={styles.sectionTitle}>Nutrition Information</Text>
              
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{meal.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{meal.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{meal.fiber}g</Text>
                  <Text style={styles.nutritionLabel}>Fiber</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={[styles.nutritionValue, styles.warningValue]}>
                    {meal.saturatedFat}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Saturated Fat</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={[styles.nutritionValue, styles.warningValue]}>
                    {meal.cholesterol}mg
                  </Text>
                  <Text style={styles.nutritionLabel}>Cholesterol</Text>
                </View>
              </View>
            </View>

            <View style={styles.heartHealthSection}>
              <Text style={styles.sectionTitle}>Heart Health Impact</Text>
              <View style={styles.healthTip}>
                <Text style={styles.healthTipText}>
                  {meal.cholesterol > 100 
                    ? "⚠️ High cholesterol content. Consider balancing with fiber-rich foods."
                    : meal.cholesterol > 50
                    ? "⚡ Moderate cholesterol. You're doing well!"
                    : "✅ Low cholesterol content. Great choice for heart health!"
                  }
                </Text>
              </View>
              
              {meal.fiber > 5 && (
                <View style={styles.healthTip}>
                  <Text style={styles.healthTipText}>
                    🌟 Excellent fiber content! This helps lower cholesterol naturally.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.continueButton} onPress={handleClose}>
              <Text style={styles.continueButtonText}>Continue Tracking</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  successIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    padding: 16,
    alignItems: "center",
  },
  foodImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  infoSection: {
    padding: 16,
    paddingTop: 8,
  },
  foodName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  mealType: {
    fontSize: 14,
    color: "#757575",
  },
  nutritionSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nutritionItem: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2196F3",
    marginBottom: 4,
  },
  warningValue: {
    color: "#FF9800",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },
  heartHealthSection: {
    padding: 16,
    paddingTop: 8,
  },
  healthTip: {
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  healthTipText: {
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
  },
  continueButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});