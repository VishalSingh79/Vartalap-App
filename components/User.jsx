import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { UserType } from "../useContext";
import { API_URL } from "@env";

const User = ({ item }) => {
  const { userId } = useContext(UserType);
  const [requestSent, setRequestSent] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sentRes, friendsRes, receivedRes] = await Promise.all([
          fetch(`${API_URL}/friend-requests/sent/${userId}`),
          fetch(`${API_URL}/friends/${userId}`),
          fetch(`${API_URL}/friend-request/${userId}`), // received
        ]);

        const sentRequestsData = await sentRes.json();
        const friendsData = await friendsRes.json();
        const receivedRequestsData = await receivedRes.json();

        if (sentRes.ok) setFriendRequests(sentRequestsData);
        if (friendsRes.ok) setUserFriends(friendsData);
        if (receivedRes.ok) setReceivedRequests(receivedRequestsData);
      } catch (error) {
        console.log("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    setSending(true);
    try {
      const response = await fetch(`${API_URL}/friend-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUserId, selectedUserId }),
      });

      if (response.ok) {
        setRequestSent(true);
      }
    } catch (error) {
      console.log("error message", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 15, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#4A55A2" />
      </View>
    );
  }

  const isFriend = userFriends.includes(item._id);
  const isRequestSent =
    requestSent || friendRequests.some((friend) => friend._id === item._id);
  const isRequestReceived = receivedRequests.some(
    (request) => request._id === item._id
  );

  return (
    <Pressable
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
    >
      <View>
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            resizeMode: "cover",
          }}
          source={{ uri: item.image }}
        />
      </View>

      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>{item?.name}</Text>
        <Text style={{ marginTop: 4, color: "gray" }}>{item?.email}</Text>
      </View>

      {isFriend ? (
        <Pressable style={styles.friendsBtn}>
          <Text style={styles.btnText}>Friends</Text>
        </Pressable>
      ) : isRequestReceived ? (
        <Pressable style={styles.receivedBtn}>
          <Text style={styles.btnText}>Request Received</Text>
        </Pressable>
      ) : isRequestSent ? (
        <Pressable style={styles.sentBtn}>
          <Text style={styles.btnText}>Request Sent</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
          style={styles.addBtn}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.btnText}>Add Friend</Text>
          )}
        </Pressable>
      )}
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({
  friendsBtn: {
    backgroundColor: "#82CD47",
    padding: 10,
    width: 105,
    borderRadius: 6,
  },
  sentBtn: {
    backgroundColor: "gray",
    padding: 10,
    width: 105,
    borderRadius: 6,
  },
  receivedBtn: {
    backgroundColor: "#FFA500",
    padding: 10,
    width: 130,
    borderRadius: 6,
  },
  addBtn: {
    backgroundColor: "#567189",
    padding: 10,
    borderRadius: 6,
    width: 105,
  },
  btnText: {
    textAlign: "center",
    color: "white",
    fontSize: 13,
  },
});


// import { StyleSheet, Text, View, Pressable, Image, ActivityIndicator } from "react-native";
// import React, { useContext, useState, useEffect } from "react";
// import { UserType } from "../useContext";
// import {API_URL} from '@env'

// const User = ({ item }) => {
//   const { userId } = useContext(UserType);
//   const [requestSent, setRequestSent] = useState(false);
//   const [friendRequests, setFriendRequests] = useState([]);
//   const [userFriends, setUserFriends] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false); 

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
        
//         const [requestsRes, friendsRes] = await Promise.all([
//           fetch(`${API_URL}/friend-requests/sent/${userId}`),
//           fetch(`${API_URL}/friends/${userId}`)
//         ]);

//         const friendRequestsData = await requestsRes.json();
//         const friendsData = await friendsRes.json();

//         if (requestsRes.ok) setFriendRequests(friendRequestsData);
//         if (friendsRes.ok) setUserFriends(friendsData);
//       } catch (error) {
//         console.log("Error fetching data", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const sendFriendRequest = async (currentUserId, selectedUserId) => {
//     setSending(true);
//     try {
//       const response = await fetch(`${API_URL}/friend-request`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ currentUserId, selectedUserId }),
//       });

//       if (response.ok) {
//         setRequestSent(true);
//       }
//     } catch (error) {
//       console.log("error message", error);
//     } finally {
//       setSending(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={{ padding: 15, alignItems: "center" }}>
//         <ActivityIndicator size="small" color="#4A55A2" />
//       </View>
//     );
//   }

//   const isFriend = userFriends.includes(item._id);
//   const isRequestSent =
//     requestSent || friendRequests.some((friend) => friend._id === item._id);

//   return (
//     <Pressable
//       style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
//     >
//       <View>
//         <Image
//           style={{
//             width: 50,
//             height: 50,
//             borderRadius: 25,
//             resizeMode: "cover",
//           }}
//           source={{ uri: item.image }}
//         />
//       </View>

//       <View style={{ marginLeft: 12, flex: 1 }}>
//         <Text style={{ fontWeight: "bold" }}>{item?.name}</Text>
//         <Text style={{ marginTop: 4, color: "gray" }}>{item?.email}</Text>
//       </View>

//       {isFriend ? (
//         <Pressable style={styles.friendsBtn}>
//           <Text style={styles.btnText}>Friends</Text>
//         </Pressable>
//       ) : isRequestSent ? (
//         <Pressable style={styles.sentBtn}>
//           <Text style={styles.btnText}>Request Sent</Text>
//         </Pressable>
//       ) : (
//         <Pressable
//           onPress={() => sendFriendRequest(userId, item._id)}
//           style={styles.addBtn}
//           disabled={sending}
//         >
//           {sending ? (
//             <ActivityIndicator size="small" color="white" />
//           ) : (
//             <Text style={styles.btnText}>Add Friend</Text>
//           )}
//         </Pressable>
//       )}
//     </Pressable>
//   );
// };

// export default User;

// const styles = StyleSheet.create({
//   friendsBtn: {
//     backgroundColor: "#82CD47",
//     padding: 10,
//     width: 105,
//     borderRadius: 6,
//   },
//   sentBtn: {
//     backgroundColor: "gray",
//     padding: 10,
//     width: 105,
//     borderRadius: 6,
//   },
//   addBtn: {
//     backgroundColor: "#567189",
//     padding: 10,
//     borderRadius: 6,
//     width: 105,
//   },
//   btnText: {
//     textAlign: "center",
//     color: "white",
//     fontSize: 13,
//   },
// });
