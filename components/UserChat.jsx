import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";


const UserChat = ({ item, messages }) => {
  const navigation = useNavigation();

  const getLastMessage = () => {
    const userMessages = messages.filter(
      (message) => message.messageType === "text"
    );

    return userMessages[userMessages.length - 1];
  };

  const lastMessage = getLastMessage();

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("Messages", {
          recepientId: item._id,
        })
      }
      style={styles.chatContainer}
    >
      <Image style={styles.image} source={{ uri: item?.image }} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item?.name}</Text>
        {lastMessage && (
          <Text style={styles.message}>{lastMessage?.message}</Text>
        )}
      </View>

      <View>
        {lastMessage && (
          <Text style={styles.time}>{formatTime(lastMessage?.timeStamp)}</Text>
        )}
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({
  chatContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 0.7,
    borderColor: "#D0D0D0",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    padding: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
  },
  message: {
    marginTop: 3,
    color: "gray",
    fontWeight: "500",
  },
  time: {
    fontSize: 11,
    fontWeight: "400",
    color: "#585858",
  },
});
