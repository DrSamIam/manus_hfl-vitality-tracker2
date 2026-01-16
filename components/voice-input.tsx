import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { Audio } from "expo-av";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

type VoiceInputProps = {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
};

export function VoiceInput({ onTranscription, onError, disabled }: VoiceInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  
  // Animation for recording indicator
  const pulseScale = useSharedValue(1);
  
  const uploadMutation = trpc.storage.upload.useMutation();
  const transcribeMutation = trpc.voice.transcribe.useMutation();
  
  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withTiming(1.2, { duration: 800 }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);
  
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  
  const startRecording = useCallback(async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant microphone access to use voice input."
        );
        return;
      }
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      onError?.("Failed to start recording");
    }
  }, [onError]);
  
  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      if (!uri) {
        throw new Error("No recording URI");
      }
      
      // Read the file and upload
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data URL prefix
          const base64Data = base64.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;
      
      // Upload to storage
      const uploadResult = await uploadMutation.mutateAsync({
        filename: `voice_${Date.now()}.m4a`,
        contentType: "audio/m4a",
        data: base64Data,
      });
      
      // Transcribe
      const transcriptionResult = await transcribeMutation.mutateAsync({
        audioUrl: uploadResult.url,
        language: "en",
      });
      
      if (transcriptionResult.text) {
        onTranscription(transcriptionResult.text);
      }
    } catch (error: any) {
      console.error("Transcription error:", error);
      onError?.(error.message || "Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    }
  }, [onTranscription, onError, uploadMutation, transcribeMutation]);
  
  const handlePress = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);
  
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isProcessing}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isRecording ? "#FF3B30" : colors.surface,
          opacity: disabled || isProcessing ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {isProcessing ? (
        <ThemedText style={styles.icon}>⏳</ThemedText>
      ) : (
        <Animated.View style={isRecording ? pulseStyle : undefined}>
          <ThemedText style={[styles.icon, isRecording && { color: "#FFFFFF" }]}>
            {isRecording ? "⏹️" : "🎤"}
          </ThemedText>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
  },
});
