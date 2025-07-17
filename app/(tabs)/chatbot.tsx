import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Stack } from "expo-router";
import { Send, Heart, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { ChatMessage } from "@/components/ChatMessage";
import { useAppState } from "@/context/AppStateContext";
import { Message } from "@/types";

export default function ChatbotScreen() {
  const { isOffline, sendChatMessage } = useAppState();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your heart health coach. I can help you make cholesterol-friendly food choices and answer questions about managing your cardiovascular health. How can I help you today?",
      sender: "assistant",
      timestamp: new Date().toISOString(),
      status: "sent",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Pulse animation for typing indicator
  useEffect(() => {
    if (isTyping) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date().toISOString(),
      status: isOffline ? "queued" : "sending",
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(message);
      
      // Stop typing indicator
      setIsTyping(false);
      
      if (isOffline) {
        // If offline, mark as queued
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id ? { ...msg, status: "queued" as const } : msg
          )
        );
      } else {
        // If online, add assistant response
        setMessages(prev => [
          ...prev.map(msg => 
            msg.id === userMessage.id ? { ...msg, status: "sent" as const } : msg
          ),
          {
            id: `response-${Date.now()}`,
            text: response.text || "I'm having trouble responding right now. Please try again later.",
            sender: "assistant" as const,
            timestamp: new Date().toISOString(),
            status: "sent" as const,
          }
        ]);
      }
    } catch (error) {
      setIsTyping(false);
      // Handle error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: "failed" as const } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Animated.View style={[styles.typingDot, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.typingDot, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.typingDot, { opacity: pulseAnim }]} />
        </View>
        <Text style={styles.typingText}>Coach is typing...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.coachIcon}>
        <Heart size={32} color="#2196F3" />
        <Sparkles size={20} color="#4CAF50" style={styles.sparkleIcon} />
      </View>
      <Text style={styles.emptyTitle}>Your Heart Health Coach</Text>
      <Text style={styles.emptySubtitle}>
        Ask me about cholesterol-friendly foods, heart-healthy recipes, or nutrition advice!
      </Text>
      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>Try asking:</Text>
        <Text style={styles.suggestionText}>• "What foods help lower cholesterol?"</Text>
        <Text style={styles.suggestionText}>• "Is salmon good for heart health?"</Text>
        <Text style={styles.suggestionText}>• "How much fiber should I eat daily?"</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen 
        options={{ 
          title: "Heart Health Coach",
          headerStyle: {
            backgroundColor: "#2196F3",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }} 
      />

      {messages.length <= 1 ? (
        renderEmptyState()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator}
        />
      )}

      <View style={styles.inputContainer}>
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>You're offline - messages will be sent when reconnected</Text>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, isLoading && styles.inputDisabled]}
            value={message}
            onChangeText={setMessage}
            placeholder="Ask about heart-healthy foods..."
            placeholderTextColor="#9E9E9E"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              { 
                opacity: pressed || !message.trim() || isLoading ? 0.7 : 1,
                backgroundColor: message.trim() && !isLoading ? "#2196F3" : "#BDBDBD"
              },
            ]}
            onPress={handleSend}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
        
        <Text style={styles.characterCount}>
          {message.length}/500
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  coachIcon: {
    position: "relative",
    marginBottom: 24,
  },
  sparkleIcon: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: "#424242",
    marginBottom: 8,
    lineHeight: 20,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#BDBDBD",
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 12,
    color: "#9E9E9E",
    fontStyle: "italic",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  offlineIndicator: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  offlineText: {
    fontSize: 12,
    color: "#FF9800",
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputDisabled: {
    opacity: 0.7,
  },
  sendButton: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  characterCount: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "right",
    marginTop: 4,
  },
});