import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, ArrowLeft } from "lucide-react-native";

import { useAppState } from "@/context/AppStateContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/;

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isOffline } = useAppState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isNameValid = name.trim().length > 0;
  const isEmailValid = EMAIL_REGEX.test(email);
  const isPasswordValid = PASSWORD_REGEX.test(password);
  const isConfirmPasswordValid = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  const handleRegister = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setError("");

    try {
      await register(name.trim(), email, password);
      router.push("/auth/profileWizard");
    } catch (err: any) {
      if (err.status === 400) {
        setError("Registration failed. Please check your information.");
      } else if (err.status >= 500) {
        setError("Server is busy. Please try again later.");
      } else {
        setError("Unable to connect. Please check your internet connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#2196F3" />
        </Pressable>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join NepaFit to manage your heart health</Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                name && !isNameValid && styles.inputError
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
            {name && !isNameValid && (
              <Text style={styles.validationText}>Name is required</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                email && !isEmailValid && styles.inputError
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {email && !isEmailValid && (
              <Text style={styles.validationText}>Please enter a valid email</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.passwordContainer,
              password && !isPasswordValid && styles.inputError
            ]}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#757575" />
                ) : (
                  <Eye size={20} color="#757575" />
                )}
              </Pressable>
            </View>
            {password && !isPasswordValid && (
              <Text style={styles.validationText}>
                Password must be at least 8 characters with 1 digit
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[
              styles.passwordContainer,
              confirmPassword && !isConfirmPasswordValid && styles.inputError
            ]}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
            </View>
            {confirmPassword && !isConfirmPasswordValid && (
              <Text style={styles.validationText}>Passwords do not match</Text>
            )}
          </View>

          <Pressable
            style={[
              styles.registerButton,
              (!isFormValid || isLoading) && styles.disabledButton
            ]}
            onPress={handleRegister}
            disabled={!isFormValid || isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </Pressable>

          <Pressable style={styles.loginLink} onPress={handleBack}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginBottom: 16,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
  },
  formContainer: {
    width: "100%",
  },
  errorText: {
    color: "#F44336",
    marginBottom: 16,
    textAlign: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
  },
  offlineText: {
    color: "#FF9800",
    marginBottom: 16,
    textAlign: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#F44336",
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  validationText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#757575",
  },
  loginHighlight: {
    color: "#2196F3",
    fontWeight: "600",
  },
});