import { StyleSheet, Text, View, ActivityIndicator,ScrollView} from "react-native";
import React, { useEffect, useContext, useState,useLayoutEffect } from "react";
import axios from "axios";
import { UserType } from "../useContext";
import FriendRequest from "../components/FriendRequest";
import {API_URL} from '@env'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const FriendsScreen = () => {
  const { userId } = useContext(UserType);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  useLayoutEffect(() => {
  navigation.setOptions({
    headerLeft: () => (
      <Ionicons
        name="arrow-back"
        size={24}
        color="black"
        style={{ marginLeft: 10 }}
        onPress={() => navigation.navigate('Home')} // goes back to Home
      />
    ),
    title: 'Friend Requests',
  });
}, [navigation]);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/friend-request/${userId}`
      );

      if (response.status === 200) {
        const friendRequestsData = response.data.map((friendRequest) => ({
          _id: friendRequest._id,
          name: friendRequest.name,
          email: friendRequest.email,
          image: friendRequest.image,
        }));
        setFriendRequests(friendRequestsData);
      }
    } catch (err) {
      console.log("Error fetching friend requests:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color="#4A55A2" />
        <Text style={styles.loadingText}>Loading friend requests...</Text>
      </View>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.emptyText}>No Friend Requests yet!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Friend Requests!</Text>
      {friendRequests.map((item, index) => (
        <FriendRequest
          key={index}
          item={item}
          friendRequests={friendRequests}
          setFriendRequests={setFriendRequests}
        />
      ))}
    </ScrollView>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginHorizontal: 12,
    marginTop: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4A55A2",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
});
