import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, ScrollView, Platform, Linking 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const PRIMARY_BLUE = '#1e88e5';
const DARK_TEXT = '#2c3e50';
const WHITE = '#ffffff';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch("http://10.62.155.85:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    router.replace("/Login");
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={PRIMARY_BLUE} />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={DARK_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity><Feather name="edit-3" size={20} color={PRIMARY_BLUE} /></TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.bio}>{user?.bio || "Job Seeker"}</Text>
      </View>

      {/* Info Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Contact Information</Text>
        
        <View style={styles.infoRow}>
          <Feather name="mail" size={18} color={PRIMARY_BLUE} />
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="phone" size={18} color={PRIMARY_BLUE} />
          <Text style={styles.infoValue}>{user?.phone || "+91 00000 00000"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Professional Links</Text>
        
        <TouchableOpacity style={styles.linkRow} onPress={() => user?.linkedin && Linking.openURL(user.linkedin)}>
          <FontAwesome5 name="linkedin" size={18} color="#0077b5" />
          <Text style={styles.linkText}>{user?.linkedin ? "LinkedIn Profile" : "Add LinkedIn"}</Text>
          <Feather name="chevron-right" size={18} color="#bdc3c7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={() => user?.website && Linking.openURL(user.website)}>
          <MaterialCommunityIcons name="web" size={20} color="#e67e22" />
          <Text style={styles.linkText}>{user?.website ? "Portfolio Website" : "Add Website"}</Text>
          <Feather name="chevron-right" size={18} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={20} color={WHITE} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 
  },
  backBtn: { padding: 8, backgroundColor: WHITE, borderRadius: 10, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT },
  profileHeader: { alignItems: 'center', marginVertical: 30 },
  avatar: { 
    width: 90, height: 90, borderRadius: 45, backgroundColor: PRIMARY_BLUE, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    borderWidth: 4, borderColor: WHITE, elevation: 5
  },
  avatarText: { fontSize: 36, color: WHITE, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: '700', color: DARK_TEXT },
  bio: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#95a5a6', marginBottom: 12, textTransform: 'uppercase' },
  infoRow: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, 
    padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f1f1' 
  },
  infoValue: { marginLeft: 15, fontSize: 15, color: DARK_TEXT, fontWeight: '500' },
  linkRow: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, 
    padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f1f1' 
  },
  linkText: { flex: 1, marginLeft: 15, fontSize: 15, color: DARK_TEXT },
  logoutBtn: { 
    flexDirection: 'row', backgroundColor: '#e74c3c', marginHorizontal: 20, 
    padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 40 
  },
  logoutText: { color: WHITE, fontWeight: '700', fontSize: 16, marginLeft: 10 }
});