import express from 'express'
import "dotenv/config";
import cors from 'cors'
import http from "http"
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

// create express app and HTTP server

const app = express();
const server = http.createServer(app)

// initialize Socket.io server
export const io = new Server(server, {
  cors: 
    {origin: "*"}
  
})

//  store online users
export const userSocketMap = {};  //{ userId: socketId }

// Socket.io connection handler

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // emit online users to all connected Client

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Connected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  })
})

// middleware setup

app.use(express.urlencoded({ limit: "50mb", extended: true }));  

app.use(express.json({ limit: "50mb" }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


// routes setup

app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)

// connect to mongodb

await connectDB();

const PORT = process.env.PORT;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
