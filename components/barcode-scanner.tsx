import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Open Food Facts API base URL
const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2/product";

interface ProductInfo {
  name: string;
  brand: string;
  ingredients?: string;
  servingSize?: string;
  imageUrl?: string;
}

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onProductFound: (product: ProductInfo) => void;
}

export function BarcodeScanner({ visible, onClose, onProductFound }: BarcodeScannerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsScanning(true);
      setManualBarcode("");
      setShowManualEntry(false);
    }
  }, [visible]);

  const lookupBarcode = async (barcode: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setIsScanning(false);

    try {
      const response = await fetch(
        `${OFF_API_BASE}/${barcode}.json?fields=product_name,brands,ingredients_text,serving_size,image_url`,
        {
          headers: {
            "User-Agent": "HFLVitalityTracker/1.0 (support@hflvitalitytracker.com)",
          },
        }
      );

      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product: ProductInfo = {
          name: data.product.product_name || "Unknown Product",
          brand: data.product.brands || "",
          ingredients: data.product.ingredients_text,
          servingSize: data.product.serving_size,
          imageUrl: data.product.image_url,
        };

        onProductFound(product);
        onClose();
      } else {
        Alert.alert(
          "Product Not Found",
          "This product is not in the Open Food Facts database. You can enter the details manually.",
          [
            { text: "OK", onPress: () => setIsScanning(true) },
          ]
        );
      }
    } catch (error) {
      console.error("Barcode lookup error:", error);
      Alert.alert(
        "Lookup Error",
        "Failed to look up the product. Please try again or enter details manually.",
        [
          { text: "OK", onPress: () => setIsScanning(true) },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!isScanning || isLoading) return;
    lookupBarcode(data);
  };

  const handleManualLookup = () => {
    if (!manualBarcode.trim()) return;
    lookupBarcode(manualBarcode.trim());
  };

  if (!visible) return null;

  // Permission not yet determined
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={{ marginTop: 16 }}>Checking camera permission...</ThemedText>
          </View>
        </View>
      </Modal>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ThemedText style={{ fontSize: 48, marginBottom: 16 }}>📷</ThemedText>
            <ThemedText type="subtitle" style={{ marginBottom: 8, textAlign: "center" }}>
              Camera Permission Required
            </ThemedText>
            <ThemedText style={{ color: colors.textSecondary, textAlign: "center", marginBottom: 24 }}>
              We need camera access to scan barcodes on supplement bottles.
            </ThemedText>
            <Pressable
              onPress={requestPermission}
              style={[styles.button, { backgroundColor: colors.tint }]}
            >
              <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Grant Permission
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setShowManualEntry(true)}
              style={[styles.button, { backgroundColor: colors.surface, marginTop: 12 }]}
            >
              <ThemedText style={{ color: colors.text }}>
                Enter Barcode Manually
              </ThemedText>
            </Pressable>
            <Pressable onPress={onClose} style={{ marginTop: 16 }}>
              <ThemedText style={{ color: colors.tint }}>Cancel</ThemedText>
            </Pressable>

            {showManualEntry && (
              <View style={styles.manualEntry}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter barcode number"
                  placeholderTextColor={colors.textSecondary}
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  keyboardType="number-pad"
                />
                <Pressable
                  onPress={handleManualLookup}
                  disabled={!manualBarcode.trim() || isLoading}
                  style={[styles.button, { backgroundColor: manualBarcode.trim() ? colors.tint : colors.surface, marginTop: 12 }]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={{ color: manualBarcode.trim() ? "#FFFFFF" : colors.textSecondary, fontWeight: "600" }}>
                      Look Up
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
          }}
          onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={{ color: "#FFFFFF", fontSize: 18 }}>✕</ThemedText>
            </Pressable>
            <ThemedText style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "600" }}>
              Scan Barcode
            </ThemedText>
            <View style={{ width: 44 }} />
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <ThemedText style={{ color: "#FFFFFF", marginTop: 16 }}>
                Looking up product...
              </ThemedText>
            </View>
          )}

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
            <ThemedText style={{ color: "#FFFFFF", textAlign: "center", marginBottom: 16 }}>
              Position the barcode within the frame
            </ThemedText>
            <Pressable
              onPress={() => setShowManualEntry(!showManualEntry)}
              style={[styles.manualButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            >
              <ThemedText style={{ color: "#FFFFFF" }}>
                {showManualEntry ? "Hide Manual Entry" : "Enter Barcode Manually"}
              </ThemedText>
            </Pressable>

            {showManualEntry && (
              <View style={styles.manualEntryCamera}>
                <TextInput
                  style={[styles.input, { backgroundColor: "rgba(255,255,255,0.9)", color: "#000" }]}
                  placeholder="Enter barcode number"
                  placeholderTextColor="#666"
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  keyboardType="number-pad"
                />
                <Pressable
                  onPress={handleManualLookup}
                  disabled={!manualBarcode.trim() || isLoading}
                  style={[styles.lookupButton, { backgroundColor: manualBarcode.trim() ? colors.tint : "rgba(255,255,255,0.3)" }]}
                >
                  <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Look Up
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { margin: 20, padding: 24, borderRadius: 16, alignItems: "center", width: "90%" },
  camera: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 280,
    height: 180,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFFFFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  manualButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  manualEntry: {
    marginTop: 20,
    width: "100%",
  },
  manualEntryCamera: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  lookupButton: {
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
});
