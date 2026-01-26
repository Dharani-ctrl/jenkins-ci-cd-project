import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const NAVY_BLUE = '#0d1558'; 
const DARK_BLUE = '#1a237e'; 
const PRIMARY_BLUE = '#1e88e5'; 
const GOOGLE_BLUE = '#4285f4'; 
const WHITE = '#ffffff';
const TEXT_COLOR = '#333';

// Ensure this IP is exactly what your computer shows right now in 'ipconfig'
const BASE_IP = "10.98.87.155"; 
const API_URL = Platform.OS === 'web' 
  ? "http://localhost:5000/api/auth" 
  : `http://${BASE_IP}:5000/api/auth`;

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Account created successfully!");
        router.replace("/Login");
      } else {
        Alert.alert("Signup Failed", data.msg || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Network Error", "Mobile cannot reach server. Check Wi-Fi and Firewall.");
      console.log("Signup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[NAVY_BLUE, DARK_BLUE]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.appLogo}>SKILLBRIDGE</Text>
            
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create an account</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="User name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholderTextColor="#999"
                />
                <Feather name="user" size={18} color="#a0a0a0" />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email ID"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#999"
                />
                <Feather name="mail" size={18} color="#a0a0a0" />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    placeholderTextColor="#999"
                />
                <Feather name="lock" size={18} color="#a0a0a0" />
            </View>

            <TouchableOpacity onPress={handleSignup} disabled={loading} style={styles.button}>
              {loading ? <ActivityIndicator color={WHITE} /> : <Text style={styles.buttonText}>Create account</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}>
                <MaterialCommunityIcons name="google" size={20} color={GOOGLE_BLUE} style={{marginRight: 10}}/>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
                <Text style={styles.loginPrompt}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/Login")}>
                    <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  appLogo: { 
    position: Platform.OS === 'web' ? 'absolute' : 'relative', 
    top: Platform.OS === 'web' ? 40 : 0, 
    left: Platform.OS === 'web' ? 40 : 0, 
    fontSize: 24, color: WHITE, fontWeight: 'bold', marginBottom: 30 
  },
  card: { 
    backgroundColor: WHITE, 
    borderRadius: 12, 
    padding: width > 600 ? 40 : 25, // More padding on web
    width: width > 600 ? 450 : "100%", // Fixed width on web, full width on mobile
    maxWidth: 500,
    elevation: 5, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  cardTitle: { fontSize: 24, color: TEXT_COLOR, fontWeight: "700", marginBottom: 25 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: WHITE, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, height: 52 },
  input: { flex: 1, color: TEXT_COLOR, fontSize: 16 },
  button: { backgroundColor: PRIMARY_BLUE, paddingVertical: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: WHITE, fontSize: 16, fontWeight: "600" },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE, borderWidth: 1, borderColor: '#e0e0e0', paddingVertical: 14, borderRadius: 8, marginTop: 15 },
  googleButtonText: { color: TEXT_COLOR, fontSize: 16, fontWeight: '500' },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginPrompt: { color: TEXT_COLOR, fontSize: 14 },
  loginLink: { color: PRIMARY_BLUE, fontWeight: "600", fontSize: 14 },
});