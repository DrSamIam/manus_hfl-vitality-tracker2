import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated, user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: symptoms } = trpc.symptoms.list.useQuery({ limit: 7 }, { enabled: isAuthenticated });
  const { data: biomarkers } = trpc.biomarkers.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: supplements } = trpc.supplements.list.useQuery({}, { enabled: isAuthenticated });

  const chatMutation = trpc.chat.send.useMutation();

  // Get user's first name for personalized greeting
  const firstName = user?.name?.split(" ")[0] || "there";

  // Generate initial greeting
  useEffect(() => {
    if (messages.length === 0 && isAuthenticated) {
      const greeting = generateGreeting();
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: greeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isAuthenticated, firstName]);

  const generateGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Hello";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 17) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";

    let contextInfo = "";
    if (symptoms && symptoms.length > 0) {
      const latestSymptom = symptoms[0];
      const avgEnergy = symptoms.reduce((sum, s) => sum + (s.energy || 0), 0) / symptoms.length;
      contextInfo = ` I see you've been tracking your symptoms. Your average energy level this week is ${avgEnergy.toFixed(1)}/10.`;
    }

    if (biomarkers && biomarkers.length > 0) {
      contextInfo += ` You have ${biomarkers.length} biomarker result${biomarkers.length > 1 ? "s" : ""} on file.`;
    }

    if (supplements && supplements.length > 0) {
      const activeSupps = supplements.filter((s) => s.active);
      if (activeSupps.length > 0) {
        contextInfo += ` You're currently taking ${activeSupps.length} supplement${activeSupps.length > 1 ? "s" : ""}.`;
      }
    }

    return `${timeGreeting}, ${firstName}! 👋

I'm Dr. Sam, your personal health AI assistant. I'm here to help you understand your health data, answer questions about hormones and vitality, and provide personalized insights based on your tracked information.${contextInfo}

How can I help you today?`;
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await chatMutation.mutateAsync({
        message: inputText.trim(),
        conversationHistory: messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an issue processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [inputText, isLoading, messages, chatMutation]);

  // Format conversation for sharing/copying
  const formatConversation = useCallback(() => {
    return messages
      .map((m) => {
        const role = m.role === "user" ? "You" : "Dr. Sam";
        return `${role}: ${m.content}`;
      })
      .join("\n\n");
  }, [messages]);

  // Copy conversation to clipboard
  const handleCopyConversation = useCallback(async () => {
    try {
      const text = formatConversation();
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied!", "Conversation copied to clipboard");
    } catch (error) {
      console.error("Copy error:", error);
      Alert.alert("Error", "Failed to copy conversation");
    }
  }, [formatConversation]);

  // Share conversation
  const handleShareConversation = useCallback(async () => {
    try {
      const text = formatConversation();
      await Share.share({
        message: `My conversation with Dr. Sam AI:\n\n${text}`,
        title: "Dr. Sam AI Conversation",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  }, [formatConversation]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.tint }]
              : [styles.assistantBubble, { backgroundColor: colors.surface }],
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : { color: colors.text },
            ]}
          >
            {item.content}
          </ThemedText>
        </View>
        <ThemedText style={[styles.timestamp, { color: colors.textSecondary }]}>
          {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </ThemedText>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={{ fontSize: 48, marginBottom: 16 }}>🩺</ThemedText>
        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
          Dr. Sam AI
        </ThemedText>
        <ThemedText style={{ color: colors.textSecondary, textAlign: "center" }}>
          Please log in to chat with Dr. Sam
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 20),
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.avatarText}>🩺</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">Dr. Sam AI</ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Your Personal Health Assistant
              </ThemedText>
            </View>
            {messages.length > 1 && (
              <View style={styles.headerActions}>
                <Pressable
                  onPress={handleCopyConversation}
                  style={({ pressed }) => [
                    styles.headerButton,
                    { backgroundColor: colors.surface },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <ThemedText style={{ fontSize: 16 }}>📋</ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleShareConversation}
                  style={({ pressed }) => [
                    styles.headerButton,
                    { backgroundColor: colors.surface },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <ThemedText style={{ fontSize: 16 }}>↗️</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: 20 },
          ]}
          style={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="small" color={colors.tint} />
            <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
              Dr. Sam is thinking...
            </ThemedText>
          </View>
        )}

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Ask Dr. Sam anything..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: inputText.trim() && !isLoading ? colors.tint : colors.surface,
              },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText
              style={[
                styles.sendButtonText,
                { color: inputText.trim() && !isLoading ? "#FFFFFF" : colors.textSecondary },
              ]}
            >
              ↑
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center", padding: 20 },
  keyboardAvoid: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 24 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16 },
  messageContainer: { marginBottom: 16 },
  userMessageContainer: { alignItems: "flex-end" },
  assistantMessageContainer: { alignItems: "flex-start" },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: { color: "#FFFFFF" },
  timestamp: { fontSize: 11, marginTop: 4, marginHorizontal: 4 },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  loadingText: { fontSize: 14 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingTop: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: { fontSize: 20, fontWeight: "600" },
  buttonPressed: { opacity: 0.8 },
});
