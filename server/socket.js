import jwt from "jsonwebtoken";
import Message from "./models/Message.js";

const initSocket = (io) => {

  // 🔐 JWT Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;

      next();
    } catch (err) {
      console.log("❌ JWT ERROR:", err.message);
      next(new Error("Authentication error"));
    }
  });

  // 🔌 On Connection
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.userId);

    // 📌 Join Conversation Room
    socket.on("joinConversation", (conversationId) => {
      if (!conversationId) return;

      socket.join(conversationId);
      console.log(`📦 Joined room: ${conversationId}`);
    });

    // 💬 Send Message
    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, text } = data;

        if (!conversationId || !text) return;

        // 💾 Save to DB
        const newMessage = await Message.create({
          conversationId,
          sender: socket.userId,
          text,
        });

        console.log("💾 Message saved:", newMessage.text);

        // 📤 Emit to room
        io.to(conversationId).emit("receiveMessage", newMessage);

      } catch (err) {
        console.log("❌ Message save error:", err.message);
      }
    });

    // ❌ Disconnect
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.userId);
    });
  });
};

export default initSocket;