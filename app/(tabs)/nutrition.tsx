import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

type FoodItem = {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type FoodAnalysis = {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  healthScore: number;
  suggestions: string[];
};

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export default function NutritionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<{ analysis: FoodAnalysis; imageUrl: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const utils = trpc.useUtils();
  
  // Queries
  const { data: dailySummary, isLoading: summaryLoading } = trpc.food.dailySummary.useQuery(
    { date: selectedDate },
    { enabled: !!selectedDate }
  );
  
  const { data: foodLogs, isLoading: logsLoading } = trpc.food.list.useQuery(
    { date: selectedDate },
    { enabled: !!selectedDate }
  );
  
  // Mutations
  const uploadMutation = trpc.storage.upload.useMutation();
  const analyzeMutation = trpc.food.analyze.useMutation();
  const createMutation = trpc.food.create.useMutation({
    onSuccess: () => {
      utils.food.list.invalidate();
      utils.food.dailySummary.invalidate();
    },
  });
  const deleteMutation = trpc.food.delete.useMutation({
    onSuccess: () => {
      utils.food.list.invalidate();
      utils.food.dailySummary.invalidate();
    },
  });
  
  const pickImage = useCallback(async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert("Permission Required", `Please grant ${useCamera ? "camera" : "photo library"} access.`);
        return;
      }
      
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          });
      
      if (result.canceled || !result.assets[0]) return;
      
      const asset = result.assets[0];
      setPreviewImage(asset.uri);
      setIsAnalyzing(true);
      
      try {
        // Upload image
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(",")[1]);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(blob);
        const base64Data = await base64Promise;
        
        const uploadResult = await uploadMutation.mutateAsync({
          filename: `food_${Date.now()}.jpg`,
          contentType: "image/jpeg",
          data: base64Data,
        });
        
        // Analyze food
        const analysis = await analyzeMutation.mutateAsync({
          imageUrl: uploadResult.url,
        });
        
        setPendingAnalysis({ analysis: analysis as FoodAnalysis, imageUrl: uploadResult.url });
        setShowMealPicker(true);
      } catch (error: any) {
        console.error("Food analysis error:", error);
        Alert.alert("Analysis Failed", error.message || "Failed to analyze food image");
        setPreviewImage(null);
      } finally {
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      setIsAnalyzing(false);
    }
  }, [uploadMutation, analyzeMutation]);
  
  const saveMeal = useCallback(async (mealType: MealType) => {
    if (!pendingAnalysis) return;
    
    try {
      await createMutation.mutateAsync({
        logDate: selectedDate,
        mealType,
        imageUrl: pendingAnalysis.imageUrl,
        totalCalories: pendingAnalysis.analysis.totalCalories,
        totalProtein: pendingAnalysis.analysis.totalProtein,
        totalCarbs: pendingAnalysis.analysis.totalCarbs,
        totalFat: pendingAnalysis.analysis.totalFat,
        healthScore: pendingAnalysis.analysis.healthScore,
        foods: pendingAnalysis.analysis.foods,
        suggestions: pendingAnalysis.analysis.suggestions,
      });
      
      setPendingAnalysis(null);
      setPreviewImage(null);
      setShowMealPicker(false);
      Alert.alert("Saved!", "Your meal has been logged.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save meal");
    }
  }, [pendingAnalysis, selectedDate, createMutation]);
  
  const deleteFoodLog = useCallback(async (id: number) => {
    Alert.alert("Delete Meal", "Are you sure you want to delete this meal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ id });
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete meal");
          }
        },
      },
    ]);
  }, [deleteMutation]);
  
  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return "#22C55E";
    if (score >= 6) return "#EAB308";
    if (score >= 4) return "#F97316";
    return "#EF4444";
  };
  
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast": return "🌅";
      case "lunch": return "☀️";
      case "dinner": return "🌙";
      case "snack": return "🍎";
      default: return "🍽️";
    }
  };
  
  // Calculate progress percentages (based on 2000 cal diet)
  const calorieGoal = 2000;
  const proteinGoal = 150;
  const carbsGoal = 250;
  const fatGoal = 65;
  
  const caloriePercent = Math.min(100, ((dailySummary?.totalCalories || 0) / calorieGoal) * 100);
  const proteinPercent = Math.min(100, ((dailySummary?.totalProtein || 0) / proteinGoal) * 100);
  const carbsPercent = Math.min(100, ((dailySummary?.totalCarbs || 0) / carbsGoal) * 100);
  const fatPercent = Math.min(100, ((dailySummary?.totalFat || 0) / fatGoal) * 100);
  
  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Nutrition</ThemedText>
        <ThemedText style={{ color: colors.textSecondary }}>Track your daily food intake</ThemedText>
      </View>
      
      {/* Date Navigation */}
      <View style={[styles.dateNav, { backgroundColor: colors.surface }]}>
        <Pressable
          onPress={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 1);
            setSelectedDate(d.toISOString().split("T")[0]);
          }}
          style={styles.dateButton}
        >
          <ThemedText style={styles.dateArrow}>‹</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setSelectedDate(new Date().toISOString().split("T")[0])}
          style={styles.dateCenter}
        >
          <ThemedText type="defaultSemiBold">
            {selectedDate === new Date().toISOString().split("T")[0]
              ? "Today"
              : new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            setSelectedDate(d.toISOString().split("T")[0]);
          }}
          style={styles.dateButton}
        >
          <ThemedText style={styles.dateArrow}>›</ThemedText>
        </Pressable>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Daily Summary</ThemedText>
          
          {summaryLoading ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.macroGrid}>
              {/* Calories */}
              <View style={styles.macroItem}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${caloriePercent}%`, backgroundColor: "#F97316" }]} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.macroValue}>
                  {dailySummary?.totalCalories || 0}
                </ThemedText>
                <ThemedText style={[styles.macroLabel, { color: colors.textSecondary }]}>
                  / {calorieGoal} cal
                </ThemedText>
              </View>
              
              {/* Protein */}
              <View style={styles.macroItem}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${proteinPercent}%`, backgroundColor: "#EF4444" }]} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.macroValue}>
                  {Math.round(dailySummary?.totalProtein || 0)}g
                </ThemedText>
                <ThemedText style={[styles.macroLabel, { color: colors.textSecondary }]}>
                  Protein
                </ThemedText>
              </View>
              
              {/* Carbs */}
              <View style={styles.macroItem}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${carbsPercent}%`, backgroundColor: "#3B82F6" }]} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.macroValue}>
                  {Math.round(dailySummary?.totalCarbs || 0)}g
                </ThemedText>
                <ThemedText style={[styles.macroLabel, { color: colors.textSecondary }]}>
                  Carbs
                </ThemedText>
              </View>
              
              {/* Fat */}
              <View style={styles.macroItem}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${fatPercent}%`, backgroundColor: "#EAB308" }]} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.macroValue}>
                  {Math.round(dailySummary?.totalFat || 0)}g
                </ThemedText>
                <ThemedText style={[styles.macroLabel, { color: colors.textSecondary }]}>
                  Fat
                </ThemedText>
              </View>
            </View>
          )}
        </View>
        
        {/* Scan Food Buttons */}
        <View style={styles.scanButtons}>
          <Pressable
            onPress={() => pickImage(true)}
            disabled={isAnalyzing}
            style={[styles.scanButton, { backgroundColor: "#F97316" }]}
          >
            <ThemedText style={styles.scanButtonText}>📸 Take Photo</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => pickImage(false)}
            disabled={isAnalyzing}
            style={[styles.scanButton, { backgroundColor: colors.tint }]}
          >
            <ThemedText style={styles.scanButtonText}>🖼️ Upload</ThemedText>
          </Pressable>
        </View>
        
        {/* Analyzing State */}
        {isAnalyzing && (
          <View style={[styles.analyzingCard, { backgroundColor: colors.surface }]}>
            {previewImage && (
              <Image source={{ uri: previewImage }} style={styles.previewImage} />
            )}
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={{ marginTop: 12 }}>Analyzing your food...</ThemedText>
          </View>
        )}
        
        {/* Food Logs */}
        <View style={styles.logsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Today's Meals</ThemedText>
          
          {logsLoading ? (
            <ActivityIndicator />
          ) : foodLogs && foodLogs.length > 0 ? (
            foodLogs.map((log: any) => (
              <Pressable
                key={log.id}
                onLongPress={() => deleteFoodLog(log.id)}
                style={[styles.mealCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.mealHeader}>
                  <View style={styles.mealTitleRow}>
                    <ThemedText style={styles.mealIcon}>{getMealIcon(log.mealType)}</ThemedText>
                    <ThemedText type="defaultSemiBold" style={{ textTransform: "capitalize" }}>
                      {log.mealType}
                    </ThemedText>
                  </View>
                  {log.healthScore && (
                    <View style={[styles.healthBadge, { backgroundColor: getHealthScoreColor(log.healthScore) }]}>
                      <ThemedText style={styles.healthBadgeText}>{log.healthScore}/10</ThemedText>
                    </View>
                  )}
                </View>
                
                {log.imageUrl && (
                  <Image source={{ uri: log.imageUrl }} style={styles.mealImage} />
                )}
                
                <View style={styles.mealMacros}>
                  <View style={styles.macroChip}>
                    <ThemedText style={styles.macroChipText}>{log.totalCalories} cal</ThemedText>
                  </View>
                  <View style={styles.macroChip}>
                    <ThemedText style={styles.macroChipText}>P: {Math.round(parseFloat(log.totalProtein))}g</ThemedText>
                  </View>
                  <View style={styles.macroChip}>
                    <ThemedText style={styles.macroChipText}>C: {Math.round(parseFloat(log.totalCarbs))}g</ThemedText>
                  </View>
                  <View style={styles.macroChip}>
                    <ThemedText style={styles.macroChipText}>F: {Math.round(parseFloat(log.totalFat))}g</ThemedText>
                  </View>
                </View>
                
                {log.foods && log.foods.length > 0 && (
                  <View style={styles.foodsList}>
                    {log.foods.map((food: FoodItem, index: number) => (
                      <ThemedText key={index} style={[styles.foodItem, { color: colors.textSecondary }]}>
                        • {food.name} ({food.portion})
                      </ThemedText>
                    ))}
                  </View>
                )}
              </Pressable>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <ThemedText style={styles.emptyIcon}>🍽️</ThemedText>
              <ThemedText type="defaultSemiBold">No meals logged yet</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, textAlign: "center" }}>
                Take a photo of your food to get started
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Meal Type Picker Modal */}
      <Modal
        visible={showMealPicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowMealPicker(false);
          setPendingAnalysis(null);
          setPreviewImage(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Log this meal as:</ThemedText>
            
            {pendingAnalysis && (
              <View style={styles.analysisPreview}>
                <ThemedText type="defaultSemiBold">
                  {pendingAnalysis.analysis.totalCalories} calories
                </ThemedText>
                <ThemedText style={{ color: colors.textSecondary }}>
                  P: {pendingAnalysis.analysis.totalProtein}g | C: {pendingAnalysis.analysis.totalCarbs}g | F: {pendingAnalysis.analysis.totalFat}g
                </ThemedText>
              </View>
            )}
            
            <View style={styles.mealTypeButtons}>
              {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => saveMeal(type)}
                  style={[styles.mealTypeButton, { backgroundColor: colors.surface }]}
                >
                  <ThemedText style={styles.mealTypeIcon}>{getMealIcon(type)}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={{ textTransform: "capitalize" }}>
                    {type}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            
            <Pressable
              onPress={() => {
                setShowMealPicker(false);
                setPendingAnalysis(null);
                setPreviewImage(null);
              }}
              style={[styles.cancelButton, { borderColor: colors.border }]}
            >
              <ThemedText>Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 8,
  },
  dateButton: {
    padding: 8,
  },
  dateArrow: {
    fontSize: 24,
    fontWeight: "600",
  },
  dateCenter: {
    flex: 1,
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  macroValue: {
    fontSize: 16,
  },
  macroLabel: {
    fontSize: 12,
  },
  scanButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  scanButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  analyzingCard: {
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  logsSection: {
    marginTop: 24,
    paddingBottom: 100,
  },
  mealCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mealIcon: {
    fontSize: 20,
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  mealImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  mealMacros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  macroChip: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  macroChipText: {
    fontSize: 13,
  },
  foodsList: {
    marginTop: 12,
  },
  foodItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  analysisPreview: {
    alignItems: "center",
    marginBottom: 20,
  },
  mealTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  mealTypeButton: {
    width: "47%",
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  mealTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
});
