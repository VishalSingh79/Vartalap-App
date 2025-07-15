import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_URL} from '@env'

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigation = useNavigation();
  console.log("API-> ",API_URL);
  
  useEffect(() => {
    
    const checkLoginStatus = async () => {
      try {
        setLoading(true); 
        const token = await AsyncStorage.getItem("authToken");
        if (token) navigation.replace("Home");
      }catch (error) {
        console.log("error", error);
      }finally {
      setLoading(false); 
    }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
  if (!email || !password) {
    setTimeout(() => {
      Alert.alert("Validation", "Please fill all fields");
    }, 0);
    return;
  }

  setLoading(true);

  try {
    const user = { email, password };
    const response = await axios.post(`${API_URL}/login`, user);
    const token = response.data.token;
    await AsyncStorage.setItem("authToken", token);
    setLoading(false);
    navigation.replace("Home");
  } catch (error) {
    console.log("Login Error", error.message);
    setLoading(false);
    setTimeout(() => {
      Alert.alert("Login Error", "Server error or wrong credentials");
    }, 0);
  }
};


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back !! 👋</Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Enter Your Email"
              placeholderTextColor="black"
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="black"
            />
          </View>

          <Pressable
            onPress={handleLogin}
            style={styles.loginButton}
            disabled={loading} 
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.footerText}>
              Don't have an account? Sign Up
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DCEBFA",
    padding: 10,
    alignItems: "center",
  },
  headerContainer: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#4A55A2",
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 15,
  },
  form: {
    marginTop: 50,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "gray",
  },
  input: {
    fontSize: 18,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginVertical: 10,
    width: 300,
    color: "black",
  },
  loginButton: {
    width: 200,
    backgroundColor: "#4A55A2",
    padding: 15,
    marginTop: 50,
    alignSelf: "center",
    borderRadius: 6,
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  footerText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
});
