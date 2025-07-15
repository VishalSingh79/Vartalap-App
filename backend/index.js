const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage });
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 8001;
const cors = require("cors");
app.use(cors());
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Message = require("./models/message");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app); 


mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Mongo Db");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDb", err);
  });


const io = new Server(server, {
  cors: {
    origin: "*", // adjust this in production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId); 
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
  
    io.to(receiverId).emit("receiveMessage", {
      senderId,
      message,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running with Socket.IO on port ${port}`);
});




//endpoint for registration of the user

app.post('/register', upload.single('image'), async (req, res) => {
  const { name, email, password } = req.body;
  const image = req.file?.path; // Cloudinary image URL

  if (!name || !email || !password || !image) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newUser = new User({ name, email, password, image });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', image });
  } catch (err) {
    console.error('Error registering user', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});


//function to create a token for the user
const createToken = (userId,userName) => {
  // Set the token payload
  const payload = {
    userId: userId,
    userName:userName,
  };

  // Generate the token with a secret key and expiration time
  const token = jwt.sign(payload, "Vishal", { expiresIn: "1h" });

  return token;
};

//endpoint for logging in of that particular user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //check if the email and password are provided
  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "Email and the password are required" });
  }

//check for that user in the database
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        //user not found
        return res.status(404).json({ message: "User not found" });
      }

      //compare the provided passwords with the password in the database
      if (user.password !== password) {
        return res.status(404).json({ message: "Invalid Password!" });
      }

      const token = createToken(user._id,user.name);
      res.status(200).json({ token });
    })
    .catch((error) => {
      console.log("error in finding the user", error);
      res.status(500).json({ message: "Internal server Error!" });
    });
});

//endpoint to access all the users except the user who's is currently logged in!
app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

//endpoint to send a request to a user
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the recepient's friendRequestsArray!
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId },
    });
    
    //update the sender's sentFriendRequests array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

//endpoint to show all the friend-requests of a particular user
app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("UserId->",userId);
    //fetch the user document based on the User id
    const user = await User.findById(userId)
      .populate("friendRequests", "name email image")
      .lean();
    console.log("User",user);
    const friendRequests = user.friendRequests;
    
    res.json(friendRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to accept a friend-request of a particular person
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    //retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.friends.push(recepientId);
    recepient.friends.push(senderId);

    recepient.friendRequests = recepient.friendRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recepientId.toString
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to access all the friends of the logged in user!
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    const acceptedFriends = user.friends;
    res.json(acceptedFriends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to post Messages and store it in the backend
// app.post("/messages", upload.single("imageFile"), async (req, res) => {
//   try {
//     const { senderId, recepientId, messageType, messageText } = req.body;

//     const newMessage = new Message({
//       senderId,
//       recepientId,
//       messageType,
//       message: messageText,
//       timestamp: new Date(),
//       imageUrl: messageType === "image" ? req.file.path : null,
//     });

//     await newMessage.save();
//     res.status(200).json({ message: "Message sent Successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path : null,
    });

    const savedMessage = await newMessage.save();

    // Populate sender details to maintain frontend consistency
    const populatedMessage = await Message.findById(savedMessage._id).populate("senderId", "_id name");

    res.status(200).json(populatedMessage); // Return full saved message
  } catch (error) {
    console.log("Error saving message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


///endpoint to get the userDetails to design the chat Room header
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to fetch the messages between two users in the chatRoom
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to delete the messages!
app.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Invalid request body!" });
    }

    // 1. Fetch messages before deleting
    const messagesToDelete = await Message.find({ _id: { $in: messages } });

    // 2. Delete image files if any
    for (const msg of messagesToDelete) {
      if (msg.messageType === "image" && msg.imageUrl) {
        const imagePath = path.join(__dirname, "uploads", path.basename(msg.imageUrl));

        // Delete image from server
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Failed to delete image:", imagePath, err);
          } else {
            console.log("Image deleted:", imagePath);
          }
        });
      }
    }

    // 3. Delete from DB
    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Messages deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/friend-requests/sent/:userId",async(req,res) => {
  try{
    const {userId} = req.params;
    const user = await User.findById(userId).populate("sentFriendRequests","name email image").lean();

    const sentFriendRequests = user.sentFriendRequests;

    res.json(sentFriendRequests);
  } catch(error){
    console.log("error",error);
    res.status(500).json({ error: "Internal Server" });
  }
})

app.get("/friends/:userId",(req,res) => {
  try{
    const {userId} = req.params;

    User.findById(userId).populate("friends").then((user) => {
      if(!user){
        return res.status(404).json({message: "User not found"})
      }

      const friendIds = user.friends.map((friend) => friend._id);

      res.status(200).json(friendIds);
    })
  } catch(error){
    console.log("error",error);
    res.status(500).json({message:"internal server error"})
  }
})