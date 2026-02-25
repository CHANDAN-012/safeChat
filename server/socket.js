import jwt from "jsonwebtoken";
import Message from "./models/Message.js";

const initSocket = (io) => {

  io.on("connection", (socket) => {

    console.log("🟢 User connected:", socket.id);

    const token = socket.handshake.auth.token;

if (token) {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  socket.userId = decoded.id;
}

    // ✅ JOIN ROOM
    socket.on("joinRoom", (conversationId) => {
      socket.join(conversationId);
      console.log("Joined room:", conversationId);
    });

    // ✅ SEND MESSAGE
    socket.on("sendMessage", async (data) => {

      try {

        const { conversationId, text } = data;

        // ✅ SAVE MESSAGE DB
        const message = await Message.create({
          conversationId,
          text,
          sender: socket.userId || null,
        });

        // ✅ SEND TO BOTH USERS
        io.to(conversationId).emit(
          "receiveMessage",
          message
        );

      } catch (error) {
        console.log("Message Error:", error);
      }

    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected");
    });

  });

};

export default initSocket;