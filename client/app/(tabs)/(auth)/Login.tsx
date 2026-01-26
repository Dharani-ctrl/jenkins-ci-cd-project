import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather, AntDesign } from "@expo/vector-icons"; 

const { width } = Dimensions.get("window");

const PRIMARY_BLUE = '#1e88e5'; 
const DARK_TEXT = '#2c3e50'; 
const LIGHT_BACKGROUND = '#f5f7fa'; 
const BORDER_COLOR = '#ecf0f1'; 
const BUTTON_BG = '#2c3e50'; 
const WHITE = '#ffffff';

const BASE_IP = "10.98.87.155"; 
const API_URL = Platform.OS === 'web' 
  ? "http://localhost:5000/api/auth" 
  : `http://${BASE_IP}:5000/api/auth`;

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
   
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem("token", data.token);
        router.replace("/Home");
      } else {
        Alert.alert("Login Failed", data.msg || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Network Error", "Cannot reach server. Ensure computer and phone are on the same Wi-Fi.");
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <View style={styles.mainBackground}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.formCard}>
            <View style={styles.logoPlaceholder}>
                <Feather name="bar-chart-2" size={30} color={PRIMARY_BLUE} />
            </View>

            <Text style={styles.title}>Welcome to SkillBridge</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color={PRIMARY_BLUE} />
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color={PRIMARY_BLUE} />
              <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} style={styles.input} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={PRIMARY_BLUE} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.loginButton}>
              {loading ? <ActivityIndicator color={WHITE} /> : <Text style={styles.loginText}>Sign in</Text>}
            </TouchableOpacity>

            <View style={styles.signupRow}>
                <Text style={styles.signupPrompt}>Need an account?</Text>
                <TouchableOpacity onPress={() => router.push("/Signup")}>
                    <Text style={styles.signupLink}>Sign up</Text>
                </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainBackground: { flex: 1, backgroundColor: WHITE },
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  formCard: { 
    width: width > 600 ? 450 : "100%", 
    backgroundColor: WHITE, 
    borderRadius: 20, 
    padding: width > 600 ? 40 : 25, 
    alignItems: 'center', 
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20
  },
  logoPlaceholder: { marginBottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: LIGHT_BACKGROUND, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: DARK_TEXT, fontWeight: "700" },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 25 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: LIGHT_BACKGROUND, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, height: 55, width: '100%' },
  input: { flex: 1, color: DARK_TEXT, fontSize: 16, paddingHorizontal: 10 },
  loginButton: { backgroundColor: BUTTON_BG, borderRadius: 10, paddingVertical: 15, alignItems: "center", width: '100%', marginTop: 10 },
  loginText: { color: WHITE, fontSize: 18, fontWeight: "700" },
  signupRow: { flexDirection: "row", marginTop: 20 },
  signupPrompt: { color: '#7f8c8d' },
  signupLink: { color: PRIMARY_BLUE, fontWeight: "700", marginLeft: 5 },
});