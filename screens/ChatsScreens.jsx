import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserType } from "../useContext";
import { useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat";
import {API_URL} from '@env'
const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [friendMessages, setFriendMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const { userId } = useContext(UserType);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await fetch(
          `${API_URL}/accepted-friends/${userId}`
        );
        const data = await response.json();

        if (response.ok) {
          setAcceptedFriends(data);

          const messagesMap = {};

          for (const friend of data) {
            const res = await fetch(
              `${API_URL}/messages/${userId}/${friend._id}`
            );
            const messages = await res.json();

            if (res.ok) {
              messagesMap[friend._id] = messages;
            } else {
              messagesMap[friend._id] = [];
            }
          }

          setFriendMessages(messagesMap);
        }
      } catch (error) {
        console.log("error showing the accepted friends", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A55A2" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {acceptedFriends.map((item, index) => (
          <UserChat
            key={index}
            item={item}
            messages={friendMessages[item._id] || []}
          />
        ))}
      </Pressable>
    </ScrollView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4A55A2",
  },
});

