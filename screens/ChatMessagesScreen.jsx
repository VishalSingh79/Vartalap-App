import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import EmojiPicker from 'rn-emoji-keyboard';
import { UserType } from '../useContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { API_URL } from '@env';
import io from 'socket.io-client';


const ChatMessagesScreen = () => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recepientData, setRecepientData] = useState();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState('');
  const route = useRoute();
  const { recepientId } = route.params;
  const [message, setMessage] = useState('');
  const { userId } = useContext(UserType);
  const scrollViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const socket = useRef(null);
  useEffect(() => {
    fetchMessages();
    fetchRecepientData();
    socket.current = io(API_URL);

    socket.current.emit('join', userId);

    socket.current.on('receiveMessage', data => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => scrollToBottom(), 100);
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/messages/${userId}/${recepientId}`,
      );
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      } else {
        console.log('Error loading messages');
      }
    } catch (error) {
      console.log('Fetch messages error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecepientData = async () => {
    try {
      const response = await fetch(`${API_URL}/user/${recepientId}`);
      const data = await response.json();
      setRecepientData(data);
    } catch (error) {
      console.log('Error retrieving user data', error);
    }
  };

  // const handleSend = async (messageType, imageUri) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('senderId', userId);
  //     formData.append('recepientId', recepientId);

  //     if (messageType === 'image') {
  //       formData.append('messageType', 'image');
  //       formData.append('imageFile', {
  //         uri: imageUri,
  //         name: 'image.jpg',
  //         type: 'image/jpeg',
  //       });
  //     } else {
  //       formData.append('messageType', 'text');
  //       formData.append('messageText', message);
  //     }

  //     const response = await fetch(`${API_URL}/messages`, {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       setMessage('');
  //       setSelectedImage('');
  //       fetchMessages();
  //     }
  //   } catch (error) {
  //     console.log('Send message error', error);
  //   }
  // };

  const handleSend = async (messageType, imageUri) => {
  try {
    const formData = new FormData();
    formData.append("senderId", userId);
    formData.append("recepientId", recepientId);

    if (messageType === "image") {
      formData.append("messageType", "image");
      formData.append("imageFile", {
        uri: imageUri,
        name: "image.jpg",
        type: "image/jpeg",
      });
    } else {
      formData.append("messageType", "text");
      formData.append("messageText", message);
    }

    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const newMsg = await response.json(); 
      socket.current.emit("sendMessage", {
        senderId: userId,
        receiverId: recepientId,
        message: newMsg,
      });

      setMessages((prev) => [...prev, newMsg]);
      setMessage("");
      setSelectedImage("");
    }
  } catch (error) {
    console.log("Send message error", error);
  }
};


  const deleteMessages = async messageIds => {
    try {
      const response = await fetch(`${API_URL}/deleteMessages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageIds }),
      });

      if (response.ok) {
        setSelectedMessages(prev =>
          prev.filter(id => !messageIds.includes(id)),
        );
        fetchMessages();
      }
    } catch (error) {
      console.log('Delete message error', error);
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.length > 0) {
      handleSend('image', result.assets[0].uri);
    }
  };

  const formatTime = time => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(time).toLocaleString('en-US', options);
  };

  const handleSelectMessage = msg => {
    const isSelected = selectedMessages.includes(msg._id);
    if (isSelected) {
      setSelectedMessages(prev => prev.filter(id => id !== msg._id));
    } else {
      setSelectedMessages(prev => [...prev, msg._id]);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <Ionicons
            onPress={
              selectedMessages.length > 0
                ? () => setSelectedMessages([])
                : () => navigation.goBack()
            }
            name="arrow-back-outline"
            size={24}
            color="black"
          />
          {selectedMessages.length > 0 ? (
            <Text style={styles.headerTitleText}>
              {selectedMessages.length}
            </Text>
          ) : (
            <View style={styles.headerUserInfo}>
              <Image
                source={{ uri: recepientData?.image }}
                style={styles.avatar}
              />
              <Text style={styles.userName}>{recepientData?.name}</Text>
            </View>
          )}
        </View>
      ),
      headerRight: () =>
        selectedMessages.length > 0 && (
          <MaterialIcons
            onPress={() => deleteMessages(selectedMessages)}
            name="delete"
            size={24}
            color="black"
          />
        ),
    });
  }, [recepientData, selectedMessages]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A55A2" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((item, index) => {
          const isSender = item?.senderId?._id === userId;
          const isSelected = selectedMessages.includes(item._id);
          const bubbleStyle = [
            isSender ? styles.senderBubble : styles.receiverBubble,
            isSelected && styles.selectedBubble,
          ];

          return (
            <Pressable
              key={index}
              onPress={() => {
                if (selectedMessages.length > 0) handleSelectMessage(item);
              }}
              onLongPress={() => handleSelectMessage(item)}
              style={bubbleStyle}
            >
              {item.messageType === 'text' ? (
                <>
                  <Text style={styles.messageText}>{item?.message}</Text>
                  <Text style={styles.timeText}>
                    {formatTime(item.timeStamp)}
                  </Text>
                </>
              ) : (
                <View>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.imageMessage}
                  />
                  <Text style={styles.timeOverlay}>
                    {formatTime(item?.timeStamp)}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Input section */}
      <View style={styles.inputRow}>
        <Entypo
          onPress={() => setIsEmojiPickerOpen(true)}
          name="emoji-happy"
          size={24}
          color="gray"
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          style={styles.chatInput}
        />
        <Entypo onPress={pickImage} name="camera" size={24} color="gray" />
        <Pressable onPress={() => handleSend('text')} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>

      <EmojiPicker
        onEmojiSelected={emojiObject =>
          setMessage(prev => prev + emojiObject.emoji)
        }
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: 'bold',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  loadingText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  senderBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 8,
    maxWidth: '60%',
    borderRadius: 7,
    margin: 10,
  },
  receiverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    padding: 8,
    maxWidth: '60%',
    borderRadius: 7,
    margin: 10,
  },
  selectedBubble: {
    width: '100%',
    backgroundColor: '#47e771dc',
  },
  messageText: {
    fontSize: 13,
  },
  timeText: {
    textAlign: 'right',
    fontSize: 9,
    color: 'gray',
    marginTop: 5,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 7,
  },
  timeOverlay: {
    position: 'absolute',
    right: 10,
    bottom: 7,
    color: 'white',
    fontSize: 9,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    marginBottom: 25,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
