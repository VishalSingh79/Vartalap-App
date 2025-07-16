import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';


const MediaPreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uri } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back-outline" size={28} color="white" />
      </TouchableOpacity>  
        <Image
          source={{ uri }}
          style={styles.media}
          resizeMode="contain"
        /> 
    </View>
  );
};

export default MediaPreviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  media: {
    width: '100%',
    height: '100%',
  },
});
