import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Clock, AlertTriangle, CheckCircle, Copy } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";
  
  const handleCopyMessage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Copy functionality would go here
    console.log("Copy message:", message.text);
  };
  
  const renderStatusIcon = () => {
    if (message.status === "sending") {
      return <Clock size={12} color="#9E9E9E" />;
    } else if (message.status === "failed") {
      return <AlertTriangle size={12} color="#F44336" />;
    } else if (message.status === "queued") {
      return <Clock size={12} color="#FF9800" />;
    } else if (message.status === "sent" && isUser) {
      return <CheckCircle size={12} color="#4CAF50" />;
    }
    return null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <Pressable
        style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}
        onLongPress={handleCopyMessage}
        delayLongPress={500}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>
        
        {!isUser && (
          <Pressable style={styles.copyButton} onPress={handleCopyMessage}>
            <Copy size={14} color="#9E9E9E" />
          </Pressable>
        )}
      </Pressable>
      
      <View style={[styles.footer, isUser ? styles.userFooter : styles.assistantFooter]}>
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        <View style={styles.statusContainer}>
          {renderStatusIcon()}
          {message.status === "queued" && (
            <Text style={styles.queuedText}>Queued</Text>
          )}
          {message.status === "failed" && (
            <Text style={styles.failedText}>Failed</Text>
          )}
          {message.status === "sending" && (
            <Text style={styles.sendingText}>Sending</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: "85%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    backgroundColor: "#2196F3",
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#212121",
  },
  copyButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
  },
  userFooter: {
    justifyContent: "flex-end",
  },
  assistantFooter: {
    justifyContent: "flex-start",
  },
  timestamp: {
    fontSize: 11,
    color: "#9E9E9E",
    marginRight: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  queuedText: {
    fontSize: 10,
    color: "#FF9800",
    marginLeft: 4,
  },
  failedText: {
    fontSize: 10,
    color: "#F44336",
    marginLeft: 4,
  },
  sendingText: {
    fontSize: 10,
    color: "#9E9E9E",
    marginLeft: 4,
  },
});