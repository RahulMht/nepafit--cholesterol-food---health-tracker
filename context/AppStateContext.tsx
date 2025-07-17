import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import createContextHook from "@nkzw/create-context-hook";
import { Meal, Message, Summary, WeeklySummary, Profile, UserProfile } from "@/types";

// Complete the auth session for web - only on native platforms
if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

// API Webhook URLs - Updated with new summary webhook and chat webhook
const FOOD_INTAKE_WEBHOOK = "https://foothaven.app.n8n.cloud/webhook-test/4f5c25b0-30cf-408c-83f9-a37266cc6788";
const SUMMARY_WEBHOOK = "https://foothaven.app.n8n.cloud/webhook-test/0cf5a4d3-fe19-41be-9b5a-98e343742fd5";
const CHAT_WEBHOOK = "https://foothaven.app.n8n.cloud/webhook-test/6f23d85e-3d50-4593-8521-3b561bc42b75";
const LOGIN_WEBHOOK = "https://your-api.com/auth/login"; // Replace with your login webhook
const REGISTER_WEBHOOK = "https://your-api.com/auth/register"; // Replace with your register webhook
const GOOGLE_AUTH_WEBHOOK = "https://your-api.com/auth/google"; // Replace with your Google auth webhook

// Cloudinary configuration - FIXED
const CLOUDINARY_CLOUD_NAME = "djxhholpn";
const CLOUDINARY_API_KEY = "362157199181595";
const CLOUDINARY_API_SECRET = "eXUX0EsbhN9zIfchtZQixi2mcAk";

// Google OAuth configuration - Fixed type handling
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";

// Pre-created users database - Updated with Rahul Mahatha
const USERS_DATABASE = [
  {
    email: "test@example.com",
    password: "password123",
    profile: { name: "Test User", email: "test@example.com" },
    userProfile: { age: 30, weight: 70, height: 170, gender: "Not specified" }
  },
  {
    email: "rrmahatha@gmail.com",
    password: "pass1221",
    profile: { name: "Rahul Mahatha", email: "rrmahatha@gmail.com" },
    userProfile: { age: 24, weight: 65, height: 174, gender: "Male" }
  }
];

// Storage helpers
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

// Helper function to check if a date is today
const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Helper function to get today's start time
const getTodayStart = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper function to get week start and end dates
const getWeekDates = (weekOffset: number = 0): { startDate: string; endDate: string } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as 0
  
  // Calculate the Monday of the target week
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);
  
  // Calculate the Sunday of the target week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    startDate: monday.toISOString(),
    endDate: sunday.toISOString()
  };
};

// Helper function to get day start and end dates
const getDayDates = (dayOffset: number = 0): { startDate: string; endDate: string } => {
  const today = new Date();
  const targetDay = new Date(today);
  targetDay.setDate(today.getDate() + dayOffset);
  
  const startDate = new Date(targetDay);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(targetDay);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

// Generate SHA-1 hash for Cloudinary signature
const generateSHA1 = async (data: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    data,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return digest;
};

// Generate Cloudinary signature for authenticated uploads
const generateCloudinarySignature = async (params: Record<string, string | number>): Promise<string> => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const stringToSign = sortedParams + CLOUDINARY_API_SECRET;
  return await generateSHA1(stringToSign);
};

// Cloudinary image upload function - FIXED
const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    console.log("Uploading image to Cloudinary:", imageUri);
    
    // Prepare form data for Cloudinary upload
    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      // For web, convert to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('file', blob);
    } else {
      // For native platforms (iOS and Android)
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      const mimeType = `image/${fileType}`;
      
      const imageFile = {
        uri: imageUri,
        name: `food-image-${Date.now()}.${fileType}`,
        type: mimeType
      };
      
      formData.append('file', imageFile as any);
    }
    
    // Use signed upload with proper authentication
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `food-images/food-${timestamp}`;
    
    // Prepare parameters for signature
    const signatureParams = {
      timestamp: timestamp,
      public_id: publicId,
      folder: 'food-images'
    };
    
    // Generate signature
    const signature = await generateCloudinarySignature(signatureParams);
    
    // Add all required parameters to form data
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('public_id', publicId);
    formData.append('folder', 'food-images');
    formData.append('signature', signature);
    
    console.log("Uploading to Cloudinary with signed request...");
    
    // Upload to Cloudinary using signed upload with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    console.log("Cloudinary response status:", uploadResponse.status);
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Cloudinary upload error:", errorText);
      throw new Error(`Cloudinary upload failed: ${uploadResponse.status} - ${errorText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log("Cloudinary upload successful:", uploadResult);
    
    // Return the secure URL from Cloudinary
    return uploadResult.secure_url;
    
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    
    // Try unsigned upload as fallback
    try {
      return await uploadImageToCloudinaryUnsigned(imageUri);
    } catch (fallbackError) {
      console.error("Unsigned upload also failed:", fallbackError);
      
      // Final fallback: return a placeholder URL for development
      const placeholderUrl = `https://via.placeholder.com/400x300/CCCCCC/666666?text=Food+Image+${Date.now()}`;
      console.log("Using placeholder URL:", placeholderUrl);
      return placeholderUrl;
    }
  }
};

// Unsigned upload to Cloudinary (fallback method)
const uploadImageToCloudinaryUnsigned = async (imageUri: string): Promise<string> => {
  console.log("Attempting unsigned upload to Cloudinary...");
  
  const formData = new FormData();
  
  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append('file', blob);
  } else {
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg';
    const mimeType = `image/${fileType}`;
    
    const imageFile = {
      uri: imageUri,
      name: `food-image-${Date.now()}.${fileType}`,
      type: mimeType
    };
    
    formData.append('file', imageFile as any);
  }
  
  // Use unsigned upload with upload_preset
  const timestamp = Math.round(Date.now() / 1000);
  formData.append('upload_preset', 'ml_default'); // Use default unsigned preset
  formData.append('folder', 'food-images');
  formData.append('timestamp', timestamp.toString());
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    }
  );
  
  clearTimeout(timeoutId);
  
  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("Unsigned Cloudinary upload error:", errorText);
    throw new Error(`Cloudinary unsigned upload failed: ${uploadResponse.status} - ${errorText}`);
  }
  
  const uploadResult = await uploadResponse.json();
  console.log("Cloudinary unsigned upload successful:", uploadResult);
  
  return uploadResult.secure_url;
};

// Real API function for food logging - now uses Cloudinary image URLs with 30 second timeout
const logMealAPI = async (mealData: any): Promise<{ meal: Meal; foodIdentified: boolean; error?: string }> => {
  try {
    const token = await storage.getItem("authToken");
    
    let imageUrl = null;
    
    // If there's an image, upload it to Cloudinary first and get the URL
    if (mealData.image) {
      console.log("Uploading image to Cloudinary before sending to webhook...");
      imageUrl = await uploadImageToCloudinary(mealData.image);
      console.log("Image uploaded to Cloudinary, URL:", imageUrl);
    }
    
    // Prepare the request payload with Cloudinary image URL
    const requestPayload = {
      description: mealData.description || '',
      imageUrl: imageUrl, // Send Cloudinary URL instead of binary data
      mealType: mealData.mealType,
      servings: mealData.servings,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending request to webhook:", FOOD_INTAKE_WEBHOOK);
    console.log("Request payload:", requestPayload);

    // Add timeout to prevent hanging - increased to 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(FOOD_INTAKE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Webhook error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Webhook response:", result);
    
    // Check if food was identified
    const foodIdentified = result.foodidentified !== false; // Default to true if not specified
    
    // Transform the response to match our Meal interface - USE ACTUAL VALUES FROM RESPONSE
    const meal: Meal = {
      id: result.id || Date.now().toString(),
      description: result.description || mealData.description || "Food item",
      mealType: result.mealType || mealData.mealType,
      servings: result.servings || mealData.servings,
      calories: result.calories || 0, // Use actual values from response
      saturatedFat: result.saturatedFat || 0, // Use actual values from response
      cholesterol: result.cholesterol || 0, // Use actual values from response
      fiber: result.fiber || 0, // Use actual values from response
      protein: result.protein || 0, // Use actual values from response
      imageUrl: imageUrl, // Use the Cloudinary image URL
      timestamp: result.timestamp || new Date().toISOString(),
      status: "sent" as const,
    };

    return {
      meal,
      foodIdentified,
      error: foodIdentified ? undefined : "Food identification failed"
    };
  } catch (error) {
    console.error("Error calling food intake webhook:", error);
    throw error;
  }
};

// Real API function for daily summary - Updated to use webhook
const loadDailySummaryAPI = async (dayOffset: number = 0): Promise<Summary> => {
  try {
    const token = await storage.getItem("authToken");
    
    // Get the target day's date range
    const { startDate, endDate } = getDayDates(dayOffset);
    
    const requestPayload = {
      startDate,
      endDate,
      type: "daily" // Indicate this is a daily summary request
    };

    console.log("Fetching daily summary from webhook:", SUMMARY_WEBHOOK);
    console.log("Request payload:", requestPayload);

    // Add timeout to prevent hanging - 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(SUMMARY_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("Daily summary response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Daily summary webhook error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Daily summary webhook response:", result);
    
    // Transform the response to match our Summary interface
    const summary: Summary = {
      achieved: result.achieved || { cal: 0, saturatedFat: 0, cholesterol: 0, fiber: 0, protein: 0 },
      targets: result.targets || { cal: 1800, saturatedFat: 20, cholesterol: 200, fiber: 25, protein: 120 },
      percent_of_target: result.percent_of_target || { saturatedFat: 0, cholesterol: 0, fiber: 0, protein: 0 },
      meals: result.meals || [],
      stale: false,
    };
    
    return summary;
  } catch (error) {
    console.error("Error calling daily summary webhook:", error);
    throw error;
  }
};

// Real API function for chat - FIXED to handle response format properly with better error handling
const sendChatMessageAPI = async (message: string): Promise<{ text: string }> => {
  try {
    const token = await storage.getItem("authToken");
    
    const requestPayload = {
      message: message,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending chat message to webhook:", CHAT_WEBHOOK);
    console.log("Request payload:", requestPayload);

    // Add timeout to prevent hanging - 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("Chat response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chat webhook error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get the raw response text first
    const responseText = await response.text();
    console.log("Raw chat response:", responseText);
    
    let responseData;
    try {
      // Try to parse as JSON
      responseData = JSON.parse(responseText);
      console.log("Parsed chat response:", responseData);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.log("Response was not valid JSON, treating as plain text");
      
      // If it's not JSON, treat the raw text as the reply
      return { text: responseText };
    }
    
    // Handle the expected response format: { "output": { "reply": "..." } }
    let responseText_final = "I'm having trouble responding right now. Please try again later.";
    
    try {
      // Check if responseData has the expected structure
      if (responseData && responseData.output && responseData.output.reply) {
        responseText_final = responseData.output.reply;
        console.log("Extracted reply from response:", responseText_final);
      } else if (Array.isArray(responseData) && responseData.length > 0) {
        // Handle array format: [{ "output": { "reply": "..." } }]
        const firstItem = responseData[0];
        if (firstItem && firstItem.output && firstItem.output.reply) {
          responseText_final = firstItem.output.reply;
          console.log("Extracted reply from array response:", responseText_final);
        } else {
          console.error("Array response doesn't have expected structure:", firstItem);
        }
      } else if (typeof responseData === 'string') {
        // If the response is just a string, use it directly
        responseText_final = responseData;
        console.log("Using string response directly:", responseText_final);
      } else {
        console.error("Unexpected response format:", responseData);
        console.log("Response structure:", JSON.stringify(responseData, null, 2));
      }
    } catch (parseError) {
      console.error("Error parsing chat response:", parseError);
      // Use fallback response
    }
    
    return { text: responseText_final };
  } catch (error) {
    console.error("Error calling chat webhook:", error);
    throw error;
  }
};

// Calculate local summary from today's meals
const calculateLocalSummary = (todayMeals: Meal[]): Summary => {
  const totals = todayMeals.reduce((acc, meal) => ({
    cal: acc.cal + (meal.calories || 0),
    saturatedFat: acc.saturatedFat + (meal.saturatedFat || 0),
    cholesterol: acc.cholesterol + (meal.cholesterol || 0),
    fiber: acc.fiber + (meal.fiber || 0),
    protein: acc.protein + (meal.protein || 0),
  }), { cal: 0, saturatedFat: 0, cholesterol: 0, fiber: 0, protein: 0 });

  const targets = {
    cal: 1800,
    saturatedFat: 20,
    cholesterol: 200,
    fiber: 25,
    protein: 120,
  };

  const percent_of_target = {
    saturatedFat: Math.round((totals.saturatedFat / targets.saturatedFat) * 100),
    cholesterol: Math.round((totals.cholesterol / targets.cholesterol) * 100),
    fiber: Math.round((totals.fiber / targets.fiber) * 100),
    protein: Math.round((totals.protein / targets.protein) * 100),
  };

  return {
    achieved: totals,
    targets,
    percent_of_target,
    meals: todayMeals,
    stale: false,
  };
};

// Fallback summary data
const getFallbackSummary = (): Summary => ({
  achieved: { cal: 0, saturatedFat: 0, cholesterol: 0, fiber: 0, protein: 0 },
  targets: { cal: 1800, saturatedFat: 20, cholesterol: 200, fiber: 25, protein: 120 },
  percent_of_target: { saturatedFat: 0, cholesterol: 0, fiber: 0, protein: 0 },
  meals: [],
  stale: true,
});

// Fallback weekly summary data
const getFallbackWeeklySummary = (): WeeklySummary => ({
  dailyCholesterol: [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ],
  insight: "Unable to load weekly insights. Please check your connection and try again later.",
  todayMeals: [],
});

// Mock API functions - Updated with user database
const mockAuthLogin = async (email: string, password: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find user in database
  const user = USERS_DATABASE.find(u => u.email === email && u.password === password);
  
  if (user) {
    return {
      token: "mock-jwt-token-" + Date.now(),
      profile: user.profile,
      userProfile: user.userProfile
    };
  }
  
  throw { status: 400, message: "Invalid credentials" };
};

const mockAuthRegister = async (name: string, email: string, password: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  const existingUser = USERS_DATABASE.find(u => u.email === email);
  if (existingUser) {
    throw { status: 400, message: "User already exists" };
  }
  
  // Create new user
  const newUser = {
    email,
    password,
    profile: { name, email },
    userProfile: { age: 0, weight: 0, height: 0, gender: "Not specified" }
  };
  
  USERS_DATABASE.push(newUser);
  
  return {
    token: "mock-jwt-token-" + Date.now(),
    profile: newUser.profile,
    userProfile: newUser.userProfile
  };
};

const mockGoogleAuth = async (idToken: string) => {
  // Simulate API call to verify Google token and create/login user
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, you'd send the idToken to your backend for verification
  return {
    token: "mock-jwt-token-google-" + Date.now(),
    profile: { name: "Google User", email: "google@example.com" },
    userProfile: { age: 0, weight: 0, height: 0, gender: "Not specified" }
  };
};

// Create the context hook
const [AppStateProvider, useAppStateInternal] = createContextHook(() => {
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]); // Store all meals
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]); // Store today's meals specifically
  const [pendingMeals, setPendingMeals] = useState<Meal[]>([]);
  const [summary, setSummary] = useState<Summary>({
    achieved: { cal: 0, saturatedFat: 0, cholesterol: 0, fiber: 0, protein: 0 },
    targets: { cal: 1800, saturatedFat: 20, cholesterol: 200, fiber: 25, protein: 120 },
    percent_of_target: { saturatedFat: 0, cholesterol: 0, fiber: 0, protein: 0 },
    meals: [],
  });
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    dailyCholesterol: [
      { day: "Mon", value: 0 },
      { day: "Tue", value: 0 },
      { day: "Wed", value: 0 },
      { day: "Thu", value: 0 },
      { day: "Fri", value: 0 },
      { day: "Sat", value: 0 },
      { day: "Sun", value: 0 },
    ],
    insight: "Track your meals consistently to get personalized heart health insights.",
    todayMeals: [],
  });
  const [foodInfoPopup, setFoodInfoPopup] = useState<{ visible: boolean; meal: Meal | null }>({
    visible: false,
    meal: null,
  });

  // Google Auth Configuration - Fixed to prevent null issues
  const googleAuthConfig = Platform.OS !== 'web' ? {
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.IdToken,
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'nepafit',
    }),
    extraParams: {
      nonce: Crypto.randomUUID(),
    },
  } : {
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.IdToken,
    redirectUri: 'http://localhost:3000',
    extraParams: {
      nonce: Crypto.randomUUID(),
    },
  };

  // Always call the hook consistently - handle platform differences in the implementation
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    googleAuthConfig,
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  // Calculate hasMeals based on today's meals
  const hasMeals = todayMeals.length > 0;

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return unsubscribe;
  }, []);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await checkAuthStatus();
        await loadStoredMeals();
        await loadUserProfile();
        // Load initial summary data
        await loadSummaryData();
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle Google Auth Response - only on native platforms
  useEffect(() => {
    if (Platform.OS !== 'web' && response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleAuthSuccess(id_token);
    }
  }, [response]);

  // Reset data at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      // Clear today's meals and reload data for the new day
      console.log("New day started - clearing today's meals and reloading data");
      setTodayMeals([]);
      loadSummaryData(); // Reload summary for new day
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  // Filter today's meals whenever allMeals changes
  useEffect(() => {
    const filterTodayMeals = () => {
      const today = allMeals.filter(meal => isToday(meal.timestamp));
      setTodayMeals(today);
      console.log("Filtered today's meals:", today.length, "meals from", allMeals.length, "total meals");
    };

    filterTodayMeals();
  }, [allMeals]);

  // Load stored meals from storage
  const loadStoredMeals = async () => {
    try {
      const storedMeals = await storage.getItem("meals");
      if (storedMeals) {
        const meals = JSON.parse(storedMeals);
        setAllMeals(meals);
        console.log("Loaded stored meals:", meals.length, "total meals");
      }
    } catch (error) {
      console.error("Error loading stored meals:", error);
    }
  };

  // Load user profile from storage
  const loadUserProfile = async () => {
    try {
      const storedProfile = await storage.getItem("userProfile");
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        setUserProfile(profile);
        console.log("Loaded user profile:", profile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  // Load weekly summary data from API with updated response schema
  const loadWeeklySummaryData = async (weekOffset: number = 0) => {
    if (isOffline) {
      console.log("App is offline, using fallback weekly summary");
      setWeeklySummary(getFallbackWeeklySummary());
      return;
    }

    try {
      // Get the target week's date range
      const { startDate, endDate } = getWeekDates(weekOffset);
      
      const requestPayload = {
        startDate,
        endDate,
        type: "weekly" // Indicate this is a weekly summary request
      };

      console.log("Fetching weekly summary from webhook:", SUMMARY_WEBHOOK);
      console.log("Request payload:", requestPayload);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(SUMMARY_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("Weekly summary response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Weekly summary webhook error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Weekly summary webhook response:", result);
      
      // Handle the new response schema with dataAvailability
      const weeklySummary: WeeklySummary = {
        dailyCholesterol: result.dailyCholesterol || [
          { day: "Mon", value: 0 },
          { day: "Tue", value: 0 },
          { day: "Wed", value: 0 },
          { day: "Thu", value: 0 },
          { day: "Fri", value: 0 },
          { day: "Sat", value: 0 },
          { day: "Sun", value: 0 },
        ],
        insight: result.dataAvailability 
          ? (result.insight || "Track your meals consistently to get personalized heart health insights.")
          : "No data available for this time period. Start logging meals to see insights.",
        todayMeals: result.todayMeals || [],
      };
      
      setWeeklySummary(weeklySummary);
    } catch (error) {
      console.error("Error loading weekly summary data:", error);
      // Fall back to default data if API fails
      setWeeklySummary(getFallbackWeeklySummary());
    }
  };

  // Save meals to storage
  const saveMealsToStorage = async (meals: Meal[]) => {
    try {
      await storage.setItem("meals", JSON.stringify(meals));
      console.log("Saved meals to storage:", meals.length, "meals");
    } catch (error) {
      console.error("Error saving meals to storage:", error);
    }
  };

  // Save user profile to storage
  const saveUserProfileToStorage = async (profile: UserProfile) => {
    try {
      await storage.setItem("userProfile", JSON.stringify(profile));
      console.log("Saved user profile to storage:", profile);
    } catch (error) {
      console.error("Error saving user profile to storage:", error);
    }
  };

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const token = await storage.getItem("authToken");
      const userData = await storage.getItem("user");
      const userProfileData = await storage.getItem("userProfile");
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        
        if (userProfileData) {
          setUserProfile(JSON.parse(userProfileData));
        }
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  };

  // Handle Google Auth Success
  const handleGoogleAuthSuccess = async (idToken: string) => {
    try {
      const response = await mockGoogleAuth(idToken);
      
      // Save to storage
      await storage.setItem("authToken", response.token);
      await storage.setItem("user", JSON.stringify(response.profile));
      await storage.setItem("userProfile", JSON.stringify(response.userProfile));
      
      setUser(response.profile);
      setUserProfile(response.userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Google auth error:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await mockAuthLogin(email, password);
      
      // Save to storage
      await storage.setItem("authToken", response.token);
      await storage.setItem("user", JSON.stringify(response.profile));
      await storage.setItem("userProfile", JSON.stringify(response.userProfile));
      
      setUser(response.profile);
      setUserProfile(response.userProfile);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Google Login function
  const loginWithGoogle = async () => {
    if (Platform.OS === 'web') {
      // For web, show a message that Google login is not available
      throw new Error('Google login is not available on web. Please use email/password login.');
    }

    try {
      const result = await promptAsync!();
      if (result.type === 'cancel') {
        throw new Error('CANCELLED');
      }
      // The actual auth handling is done in the useEffect above
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await mockAuthRegister(name, email, password);
      
      // Save to storage
      await storage.setItem("authToken", response.token);
      await storage.setItem("user", JSON.stringify(response.profile));
      await storage.setItem("userProfile", JSON.stringify(response.userProfile));
      
      setUser(response.profile);
      setUserProfile(response.userProfile);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Complete profile setup
  const completeProfileSetup = async (profileData: Profile) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save profile data
    await storage.setItem("profile", JSON.stringify(profileData));
    
    return true;
  };

  // Update profile function
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      // Update user name if provided
      if (profileData.name && user) {
        const updatedUser = { ...user, name: profileData.name };
        setUser(updatedUser);
        await storage.setItem("user", JSON.stringify(updatedUser));
      }

      // Update user profile
      const updatedProfile: UserProfile = {
        ...userProfile,
        ...profileData,
      };
      
      setUserProfile(updatedProfile);
      await saveUserProfileToStorage(updatedProfile);
      
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    // Clear storage
    await storage.removeItem("authToken");
    await storage.removeItem("user");
    await storage.removeItem("profile");
    await storage.removeItem("userProfile");
    
    setUser(null);
    setUserProfile(null);
    setIsAuthenticated(false);
    return true;
  };

  // Show food info popup
  const showFoodInfoPopup = (meal: Meal) => {
    setFoodInfoPopup({ visible: true, meal });
  };

  // Hide food info popup
  const hideFoodInfoPopup = () => {
    setFoodInfoPopup({ visible: false, meal: null });
  };

  // Log meal function - now uploads images to Cloudinary first
  const logMeal = async (mealData: any): Promise<{ success: boolean; meal?: Meal; error?: string }> => {
    console.log("logMeal called with:", mealData);
    
    if (isOffline) {
      console.log("App is offline, storing meal locally");
      // Store in pending meals
      const pendingMeal: Meal = {
        id: `pending-${Date.now()}`,
        description: mealData.description,
        mealType: mealData.mealType,
        servings: mealData.servings,
        calories: 0,
        saturatedFat: 0,
        cholesterol: 0,
        fiber: 0,
        protein: 0,
        imageUrl: mealData.image,
        timestamp: new Date().toISOString(),
        status: "queued" as const,
      };
      
      setPendingMeals([...pendingMeals, pendingMeal]);
      
      // Add to all meals
      const updatedMeals = [pendingMeal, ...allMeals];
      setAllMeals(updatedMeals);
      await saveMealsToStorage(updatedMeals);
      
      return { success: true, meal: pendingMeal };
    } else {
      try {
        console.log("App is online, calling webhook API with Cloudinary");
        // Use real API call with Cloudinary image upload
        const result = await logMealAPI(mealData);
        console.log("Webhook API returned:", result);
        
        if (!result.foodIdentified) {
          // Food was not identified, return error
          return {
            success: false,
            error: "We had trouble identifying your food. Please try again with a clearer image or add a description."
          };
        }
        
        // Add to all meals - this will trigger the useEffect to update todayMeals
        const updatedMeals = [result.meal, ...allMeals];
        console.log("Adding meal to allMeals. New meal:", result.meal);
        console.log("Updated meals count:", updatedMeals.length);
        
        setAllMeals(updatedMeals);
        await saveMealsToStorage(updatedMeals);
        
        // Reload summary data from API after adding meal
        await loadSummaryData();
        
        // Show food info popup immediately
        showFoodInfoPopup(result.meal);
        
        return { success: true, meal: result.meal };
      } catch (error) {
        console.error("Error logging meal:", error);
        return {
          success: false,
          error: "Failed to log meal. Please check your connection and try again."
        };
      }
    }
  };

  // Send chat message - Updated to use real webhook with better error handling
  const sendChatMessage = async (message: string) => {
    if (isOffline) {
      // Return a placeholder response for offline mode
      return {
        text: "You're currently offline. Your message will be sent when you're back online.",
      };
    } else {
      try {
        return await sendChatMessageAPI(message);
      } catch (error) {
        console.error("Error sending chat message:", error);
        // Return fallback response on error
        return {
          text: "I'm having trouble responding right now. Please check your connection and try again later.",
        };
      }
    }
  };

  // Load summary data - Updated to use webhook
  const loadSummaryData = async (dayOffset: number = 0) => {
    if (isOffline) {
      console.log("App is offline, using local calculation for summary");
      const localSummary = calculateLocalSummary(todayMeals);
      setSummary(localSummary);
      return;
    }

    try {
      console.log("Loading summary data from webhook...");
      const summaryData = await loadDailySummaryAPI(dayOffset);
      setSummary(summaryData);
      console.log("Summary data loaded from webhook:", summaryData);
    } catch (error) {
      console.error("Error loading summary data from webhook:", error);
      // Fall back to local calculation if webhook fails
      console.log("Falling back to local calculation");
      const localSummary = calculateLocalSummary(todayMeals);
      setSummary({ ...localSummary, stale: true });
    }
  };

  return {
    isOffline,
    isLoading,
    isAuthenticated,
    user,
    userProfile,
    summary,
    weeklySummary,
    pendingMeals,
    todayMeals,
    hasMeals,
    foodInfoPopup,
    checkAuthStatus,
    login,
    loginWithGoogle,
    register,
    completeProfileSetup,
    updateProfile,
    logout,
    logMeal,
    sendChatMessage,
    showFoodInfoPopup,
    hideFoodInfoPopup,
    loadSummaryData,
    loadWeeklySummaryData,
  };
});

// Export the hook with proper typing
export const useAppState = () => useAppStateInternal();

export { AppStateProvider };