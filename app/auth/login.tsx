import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";

import { useAppState } from "@/context/AppStateContext";
import { AppLogo } from "@/components/AppLogo";
import { Colors } from "@/constants/colors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/;

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, isOffline } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmailValid = EMAIL_REGEX.test(email);
  const isPasswordValid = PASSWORD_REGEX.test(password);
  const isFormValid = isEmailValid && isPasswordValid && !isOffline;

  const handleLogin = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err.status === 400) {
        setError("Invalid email or password. Please try again.");
      } else if (err.status >= 500) {
        setError("Server is busy. Please try again later.");
      } else {
        setError("Unable to connect. Please check your internet connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isOffline) return;

    setIsGoogleLoading(true);
    setError("");

    try {
      await loginWithGoogle();
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err.message === "CANCELLED") {
        // User cancelled, don't show error
        return;
      }
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/auth/register");
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
        <View style={styles.logoContainer}>
          <AppLogo size={720} />
          <Text style={styles.appName}>NepaFit</Text>
          <Text style={styles.tagline}>Manage cholesterol with smart nutrition</Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {isOffline && (
            <Text style={styles.offlineText}>
              You're offline. Please connect to the internet to log in.
            </Text>
          )}

          <Pressable
            style={[
              styles.googleButton,
              (isOffline || isGoogleLoading) && styles.disabledButton
            ]}
            onPress={handleGoogleLogin}
            disabled={isOffline || isGoogleLoading}
          >
            <Image
              source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
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
              placeholderTextColor={Colors.gray500}
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
                placeholder="Enter your password"
                placeholderTextColor={Colors.gray500}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.gray600} />
                ) : (
                  <Eye size={20} color={Colors.gray600} />
                )}
              </Pressable>
            </View>
            {password && !isPasswordValid && (
              <Text style={styles.validationText}>
                Password must be at least 8 characters with 1 digit
              </Text>
            )}
          </View>

          <Pressable
            style={[
              styles.loginButton,
              (!isFormValid || isLoading) && styles.disabledButton
            ]}
            onPress={handleLogin}
            disabled={!isFormValid || isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Logging in..." : "Log In"}
            </Text>
          </Pressable>

          <Pressable style={styles.registerLink} onPress={handleRegister}>
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerHighlight}>Register</Text>
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
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: Colors.gray600,
  },
  formContainer: {
    width: "100%",
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
    textAlign: "center",
    backgroundColor: Colors.error + "15",
    padding: 12,
    borderRadius: 8,
  },
  offlineText: {
    color: Colors.warning,
    marginBottom: 16,
    textAlign: "center",
    backgroundColor: Colors.warning + "15",
    padding: 12,
    borderRadius: 8,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray700,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray300,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.gray600,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: Colors.gray700,
  },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
    color: Colors.onSurface,
  },
  inputError: {
    borderColor: Colors.error,
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceVariant,
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
    color: Colors.onSurface,
  },
  eyeButton: {
    padding: 12,
  },
  validationText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
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
  loginButtonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  registerLink: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: Colors.gray600,
  },
  registerHighlight: {
    color: Colors.primary,
    fontWeight: "600",
  },
});