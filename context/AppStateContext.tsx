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

// Production API Webhook URLs - Updated chat webhook to production
const FOOD_INTAKE_WEBHOOK = "https://foothaven.app.n8n.cloud/webhook/4f5c25b0-30cf-408c-83f9-a37266cc6788";
const SUMMARY_WEBHOOK = "https://foothaven.app.n8n.cloud/webhook/0cf5a4d3-fe19-41be-9b5a-98e343742fd5";
const CHAT_WEBHOOK = "https://foothaven.app.n8n.cloud/webhook/6f23d85e-3d50-4593-8521-3b561bc42b75";
const LOGIN_WEBHOOK = "https://your-api.com/auth/login"; // Replace with your login webhook
const REGISTER_WEBHOOK = "https://your-api.com/auth/register"; // Replace with your register webhook
const GOOGLE_AUTH_WEBHOOK = "https://your-api.com/auth/google"; // Replace with your Google auth webhook

// Cloudinary configuration - FIXED
const CLOUDINARY_CLOUD_NAME = "djxhholpn";
const CLOUDINARY_API_KEY = "362157199181595";
const CLOUDINARY_API_SECRET = "eXUX0EsbhN9zIfchtZQixi2mcAk";

// Google OAuth configuration - Fixed type handling
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";

// Pre-created users database - Updated with Rahul Mahatha (height converted to cm)
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
    userProfile: { age: 24, weight: 65, height: 174, gender: "Male" } // 5.7 feet = 174 cm
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

// Helper function to get week start and end dates (Sunday to Saturday)
const getWeekDates = (weekOffset: number = 0): { startDate: string; endDate: string } => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the Sunday of the target week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek + (weekOffset * 7));
  sunday.setHours(0, 0, 0, 0);
  
  // Calculate the Saturday of the target week
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);
  
  return {
    startDate: sunday.toISOString(),
    endDate: saturday.toISOString()
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
    const timeoutId = setTimeout(() => {
      console.log("Cloudinary upload timed out after 60 seconds");
      if (!controller.signal.aborted) {
        controller.abort();
      }
    }, 60000); // 60 second timeout
    
    let uploadResponse;
    try {
      uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && (fetchError.name === 'AbortError' || fetchError.message.includes('aborted'))) {
        console.log("Cloudinary upload was aborted:", fetchError.message);
        throw new Error('Image upload timed out after 60 seconds. Please try again.');
      }
      throw fetchError;
    }
    
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
  const timeoutId = setTimeout(() => {
    console.log("Cloudinary unsigned upload timed out after 60 seconds");
    if (!controller.signal.aborted) {
      controller.abort();
    }
  }, 60000); // 60 second timeout
  
  let uploadResponse;
  try {
    uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }
    );
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError instanceof Error && (fetchError.name === 'AbortError' || fetchError.message.includes('aborted'))) {
      console.log("Cloudinary unsigned upload was aborted:", fetchError.message);
      throw new Error('Image upload timed out after 60 seconds. Please try again.');
    }
    throw fetchError;
  }
  
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

    // Add timeout to prevent hanging - increased to 60 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Food intake webhook request timed out after 60 seconds");
      if (!controller.signal.aborted) {
        controller.abort();
      }
    }, 60000); // 60 second timeout

    let response;
    try {
      response = await fetch(FOOD_INTAKE_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && (fetchError.name === 'AbortError' || fetchError.message.includes('aborted'))) {
        console.log("Food intake request was aborted:", fetchError.message);
        throw new Error('Request timed out after 60 seconds. Please try again.');
      }
      throw fetchError;
    }

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
      imageUrl: imageUrl || undefined, // Use the Cloudinary image URL
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

// Real API function for chat - SIMPLIFIED and FIXED to properly handle the webhook response format
const sendChatMessageAPI = async (message: string): Promise<{ text: string }> => {
  try {
    const token = await storage.getItem("authToken");
    
    const requestPayload = {
      message: message,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending chat message to webhook:", CHAT_WEBHOOK);
    console.log("Request payload:", requestPayload);

    // Add timeout to prevent hanging - 60 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Chat webhook request timed out after 60 seconds");
      if (!controller.signal.aborted) {
        controller.abort();
      }
    }, 60000); // 60 second timeout

    let response;
    try {
      response = await fetch(CHAT_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && (fetchError.name === 'AbortError' || fetchError.message.includes('aborted'))) {
        console.log("Chat request was aborted:", fetchError.message);
        throw new Error('Request timed out after 60 seconds. Please try again.');
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);
    console.log("Chat response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chat webhook error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Chat webhook response:", responseData);
    
    // Handle the specific format: { "output": { "reply": "..." } }
    if (responseData && responseData.output && responseData.output.reply) {
      const replyText = responseData.output.reply;
      console.log("Successfully extracted reply:", replyText);
      return { text: replyText };
    }
    
    // Fallback: if the response doesn't match expected format
    console.error("Unexpected response format:", responseData);
    return {
      text: "I'm here to help with your heart health and nutrition questions. What would you like to know about managing cholesterol or healthy eating?"
    };
    
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

// Fallback weekly summary data (Sunday to Saturday)
const getFallbackWeeklySummary = (): WeeklySummary => ({
  dailyCholesterol: [
    { day: "Sun", value: 0 },
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
  ],
  insight: "No data available for this time period. Start logging meals to see insights about your cholesterol intake and heart health.",
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
      { day: "Sun", value: 0 },
      { day: "Mon", value: 0 },
      { day: "Tue", value: 0 },
      { day: "Wed", value: 0 },
      { day: "Thu", value: 0 },
      { day: "Fri", value: 0 },
      { day: "Sat", value: 0 },
    ],
    insight: "Track your meals consistently to get personalized heart health insights.",
    todayMeals: [],
  });
  // NEW: Cache for past 6 weeks of data
  const [cachedWeeklyData, setCachedWeeklyData] = useState<Map<number, WeeklySummary>>(new Map());
  // Request management to prevent duplicate requests
  const [activeRequests, setActiveRequests] = useState<Map<number, Promise<WeeklySummary | null>>>(new Map());
  // AbortController management for request cancellation
  const [activeControllers, setActiveControllers] = useState<Map<number, AbortController>>(new Map());
  // Rate limiting for requests
  const [lastRequestTime, setLastRequestTime] = useState<Map<number, number>>(new Map());
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

  // Cleanup function to cancel all active requests
  const cancelAllActiveRequests = () => {
    console.log("Cancelling all active requests");
    activeControllers.forEach((controller, weekOffset) => {
      try {
        console.log(`Cancelling request for week ${weekOffset}`);
        if (!controller.signal.aborted) {
          controller.abort();
        }
      } catch (error) {
        console.log(`Error cancelling request for week ${weekOffset}:`, error);
      }
    });
    setActiveControllers(new Map());
    setActiveRequests(new Map());
  };

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = isOffline;
      const isNowOffline = !state.isConnected;
      
      setIsOffline(isNowOffline);
      
      // Cancel all active requests when going offline
      if (!wasOffline && isNowOffline) {
        console.log("Going offline, cancelling active requests");
        cancelAllActiveRequests();
      }
    });

    return unsubscribe;
  }, [isOffline]);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await checkAuthStatus();
        await loadStoredMeals();
        await loadUserProfile();
        // Load current week data first
        await loadWeeklySummaryData(0);
        // Load past 6 weeks of data as backup (in background, don't wait)
        preloadPastWeeksData().catch(error => {
          console.error("Background preload failed:", error);
        });
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    
    // Cleanup function for component unmount
    return () => {
      console.log("AppStateContext unmounting, cancelling all active requests");
      cancelAllActiveRequests();
    };
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
      console.log("New day started - clearing today's meals");
      setTodayMeals([]);
      // Refresh current week data since today's value is dynamic (new day)
      loadWeeklySummaryData(0);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeout);
      // Cancel all active requests on unmount
      cancelAllActiveRequests();
    };
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

  // Update summary whenever todayMeals changes
  useEffect(() => {
    console.log("Today's meals changed, updating local summary");
    const localSummary = calculateLocalSummary(todayMeals);
    setSummary(localSummary);
  }, [todayMeals]);

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

  // NEW: Preload past 6 weeks of data as backup with better error handling
  const preloadPastWeeksData = async () => {
    if (isOffline) {
      console.log("App is offline, skipping preload of past weeks data");
      return;
    }

    try {
      console.log("Preloading past 6 weeks of data...");
      const weeklyDataMap = new Map<number, WeeklySummary>();
      
      // Load past 6 weeks (weekOffset -1 to -6) sequentially to avoid overwhelming the API
      for (let weekOffset = -1; weekOffset >= -6; weekOffset--) {
        try {
          console.log(`Loading data for week ${weekOffset}...`);
          const data = await loadWeeklyDataFromAPI(weekOffset);
          if (data) {
            weeklyDataMap.set(weekOffset, data);
            console.log(`Successfully cached data for week ${weekOffset}`);
          } else {
            console.log(`No data available for week ${weekOffset}, using fallback`);
            weeklyDataMap.set(weekOffset, getFallbackWeeklySummary());
          }
          
          // Add small delay between requests to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to load data for week ${weekOffset}:`, error);
          // Set fallback data for failed weeks
          weeklyDataMap.set(weekOffset, getFallbackWeeklySummary());
        }
      }
      
      setCachedWeeklyData(weeklyDataMap);
      console.log("Preloaded data for", weeklyDataMap.size, "past weeks");
      
    } catch (error) {
      console.error("Error preloading past weeks data:", error);
    }
  };

  // NEW: Load weekly data from API with retry logic (2 attempts) and request deduplication
  const loadWeeklyDataFromAPI = async (weekOffset: number, retryCount: number = 0): Promise<WeeklySummary | null> => {
    // Check if there's already an active request for this week
    const existingRequest = activeRequests.get(weekOffset);
    if (existingRequest) {
      console.log(`Reusing existing request for week ${weekOffset}`);
      try {
        return await existingRequest;
      } catch (error) {
        // If the existing request failed, continue with a new request
        console.log(`Existing request for week ${weekOffset} failed, creating new request`);
        setActiveRequests(prev => {
          const newMap = new Map(prev);
          newMap.delete(weekOffset);
          return newMap;
        });
      }
    }

    // Rate limiting: prevent requests for the same week within 1 second
    const now = Date.now();
    const lastRequest = lastRequestTime.get(weekOffset);
    if (lastRequest && (now - lastRequest) < 1000) {
      console.log(`Rate limiting: skipping request for week ${weekOffset} (too soon)`);
      return null;
    }
    setLastRequestTime(prev => new Map(prev).set(weekOffset, now));

    // Create new request with retry logic
    const requestPromise = (async (): Promise<WeeklySummary | null> => {
      const maxRetries = 2;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`Retry attempt ${attempt} for week ${weekOffset}`);
            // Add exponential backoff delay for retries
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }

          const { startDate, endDate } = getWeekDates(weekOffset);
          
          const requestPayload = {
            startDate,
            endDate,
            type: "weekly"
          };

          console.log(`Fetching weekly summary for week ${weekOffset} from webhook (attempt ${attempt + 1}):`, SUMMARY_WEBHOOK);
          console.log(`Request payload:`, requestPayload);

          // Cancel any existing request for this week
          const existingController = activeControllers.get(weekOffset);
          if (existingController) {
            existingController.abort();
          }

          const controller = new AbortController();
          setActiveControllers(prev => new Map(prev).set(weekOffset, controller));
          const timeoutId = setTimeout(() => {
            console.log(`Weekly summary request for week ${weekOffset} timed out after 60 seconds`);
            if (!controller.signal.aborted) {
              controller.abort();
            }
          }, 60000); // Increased to 60 seconds

          let response;
          try {
            response = await fetch(SUMMARY_WEBHOOK, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestPayload),
              signal: controller.signal,
            });
          } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && (fetchError.name === 'AbortError' || fetchError.message.includes('aborted'))) {
              console.log(`Weekly summary request for week ${weekOffset} was cancelled or timed out:`, fetchError.message);
              return null;
            }
            throw fetchError;
          }

          clearTimeout(timeoutId);
          console.log(`Weekly summary response status (attempt ${attempt + 1}):`, response.status);

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error(`No data found for the requested week`);
            } else if (response.status >= 500) {
              throw new Error(`Server error: ${response.status}`);
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }

          // Get response text first to handle malformed JSON
          const responseText = await response.text();
          console.log(`Weekly summary webhook response (attempt ${attempt + 1}):`, responseText);

          if (!responseText.trim()) {
            throw new Error('Empty response from webhook');
          }

          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
          }
          
          // Handle the response format
          let result;
          if (Array.isArray(responseData) && responseData.length > 0) {
            console.log(`Response is array, using first element:`, responseData[0]);
            const firstElement = responseData[0];
            if (firstElement && firstElement.output) {
              result = firstElement.output;
              console.log(`Extracted weekly data from array output wrapper:`, result);
            } else {
              result = firstElement;
            }
          } else if (responseData && responseData.output) {
            result = responseData.output;
          } else {
            result = responseData;
          }
          
          const weeklySummary: WeeklySummary = {
            dailyCholesterol: result.dailyCholesterol || [
              { day: "Sun", value: 0 },
              { day: "Mon", value: 0 },
              { day: "Tue", value: 0 },
              { day: "Wed", value: 0 },
              { day: "Thu", value: 0 },
              { day: "Fri", value: 0 },
              { day: "Sat", value: 0 },
            ],
            insight: result.dataAvailability 
              ? (result.insight || "Track your meals consistently to get personalized heart health insights.")
              : "No data available for this time period. Start logging meals to see insights.",
            todayMeals: [], // Don't include todayMeals for past weeks
          };
          
          console.log(`Transformed weekly summary (attempt ${attempt + 1}):`, weeklySummary);
          
          // Cache the successful response
          setCachedWeeklyData(prev => new Map(prev).set(weekOffset, weeklySummary));
          
          return weeklySummary;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (lastError.name === 'AbortError' || lastError.message.includes('Aborted') || lastError.message.includes('aborted')) {
            console.log(`Request for week ${weekOffset} was cancelled or aborted`);
            return null;
          }
          
          console.error(`Error loading weekly summary data for week ${weekOffset} (attempt ${attempt + 1}):`, lastError.message);
          
          // If this is the last attempt, don't retry
          if (attempt === maxRetries) {
            console.error(`All ${maxRetries + 1} attempts failed for week ${weekOffset}`);
            return null;
          }
        }
      }

      return null;
    })();

    // Store the request promise
    setActiveRequests(prev => new Map(prev).set(weekOffset, requestPromise));

    // Clean up after request completes
    requestPromise.finally(() => {
      setActiveRequests(prev => {
        const newMap = new Map(prev);
        newMap.delete(weekOffset);
        return newMap;
      });
      setActiveControllers(prev => {
        const newMap = new Map(prev);
        newMap.delete(weekOffset);
        return newMap;
      });
    });

    return requestPromise;
  };

  // Helper function to filter out future days from current week data
  const filterCurrentWeekData = (dailyCholesterol: { day: string; value: number }[]): { day: string; value: number }[] => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    return dailyCholesterol.map((item, index) => {
      // If this day hasn't occurred yet this week, set value to 0
      if (index > currentDayOfWeek) {
        return { ...item, value: 0 };
      }
      return item;
    });
  };

  // MODIFIED: Load weekly summary data - use cache for past weeks, API for current week with better error handling
  const loadWeeklySummaryData = async (weekOffset: number = 0) => {
    console.log(`Loading weekly summary for week offset: ${weekOffset}`);
    
    // For current week (weekOffset = 0), always load from API since today's value is dynamic
    if (weekOffset === 0) {
      if (isOffline) {
        console.log("App is offline, using fallback for current week");
        setWeeklySummary(getFallbackWeeklySummary());
        return;
      }

      try {
        const currentWeekData = await loadWeeklyDataFromAPI(weekOffset);
        if (currentWeekData) {
          // For current week, filter out future days and include today's meals
          const filteredData = filterCurrentWeekData(currentWeekData.dailyCholesterol);
          const summaryWithTodayMeals = {
            ...currentWeekData,
            dailyCholesterol: filteredData,
            todayMeals: todayMeals
          };
          setWeeklySummary(summaryWithTodayMeals);
          console.log("Loaded current week data from API with future days filtered");
        } else {
          console.log("No data returned for current week, using fallback");
          setWeeklySummary(getFallbackWeeklySummary());
        }
      } catch (error) {
        console.error("Error loading current week data:", error);
        setWeeklySummary(getFallbackWeeklySummary());
      }
    } else {
      // For past weeks, ONLY use cached data - don't make API calls
      const cachedData = cachedWeeklyData.get(weekOffset);
      if (cachedData) {
        setWeeklySummary(cachedData);
        console.log(`Using cached data for week ${weekOffset}`);
        return;
      }

      // If not in cache, use fallback (don't make API call for past weeks from History page)
      console.log(`No cached data for week ${weekOffset}, using fallback`);
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

  // Log meal function - now uploads images to Cloudinary first and updates dashboard immediately
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
        
        // Add to all meals - this will trigger the useEffect to update todayMeals and summary
        const updatedMeals = [result.meal, ...allMeals];
        console.log("Adding meal to allMeals. New meal:", result.meal);
        console.log("Updated meals count:", updatedMeals.length);
        
        setAllMeals(updatedMeals);
        await saveMealsToStorage(updatedMeals);
        
        // Show food info popup immediately - this provides instant feedback to user
        showFoodInfoPopup(result.meal);
        
        // Update weekly cholesterol data in the background (non-blocking)
        // This runs asynchronously so the user sees the popup immediately
        loadWeeklySummaryData(0).catch(error => {
          console.error("Background weekly data update failed:", error);
          // Don't show error to user since the meal was logged successfully
        });
        
        return { success: true, meal: result.meal };
      } catch (error) {
        console.error("Error logging meal:", error);
        
        // Provide more specific error messages
        let errorMessage = "Failed to log meal. Please check your connection and try again.";
        
        if (error instanceof Error) {
          if (error.message.includes('timed out')) {
            errorMessage = "Request timed out. Please try again with a better connection.";
          } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
            errorMessage = "Network error. Please check your internet connection and try again.";
          } else if (error.message.includes('AbortError') || error.message.includes('aborted')) {
            errorMessage = "Request was cancelled. Please try again.";
          }
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
    }
  };

  // Send chat message - SIMPLIFIED to use the fixed API function
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
        
        // Provide more specific error messages
        let errorMessage = "I'm having trouble responding right now. Please check your connection and try again later.";
        
        if (error instanceof Error) {
          if (error.message.includes('timed out')) {
            errorMessage = "My response timed out. Please try asking your question again.";
          } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
            errorMessage = "I can't connect right now. Please check your internet connection and try again.";
          } else if (error.message.includes('AbortError') || error.message.includes('aborted')) {
            errorMessage = "Your request was cancelled. Please try asking again.";
          }
        }
        
        return {
          text: errorMessage,
        };
      }
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
    loadWeeklySummaryData,
  };
});

// Export the hook with proper typing
export const useAppState = () => useAppStateInternal();

export { AppStateProvider };