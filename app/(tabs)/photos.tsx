import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 3;

type PhotoType = "front" | "side" | "back" | "other";

const PHOTO_TYPES: { value: PhotoType; label: string }[] = [
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" },
  { value: "other", label: "Other" },
];

export default function ProgressPhotosScreen() {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [filterType, setFilterType] = useState<PhotoType | null>(null);

  // Form state
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split("T")[0]);
  const [photoType, setPhotoType] = useState<PhotoType>("front");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.photos.list.useQuery(
    filterType ? { photoType: filterType } : undefined
  );

  const createMutation = trpc.photos.create.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      resetForm();
      setShowAddModal(false);
    },
  });

  const deleteMutation = trpc.photos.delete.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      setSelectedPhoto(null);
    },
  });

  const resetForm = () => {
    setPhotoDate(new Date().toISOString().split("T")[0]);
    setPhotoType("front");
    setImageUri(null);
    setWeight("");
    setNotes("");
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is needed to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select or take a photo");
      return;
    }

    createMutation.mutate({
      photoDate,
      photoType,
      imageUrl: imageUri,
      weight: weight ? parseFloat(weight) : undefined,
      notes: notes || undefined,
    });
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this progress photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
    ]);
  };

  const renderPhoto = ({ item }: { item: any }) => (
    <Pressable style={styles.photoThumbnail} onPress={() => setSelectedPhoto(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
      <View style={styles.photoOverlay}>
        <ThemedText style={styles.photoDate}>
          {new Date(item.photoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </ThemedText>
      </View>
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.photoType) }]}>
        <ThemedText style={styles.typeBadgeText}>{item.photoType}</ThemedText>
      </View>
    </Pressable>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "front": return "#007AFF";
      case "side": return "#34C759";
      case "back": return "#FF9500";
      default: return "#8E8E93";
    }
  };

  // Group photos by month
  const groupedPhotos = photos?.reduce((acc: any, photo: any) => {
    const month = new Date(photo.photoDate).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(photo);
    return acc;
  }, {});

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Progress</ThemedText>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <ThemedText style={styles.addButtonText}>+ Photo</ThemedText>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <Pressable style={[styles.filterTab, !filterType && styles.filterTabActive]} onPress={() => setFilterType(null)}>
          <ThemedText style={[styles.filterText, !filterType && styles.filterTextActive]}>All</ThemedText>
        </Pressable>
        {PHOTO_TYPES.map((type) => (
          <Pressable key={type.value} style={[styles.filterTab, filterType === type.value && styles.filterTabActive]} onPress={() => setFilterType(type.value)}>
            <ThemedText style={[styles.filterText, filterType === type.value && styles.filterTextActive]}>{type.label}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : photos && photos.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {groupedPhotos && Object.entries(groupedPhotos).map(([month, monthPhotos]: [string, any]) => (
            <View key={month}>
              <ThemedText style={styles.monthHeader}>{month}</ThemedText>
              <View style={styles.photoGrid}>
                {monthPhotos.map((photo: any) => renderPhoto({ item: photo }))}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyIcon}>📸</ThemedText>
          <ThemedText style={styles.emptyTitle}>No Progress Photos</ThemedText>
          <ThemedText style={styles.emptyText}>Take regular photos to visually track your transformation over time.</ThemedText>
        </View>
      )}

      {/* Add Photo Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { resetForm(); setShowAddModal(false); }}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>
            <ThemedText type="subtitle">Add Photo</ThemedText>
            <Pressable onPress={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? <ActivityIndicator size="small" /> : <ThemedText style={styles.saveText}>Save</ThemedText>}
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.imagePickerContainer}>
              {imageUri ? (
                <Pressable onPress={pickImage}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <ThemedText style={styles.tapToChange}>Tap to change</ThemedText>
                </Pressable>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <View style={styles.imageButtons}>
                    <Pressable style={styles.imageButton} onPress={takePhoto}>
                      <ThemedText style={styles.imageButtonIcon}>📷</ThemedText>
                      <ThemedText style={styles.imageButtonText}>Camera</ThemedText>
                    </Pressable>
                    <Pressable style={styles.imageButton} onPress={pickImage}>
                      <ThemedText style={styles.imageButtonIcon}>🖼️</ThemedText>
                      <ThemedText style={styles.imageButtonText}>Gallery</ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            <ThemedText style={styles.inputLabel}>Photo Type</ThemedText>
            <View style={styles.typeContainer}>
              {PHOTO_TYPES.map((type) => (
                <Pressable key={type.value} style={[styles.typeButton, photoType === type.value && styles.typeButtonActive]} onPress={() => setPhotoType(type.value)}>
                  <ThemedText style={[styles.typeButtonText, photoType === type.value && styles.typeButtonTextActive]}>{type.label}</ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={styles.inputLabel}>Date</ThemedText>
            <TextInput style={styles.input} value={photoDate} onChangeText={setPhotoDate} placeholder="YYYY-MM-DD" placeholderTextColor="#8E8E93" />

            <ThemedText style={styles.inputLabel}>Weight (Optional)</ThemedText>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="Current weight in lbs" placeholderTextColor="#8E8E93" keyboardType="decimal-pad" />

            <ThemedText style={styles.inputLabel}>Notes (Optional)</ThemedText>
            <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Any notes about this photo..." placeholderTextColor="#8E8E93" multiline numberOfLines={3} />

            <View style={{ height: 100 }} />
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Photo Detail Modal */}
      <Modal visible={!!selectedPhoto} animationType="fade" transparent>
        <View style={styles.detailOverlay}>
          <Pressable style={styles.closeArea} onPress={() => setSelectedPhoto(null)} />
          <View style={styles.detailContainer}>
            {selectedPhoto && (
              <>
                <Image source={{ uri: selectedPhoto.imageUrl }} style={styles.detailImage} resizeMode="contain" />
                <View style={styles.detailInfo}>
                  <ThemedText style={styles.detailDate}>
                    {new Date(selectedPhoto.photoDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </ThemedText>
                  <View style={[styles.detailTypeBadge, { backgroundColor: getTypeColor(selectedPhoto.photoType) }]}>
                    <ThemedText style={styles.detailTypeBadgeText}>{selectedPhoto.photoType}</ThemedText>
                  </View>
                  {selectedPhoto.weight && <ThemedText style={styles.detailWeight}>⚖️ {parseFloat(selectedPhoto.weight).toFixed(1)} lbs</ThemedText>}
                  {selectedPhoto.notes && <ThemedText style={styles.detailNotes}>{selectedPhoto.notes}</ThemedText>}
                  <Pressable style={styles.deletePhotoButton} onPress={() => handleDelete(selectedPhoto.id)}>
                    <ThemedText style={styles.deletePhotoText}>Delete Photo</ThemedText>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 28 },
  addButton: { backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  filterContainer: { paddingHorizontal: 16, marginBottom: 16 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: "#F2F2F7" },
  filterTabActive: { backgroundColor: "#007AFF" },
  filterText: { color: "#8E8E93", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  loader: { marginTop: 40 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  monthHeader: { fontSize: 13, color: "#8E8E93", marginTop: 16, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoThumbnail: { width: PHOTO_SIZE, height: PHOTO_SIZE * 1.33, borderRadius: 12, overflow: "hidden", backgroundColor: "#F2F2F7" },
  thumbnailImage: { width: "100%", height: "100%" },
  photoOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.5)" },
  photoDate: { color: "#fff", fontSize: 12, fontWeight: "600" },
  typeBadge: { position: "absolute", top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { color: "#fff", fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  emptyText: { fontSize: 15, color: "#8E8E93", textAlign: "center", lineHeight: 22 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  cancelText: { color: "#007AFF", fontSize: 17 },
  saveText: { color: "#007AFF", fontSize: 17, fontWeight: "600" },
  modalContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  imagePickerContainer: { alignItems: "center", marginBottom: 24 },
  imagePlaceholder: { width: 200, height: 267, backgroundColor: "#F2F2F7", borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#E5E5EA", borderStyle: "dashed" },
  imageButtons: { flexDirection: "row", gap: 20 },
  imageButton: { alignItems: "center" },
  imageButtonIcon: { fontSize: 40, marginBottom: 8 },
  imageButtonText: { fontSize: 14, color: "#007AFF", fontWeight: "500" },
  previewImage: { width: 200, height: 267, borderRadius: 16 },
  tapToChange: { textAlign: "center", marginTop: 8, color: "#007AFF", fontSize: 14 },
  inputLabel: { fontSize: 13, color: "#8E8E93", marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  typeContainer: { flexDirection: "row", gap: 8 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F2F2F7", alignItems: "center" },
  typeButtonActive: { backgroundColor: "#007AFF" },
  typeButtonText: { fontSize: 14, color: "#8E8E93" },
  typeButtonTextActive: { color: "#fff", fontWeight: "600" },
  input: { backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, fontSize: 16, color: "#000" },
  textArea: { height: 80, textAlignVertical: "top" },
  detailOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center" },
  closeArea: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  detailContainer: { alignItems: "center", padding: 20 },
  detailImage: { width: width - 40, height: (width - 40) * 1.33, borderRadius: 16 },
  detailInfo: { marginTop: 20, alignItems: "center" },
  detailDate: { color: "#fff", fontSize: 16, fontWeight: "600" },
  detailTypeBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  detailTypeBadgeText: { color: "#fff", fontSize: 14, fontWeight: "600", textTransform: "capitalize" },
  detailWeight: { color: "#fff", fontSize: 16, marginTop: 12 },
  detailNotes: { color: "#C7C7CC", fontSize: 14, marginTop: 8, textAlign: "center" },
  deletePhotoButton: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: "rgba(255,59,48,0.2)", borderRadius: 12 },
  deletePhotoText: { color: "#FF3B30", fontSize: 16, fontWeight: "600" },
});
