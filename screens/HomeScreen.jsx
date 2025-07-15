import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, {
  useLayoutEffect,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserType } from '../useContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import User from '../components/User';
import { API_URL } from '@env';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const [userName, setUserName] = useState('');

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      navigation.replace('Login');
      console.log('Token removed');
    } catch (error) {
      console.log('Error removing token:', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          Heyy {userName} 👋
        </Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <Ionicons
            onPress={() => navigation.navigate('Chats')}
            name="chatbubble-ellipses-outline"
            size={25}
            color="black"
          />
          <SimpleLineIcons
            onPress={() => navigation.replace('Friends')}
            name="people"
            size={25}
            color="black"
          />
          <AntDesign
            onPress={handleLogout}
            name="logout"
            size={24}
            color="red"
          />
        </View>
      ),
    });
  });

  useFocusEffect(
    useCallback(() => {
      fetchUsers(); 
    }, []),
  );

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
      setUserName(decodedToken.userName.split(' ')[0]);
      const res = await axios.get(`${API_URL}/users/${userId}`);
      setUsers(res.data);
    } catch (error) {
      console.error('Token or fetch error', error);
    }
  };

  console.log('Users', users);

  return (
    <ScrollView style={{ padding: 10 }}>
      {users.map((item, index) => (
        <User key={index} item={item} />
      ))}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
