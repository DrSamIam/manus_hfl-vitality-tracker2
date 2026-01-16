import { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";
import { HFL_PRODUCTS, HFLProduct } from "@/shared/hfl-products";

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "energy", label: "Energy & Focus" },
  { id: "hormones", label: "Hormones" },
  { id: "heart", label: "Heart & Blood" },
  { id: "mood", label: "Mood & Sleep" },
  { id: "weight", label: "Weight Loss" },
];

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<HFLProduct | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Fetch user data for personalized recommendations
  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: symptoms } = trpc.symptoms.list.useQuery({ limit: 30 }, { enabled: isAuthenticated });
  const { data: biomarkers } = trpc.biomarkers.list.useQuery(undefined, { enabled: isAuthenticated });

  // AI-powered product recommendations
  const getRecommendations = trpc.products.getRecommendations.useMutation();

  // Filter products by category
  const filteredProducts = useMemo(() => {
    let products = HFL_PRODUCTS;

    // Filter by gender if profile is available
    if (profile?.biologicalSex) {
      products = products.filter(
        (p) => p.forGender === "Both" || p.forGender.toLowerCase() === profile.biologicalSex?.toLowerCase()
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      products = products.filter((p) => {
        const categoryLower = p.category.toLowerCase();
        switch (selectedCategory) {
          case "energy":
            return categoryLower.includes("energy") || categoryLower.includes("focus") || categoryLower.includes("brain");
          case "hormones":
            return categoryLower.includes("testosterone") || categoryLower.includes("hormone") || categoryLower.includes("cortisol");
          case "heart":
            return categoryLower.includes("blood") || categoryLower.includes("heart") || categoryLower.includes("cholesterol");
          case "mood":
            return categoryLower.includes("mood") || categoryLower.includes("sleep") || categoryLower.includes("anxiety") || categoryLower.includes("stress");
          case "weight":
            return categoryLower.includes("weight") || categoryLower.includes("metabolism") || categoryLower.includes("appetite");
          default:
            return true;
        }
      });
    }

    return products;
  }, [profile?.biologicalSex, selectedCategory]);

  const handleGetRecommendations = async () => {
    setShowRecommendations(true);
    await getRecommendations.mutateAsync({});
  };

  const handleProductPress = (product: HFLProduct) => {
    setSelectedProduct(product);
  };

  const handleBuyNow = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20) + 80,
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
          },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="title">HFL Products</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Doctor-Formulated Supplements
          </ThemedText>
        </View>

        {/* AI Recommendations Button */}
        {isAuthenticated && (
          <Pressable
            onPress={handleGetRecommendations}
            style={({ pressed }) => [
              styles.recommendButton,
              { backgroundColor: colors.tint },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={{ fontSize: 20, marginRight: 8 }}>🤖</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: "#FFFFFF" }}>
              Get Personalized Recommendations
            </ThemedText>
          </Pressable>
        )}

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === category.id ? colors.tint : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <ThemedText
                style={{
                  color: selectedCategory === category.id ? "#FFFFFF" : colors.text,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {category.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => handleProductPress(product)}
              style={({ pressed }) => [
                styles.productCard,
                { backgroundColor: colors.surface },
                pressed && styles.cardPressed,
              ]}
            >
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
                resizeMode="contain"
              />
              <ThemedText type="defaultSemiBold" style={styles.productName} numberOfLines={2}>
                {product.name}
              </ThemedText>
              <ThemedText style={[styles.productCategory, { color: colors.textSecondary }]} numberOfLines={1}>
                {product.category.split(",")[0]}
              </ThemedText>
              {product.forGender === "Male" && (
                <View style={[styles.genderBadge, { backgroundColor: colors.tint }]}>
                  <ThemedText style={{ color: "#FFFFFF", fontSize: 10 }}>Men</ThemedText>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText type="subtitle" numberOfLines={1} style={{ flex: 1 }}>
                {selectedProduct?.name}
              </ThemedText>
              <Pressable onPress={() => setSelectedProduct(null)}>
                <ThemedText style={{ color: colors.tint, fontSize: 16 }}>Close</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedProduct && (
                <>
                  <Image
                    source={{ uri: selectedProduct.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />

                  <ThemedText style={[styles.productDescription, { lineHeight: 24 }]}>
                    {selectedProduct.shortDescription}
                  </ThemedText>

                  <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
                    <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                      Primary Benefits
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, lineHeight: 22 }}>
                      {selectedProduct.primaryBenefits}
                    </ThemedText>
                  </View>

                  <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
                    <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                      Helps With
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, lineHeight: 22 }}>
                      {selectedProduct.relatedSymptoms}
                    </ThemedText>
                  </View>

                  <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
                    <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                      Goals
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, lineHeight: 22 }}>
                      {selectedProduct.relatedGoals}
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() => handleBuyNow(selectedProduct.productUrl)}
                    style={({ pressed }) => [
                      styles.buyButton,
                      { backgroundColor: colors.success },
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <ThemedText type="defaultSemiBold" style={{ color: "#FFFFFF", fontSize: 16 }}>
                      Learn More & Buy Now
                    </ThemedText>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* AI Recommendations Modal */}
      <Modal visible={showRecommendations} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText type="subtitle">Your Recommendations</ThemedText>
              <Pressable onPress={() => { setShowRecommendations(false); getRecommendations.reset(); }}>
                <ThemedText style={{ color: colors.tint, fontSize: 16 }}>Close</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {getRecommendations.isPending && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.tint} />
                  <ThemedText style={{ marginTop: 16, color: colors.textSecondary }}>
                    Analyzing your health data...
                  </ThemedText>
                </View>
              )}

              {getRecommendations.data && (
                <>
                  <View style={[styles.aiAnalysis, { backgroundColor: colors.surface }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <ThemedText style={{ fontSize: 24 }}>🩺</ThemedText>
                      <ThemedText type="defaultSemiBold">Dr. Sam's Analysis</ThemedText>
                    </View>
                    <ThemedText style={{ lineHeight: 24 }}>
                      {typeof getRecommendations.data.analysis === 'string' ? getRecommendations.data.analysis : ''}
                    </ThemedText>
                  </View>

                  <ThemedText type="subtitle" style={{ marginTop: 20, marginBottom: 16 }}>
                    Recommended Products
                  </ThemedText>

                  {getRecommendations.data.recommendations?.map((rec: any, index: number) => {
                    const product = HFL_PRODUCTS.find((p) => p.id === rec.productId);
                    if (!product) return null;

                    return (
                      <Pressable
                        key={product.id}
                        onPress={() => { setShowRecommendations(false); handleProductPress(product); }}
                        style={[styles.recommendationCard, { backgroundColor: colors.surface }]}
                      >
                        <View style={styles.recRank}>
                          <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
                            #{index + 1}
                          </ThemedText>
                        </View>
                        <Image
                          source={{ uri: product.imageUrl }}
                          style={styles.recImage}
                          resizeMode="contain"
                        />
                        <View style={styles.recInfo}>
                          <ThemedText type="defaultSemiBold" numberOfLines={1}>
                            {product.name}
                          </ThemedText>
                          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={2}>
                            {rec.reason}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </>
              )}

              {getRecommendations.error && (
                <View style={[styles.errorCard, { backgroundColor: colors.surface }]}>
                  <ThemedText style={{ color: colors.error, textAlign: "center" }}>
                    Unable to generate recommendations. Please try again.
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { marginBottom: 20 },
  subtitle: { fontSize: 16, marginTop: 4 },
  recommendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonPressed: { opacity: 0.8 },
  categoryScroll: { marginBottom: 20 },
  categoryContainer: { gap: 8 },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    width: "47%",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cardPressed: { opacity: 0.8 },
  productImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 11,
    textAlign: "center",
  },
  genderBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalScroll: { padding: 20 },
  modalImage: {
    width: "100%",
    height: 200,
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  aiAnalysis: {
    padding: 16,
    borderRadius: 12,
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  recRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,122,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  recInfo: {
    flex: 1,
  },
  errorCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
});
