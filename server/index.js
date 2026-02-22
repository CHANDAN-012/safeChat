import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import initSocket from "./socket.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const server = http.createServer(app);

// ⚠️ IMPORTANT — ye line sahi honi chahiye
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ⚠️ Yaha actual io pass karo
initSocket(io);

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});