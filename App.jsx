import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import { UserContext } from './useContext';
import FriendsScreen from './screens/FriendsScreen';
import ChatsScreens from './screens/ChatsScreens';
import ChatMessagesScreen from './screens/ChatMessagesScreen';
import MediaPreviewScreen from './screens/MediaPreviewScreen';

const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <UserContext>
      <NavigationContainer>
        <Stack.Navigator>
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
    </UserContext>
  );
};

export default App;

const styles = StyleSheet.create({});
