import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useAppState } from "@/context/AppStateContext";

type CholesterolRisk = "low" | "moderate" | "high" | "very-high";

export default function ProfileWizardScreen() {
  const router = useRouter();
  const { completeProfileSetup } = useAppState();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [cholesterolRisk, setCholesterolRisk] = useState<CholesterolRisk>("moderate");
  const [takingStatins, setTakingStatins] = useState(false);
  const [targetCholesterol, setTargetCholesterol] = useState("200");
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      await completeProfileSetup({
        age: parseInt(age) || 30,
        weight: parseFloat(weight) || 70,
        height: parseFloat(height) || 170,
        cholesterolRisk,
        takingStatins,
        targetCholesterol: parseInt(targetCholesterol) || 200,
      });
      
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error completing profile setup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepDescription}>
        Let's set up your profile to personalize your heart health journey
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter your age"
          keyboardType="number-pad"
          maxLength={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter your weight in kg"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="Enter your height in cm"
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Heart Health Information</Text>
      <Text style={styles.stepDescription}>
        This helps us tailor our recommendations to your cardiovascular health needs
      </Text>

      <Text style={styles.label}>Cholesterol Risk Level</Text>
      <View style={styles.optionsContainer}>
        {[
          { value: "low", label: "Low Risk" },
          { value: "moderate", label: "Moderate Risk" },
          { value: "high", label: "High Risk" },
          { value: "very-high", label: "Very High Risk" },
        ].map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.optionButton,
              cholesterolRisk === option.value && styles.selectedOption,
            ]}
            onPress={() => setCholesterolRisk(option.value as CholesterolRisk)}
          >
            <Text
              style={[
                styles.optionText,
                cholesterolRisk === option.value && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Are you taking statins or cholesterol medication?</Text>
        <Switch
          value={takingStatins}
          onValueChange={setTakingStatins}
          trackColor={{ false: "#E0E0E0", true: "#BBDEFB" }}
          thumbColor={takingStatins ? "#2196F3" : "#BDBDBD"}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Cholesterol Goals</Text>
      <Text style={styles.stepDescription}>
        Set your target cholesterol levels to help manage your heart health
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Target Total Cholesterol (mg/dL)</Text>
        <TextInput
          style={styles.input}
          value={targetCholesterol}
          onChangeText={setTargetCholesterol}
          placeholder="Enter target in mg/dL"
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Recommended Cholesterol Levels</Text>
        <Text style={styles.infoText}>
          <Text>• Total Cholesterol: Less than 200 mg/dL{"\n"}</Text>
          <Text>• LDL (Bad): Less than 100 mg/dL{"\n"}</Text>
          <Text>• HDL (Good): 40+ mg/dL (men), 50+ mg/dL (women){"\n"}</Text>
          <Text>• Triglycerides: Less than 150 mg/dL</Text>
        </Text>
        <Text style={styles.infoNote}>
          These are general guidelines. Your healthcare provider may recommend different targets based on your risk factors.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step / 3) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Step {step} of 3</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.nextButton,
            step === 3 && styles.completeButton,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {step < 3 ? "Next" : isLoading ? "Completing..." : "Complete Setup"}
          </Text>
          {step < 3 && <ChevronRight size={20} color="#FFFFFF" />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  progressContainer: {
    padding: 16,
    paddingTop: 60,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#757575",
    textAlign: "right",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  stepContainer: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#424242",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#2196F3",
  },
  optionText: {
    fontSize: 14,
    color: "#424242",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: "#424242",
    flex: 1,
    marginRight: 16,
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 22,
    marginBottom: 8,
  },
  infoNote: {
    fontSize: 12,
    color: "#757575",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  backButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 2,
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  completeButton: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: "#90CAF9",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
  },
});