import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Alert,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import { ActivityIndicator } from 'react-native';
import { API_URL } from '@env';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [image, setImage] = useState(null);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const selectImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert(
        'Registration Error',
        'Password and confirm password do not match',
      );
      return;
    }

    if (!image) {
      Alert.alert('Registration Error', 'Please select a profile image');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('image', {
      uri: image.uri,
      name: image.fileName,
      type: image.type,
    });

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);
      Alert.alert(
        'Registration successful',
        'You have been registered successfully',
      );
      setName('');
      setEmail('');
      setPassword('');
      setconfirmPassword('');
      setImage(null);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Registration Error', 'An error occurred while registering');
      console.log('registration failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="large" color="#4A55A2" />
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1, backgroundColor: '#DCEBFA' }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: '#4A55A2', fontSize: 17, fontWeight: '600' }}
              >
                Register
              </Text>
              <Text style={{ fontSize: 17, fontWeight: '600', marginTop: 10 }}>
                Register To your Account
              </Text>
            </View>

            <View style={{ marginTop: 20 }}>
              <View style={{ marginTop: 10 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: '600', color: 'gray' }}
                >
                  Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor={'black'}
                  placeholder="Enter your name"
                />
              </View>

              <View>
                <Text
                  style={{ fontSize: 18, fontWeight: '600', color: 'gray' }}
                >
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholderTextColor={'black'}
                  placeholder="Enter Your Email"
                />
              </View>

              <View style={{ marginTop: 10 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: '600', color: 'gray' }}
                >
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  style={styles.input}
                  placeholderTextColor={'black'}
                  placeholder="Password"
                />
              </View>

              <View style={{ marginTop: 10 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: '600', color: 'gray' }}
                >
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setconfirmPassword}
                  secureTextEntry={true}
                  style={styles.input}
                  placeholderTextColor={'black'}
                  placeholder="Confirm Password"
                />
              </View>

              <Pressable onPress={selectImage} style={styles.imageButton}>
                <Text style={{ color: 'white', textAlign: 'center' }}>
                  Select Profile Image
                </Text>
              </Pressable>

              {image && (
                <Image
                  source={{ uri: image.uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    alignSelf: 'center',
                    marginTop: 10,
                  }}
                />
              )}

              <Pressable onPress={handleRegister} style={styles.registerButton}>
                <Text style={styles.registerText}>Register</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.goBack()}
                style={{ marginTop: 15 }}
              >
                <Text
                  style={{ textAlign: 'center', color: 'gray', fontSize: 16 }}
                >
                  Already Have an account? Sign in
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  input: {
    fontSize: 18,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginVertical: 10,
    width: 300,
    color: 'black',
  },
  imageButton: {
    width: 200,
    backgroundColor: '#4A55A2',
    padding: 10,
    marginTop: 20,
    borderRadius: 6,
    alignSelf: 'center',
  },
  registerButton: {
    width: 200,
    backgroundColor: '#4A55A2',
    padding: 15,
    marginTop: 30,
    alignSelf: 'center',
    borderRadius: 6,
  },
  registerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
