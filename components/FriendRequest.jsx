import { StyleSheet, Text, View, Pressable, Image, ActivityIndicator } from "react-native";
import React, { useContext, useState } from "react";
import { UserType } from "../useContext";
import { useNavigation  } from "@react-navigation/native";
import {API_URL} from '@env'

const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId } = useContext(UserType);
  
  const [loading, setLoading] = useState(false);

  const acceptRequest = async (friendRequestId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/friend-request/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: friendRequestId,
          recepientId: userId,
        }),
      });

      if (response.ok) {
        setFriendRequests((prev) =>
          prev.filter((request) => request._id !== friendRequestId)
        );
        
      }
    } catch (err) {
      console.log("error accepting the friend request", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
      }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25 }}
        source={{ uri: item.image }}
      />

      <Text
        style={{ fontSize: 15, fontWeight: "bold", marginLeft: 10, flex: 1 }}
      >
        {item?.name} sent you a friend request!!
      </Text>

      <Pressable
        onPress={() => acceptRequest(item._id)}
        style={styles.acceptButton}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.acceptText}>Accept</Text>
        )}
      </Pressable>
    </Pressable>
  );
};

export default FriendRequest;

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: "#0066b2",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  acceptText: {
    textAlign: "center",
    color: "white",
    fontWeight: "600",
  },
});
