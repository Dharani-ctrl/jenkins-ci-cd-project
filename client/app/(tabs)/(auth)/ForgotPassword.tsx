import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from '@expo/vector-icons';

// --- Design Constants ---
const NAVY_BLUE = '#0d1558'; 
const DARK_BLUE = '#1a237e'; 
const PRIMARY_BLUE = '#1e88e5'; // Bright blue for action buttons and links
const WHITE = '#ffffff';
const TEXT_COLOR = '#333';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      // NOTE: Using the API URL structure from the Login/Signup screens
      const response = await fetch("http://10.62.155.85:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessModal(true);
      } else {
        Alert.alert("Failed", data.msg || "Unable to send reset email");
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[NAVY_BLUE, DARK_BLUE]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Application Logo/Name - Visible on Dark Background */}
            <Text style={styles.appLogo}>BALA</Text>

            <View style={styles.card}>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email to receive a password reset link.
                </Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />
                    <Feather name="mail" size={18} color="#a0a0a0" />
                </View>

                {/* Send Reset Link Button */}
                <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={loading}
                    style={styles.button}
                >
                    {loading ? (
                    <ActivityIndicator color={WHITE} />
                    ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                </TouchableOpacity>

                {/* Back to Login Link */}
                <TouchableOpacity onPress={() => router.push("/Login")} style={{marginTop: 15}}>
                    <Text style={styles.linkText}>← Back to Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={successModal}
        onRequestClose={() => setSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✅ Link Sent!</Text>
            <Text style={styles.modalMessage}>
              Please check your inbox for the password reset link.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setSuccessModal(false);
                router.replace("/Login");
              }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  appLogo: {
    position: 'absolute',
    top: 60,
    left: 20,
    fontSize: 20,
    color: WHITE,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 30,
    width: "90%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "left",
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: "left",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 48,
  },
  input: {
    flex: 1,
    color: TEXT_COLOR,
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    color: PRIMARY_BLUE,
    textAlign: "center",
    marginTop: 15,
    fontWeight: '600',
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)", // Darker overlay for better focus
  },
  modalContent: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 30,
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: PRIMARY_BLUE,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    color: '#666',
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  modalButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});