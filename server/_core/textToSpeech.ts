/**
 * Text-to-Speech helper using internal TTS service (OpenAI-compatible)
 *
 * Frontend implementation guide:
 * 1. Call the TTS mutation with text to convert
 * 2. Receive audio URL from storage
 * 3. Play audio using expo-av Audio.Sound
 *
 * Example usage:
 * ```tsx
 * const ttsMutation = trpc.voice.textToSpeech.useMutation({
 *   onSuccess: async (data) => {
 *     const { sound } = await Audio.Sound.createAsync({ uri: data.audioUrl });
 *     await sound.playAsync();
 *   }
 * });
 *
 * ttsMutation.mutate({
 *   text: "Hello, I'm Dr. Sam, your health assistant.",
 *   voice: "nova" // Optional: alloy, echo, fable, onyx, nova, shimmer
 * });
 * ```
 */
import { ENV } from "./env";

export type TTSVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export type TTSOptions = {
  text: string;
  voice?: TTSVoice;
  speed?: number; // 0.25 to 4.0, default 1.0
};

export type TTSResponse = {
  audioUrl: string;
  duration?: number;
};

export type TTSError = {
  error: string;
  code: "TEXT_TOO_LONG" | "INVALID_VOICE" | "SERVICE_ERROR" | "UPLOAD_FAILED";
  details?: string;
};

// Maximum text length (4096 characters for OpenAI TTS)
const MAX_TEXT_LENGTH = 4096;

/**
 * Convert text to speech using the internal TTS service
 *
 * @param options - Text and voice configuration
 * @returns Audio URL or error
 */
export async function textToSpeech(
  options: TTSOptions
): Promise<TTSResponse | TTSError> {
  try {
    // Validate environment
    if (!ENV.forgeApiUrl) {
      return {
        error: "Text-to-speech service is not configured",
        code: "SERVICE_ERROR",
        details: "BUILT_IN_FORGE_API_URL is not set",
      };
    }
    if (!ENV.forgeApiKey) {
      return {
        error: "Text-to-speech service authentication is missing",
        code: "SERVICE_ERROR",
        details: "BUILT_IN_FORGE_API_KEY is not set",
      };
    }

    // Validate text length
    if (options.text.length > MAX_TEXT_LENGTH) {
      return {
        error: "Text exceeds maximum length",
        code: "TEXT_TOO_LONG",
        details: `Text is ${options.text.length} characters, maximum is ${MAX_TEXT_LENGTH}`,
      };
    }

    // Validate voice
    const validVoices: TTSVoice[] = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const voice = options.voice || "nova"; // Default to nova (friendly, warm voice)
    if (!validVoices.includes(voice)) {
      return {
        error: "Invalid voice selection",
        code: "INVALID_VOICE",
        details: `Voice must be one of: ${validVoices.join(", ")}`,
      };
    }

    // Build API URL
    const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
    const fullUrl = new URL("v1/audio/speech", baseUrl).toString();

    // Call TTS API
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: options.text,
        voice: voice,
        response_format: "mp3",
        speed: options.speed || 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        error: "Text-to-speech service request failed",
        code: "SERVICE_ERROR",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`,
      };
    }

    // Get audio data as buffer
    const audioBuffer = await response.arrayBuffer();

    // Upload to storage and get URL
    // For now, return as base64 data URL (can be improved with S3 upload)
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    return {
      audioUrl,
    };
  } catch (error) {
    return {
      error: "Text-to-speech failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Split long text into chunks for TTS processing
 * Useful for texts longer than MAX_TEXT_LENGTH
 */
export function splitTextForTTS(text: string): string[] {
  if (text.length <= MAX_TEXT_LENGTH) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > MAX_TEXT_LENGTH) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If single sentence is too long, split by words
      if (sentence.length > MAX_TEXT_LENGTH) {
        const words = sentence.split(/\s+/);
        currentChunk = "";
        for (const word of words) {
          if ((currentChunk + " " + word).length > MAX_TEXT_LENGTH) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk += " " + word;
          }
        }
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += " " + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
