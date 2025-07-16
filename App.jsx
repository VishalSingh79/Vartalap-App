import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'; 
import React, { useEffect, useState, useContext } from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import FriendsScreen from './screens/FriendsScreen';
import ChatsScreens from './screens/ChatsScreens';
import ChatMessagesScreen from './screens/ChatMessagesScreen';
import MediaPreviewScreen from './screens/MediaPreviewScreen';
import { UserContext as UserContextProvider} from './useContext'; 

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error checking auth token:', error);
        setInitialRoute('Login'); 
      } finally {
        setIsLoading(false); 
      }
    };

    checkAuthToken();
  }, []); 

  if (isLoading) {
  
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A55A2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <UserContextProvider> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Friends"
            component={FriendsScreen}
            options={{ title: 'Friend Requests' }}
          />
          <Stack.Screen name="Chats" component={ChatsScreens} />
          <Stack.Screen name="Messages" component={ChatMessagesScreen} />
          <Stack.Screen
            name="MediaPreview"
            component={MediaPreviewScreen}
            options={{ headerShown: false, presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContextProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCEBFA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A55A2',
  },
});