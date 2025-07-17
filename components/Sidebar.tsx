import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Platform,
} from "react-native";
import {
  X,
  User,
  Edit3,
  Camera,
  Info,
  LogOut,
  Save,
  Mail,
  Calendar,
  Weight,
  Ruler,
  Users,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { useAppState } from "@/context/AppStateContext";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { user, logout, updateProfile, userProfile } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: userProfile?.age?.toString() || "",
    weight: userProfile?.weight?.toString() || "",
    height: userProfile?.height?.toString() || "",
    gender: userProfile?.gender || "Not specified",
    avatar: userProfile?.avatar || null,
  });

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(false);
    setShowAbout(false);
    onClose();
  };

  const handleEdit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await updateProfile({
        name: editedProfile.name,
        age: parseInt(editedProfile.age) || 0,
        weight: parseFloat(editedProfile.weight) || 0,
        height: parseFloat(editedProfile.height) || 0,
        gender: editedProfile.gender,
        avatar: editedProfile.avatar,
      });
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      name: user?.name || "",
      email: user?.email || "",
      age: userProfile?.age?.toString() || "",
      weight: userProfile?.weight?.toString() || "",
      height: userProfile?.height?.toString() || "",
      gender: userProfile?.gender || "Not specified",
      avatar: userProfile?.avatar || null,
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditedProfile(prev => ({
        ...prev,
        avatar: result.assets[0].uri,
      }));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            await logout();
            handleClose();
            router.replace("/auth/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderAboutPage = () => (
    <View style={styles.aboutContainer}>
      <View style={styles.aboutHeader}>
        <Pressable onPress={() => setShowAbout(false)} style={styles.backButton}>
          <X size={24} color="#757575" />
        </Pressable>
        <Text style={styles.aboutTitle}>About NepaFit</Text>
      </View>
      
      <ScrollView style={styles.aboutContent}>
        <View style={styles.aboutSection}>
          <Text style={styles.aboutSectionTitle}>Heart Health Management</Text>
          <Text style={styles.aboutText}>
            NepaFit helps you manage your cholesterol and maintain heart health through smart food tracking and personalized insights.
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutSectionTitle}>Key Features</Text>
          <Text style={styles.aboutText}>
            • AI-powered food recognition{"\n"}
            • Cholesterol and macro tracking{"\n"}
            • Heart health coaching{"\n"}
            • Weekly insights and trends{"\n"}
            • Offline support with sync{"\n"}
            • Multi-profile support
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutSectionTitle}>Health Targets</Text>
          <Text style={styles.aboutText}>
            • Total Cholesterol: Less than 200 mg/dL{"\n"}
            • Saturated Fat: Less than 20g daily{"\n"}
            • Fiber: 25g+ daily{"\n"}
            • Protein: Varies by individual needs
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutSectionTitle}>Version</Text>
          <Text style={styles.aboutText}>NepaFit v1.0.0</Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutSectionTitle}>Disclaimer</Text>
          <Text style={styles.aboutText}>
            This app is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider for personalized health recommendations.
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerActions}>
          {!isEditing ? (
            <>
              <Pressable onPress={handleEdit} style={styles.editButton}>
                <Edit3 size={20} color="#2196F3" />
              </Pressable>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#757575" />
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={handleSave} style={styles.saveButton}>
                <Save size={20} color="#4CAF50" />
              </Pressable>
              <Pressable onPress={handleCancel} style={styles.cancelButton}>
                <X size={20} color="#F44336" />
              </Pressable>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Pressable
            style={styles.avatarContainer}
            onPress={isEditing ? handleAvatarChange : undefined}
            disabled={!isEditing}
          >
            {editedProfile.avatar ? (
              <Image source={{ uri: editedProfile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#BDBDBD" />
              </View>
            )}
            {isEditing && (
              <View style={styles.cameraOverlay}>
                <Camera size={20} color="#FFFFFF" />
              </View>
            )}
          </Pressable>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <User size={20} color="#757575" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editedProfile.name}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your name"
                />
              ) : (
                <Text style={styles.fieldValue}>{editedProfile.name || "Not specified"}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <Mail size={20} color="#757575" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{editedProfile.email}</Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <Users size={20} color="#757575" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Gender</Text>
              {isEditing ? (
                <View style={styles.genderContainer}>
                  {["Male", "Female", "Other", "Not specified"].map((gender) => (
                    <Pressable
                      key={gender}
                      style={[
                        styles.genderOption,
                        editedProfile.gender === gender && styles.selectedGender,
                      ]}
                      onPress={() => setEditedProfile(prev => ({ ...prev, gender }))}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          editedProfile.gender === gender && styles.selectedGenderText,
                        ]}
                      >
                        {gender}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.fieldValue}>{editedProfile.gender}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <Calendar size={20} color="#757575" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Age</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editedProfile.age}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, age: text }))}
                  placeholder="Enter your age"
                  keyboardType="number-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{editedProfile.age || "Not specified"}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <Weight size={20} color="#757575" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Weight (kg)</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editedProfile.weight}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, weight: text }))}
                  placeholder="Enter your weight"
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {editedProfile.weight ? `${editedProfile.weight} kg` : "Not specified"}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <Ruler size={20} color="#757575" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Height (cm)</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editedProfile.height}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, height: text }))}
                  placeholder="Enter your height"
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {editedProfile.height ? `${editedProfile.height} cm` : "Not specified"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        {!isEditing && (
          <View style={styles.actionsSection}>
            <Pressable style={styles.actionButton} onPress={() => setShowAbout(true)}>
              <Info size={20} color="#2196F3" />
              <Text style={styles.actionText}>About NepaFit</Text>
            </Pressable>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#F44336" />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {showAbout ? renderAboutPage() : renderProfile()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginLeft: 60,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  profileContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  saveButton: {
    padding: 8,
    marginRight: 8,
  },
  cancelButton: {
    padding: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#F8F9FA",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2196F3",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 16,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  fieldIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#757575",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: "#212121",
  },
  fieldInput: {
    fontSize: 16,
    color: "#212121",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 4,
  },
  genderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  genderOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedGender: {
    backgroundColor: "#2196F3",
  },
  genderText: {
    fontSize: 14,
    color: "#757575",
  },
  selectedGenderText: {
    color: "#FFFFFF",
  },
  actionsSection: {
    padding: 16,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    color: "#2196F3",
    marginLeft: 12,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#F44336",
    marginLeft: 12,
    fontWeight: "500",
  },
  // About page styles
  aboutContainer: {
    flex: 1,
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
  },
  aboutContent: {
    flex: 1,
    padding: 16,
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 20,
  },
});