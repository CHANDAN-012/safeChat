import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const token = localStorage.getItem("token");

  // ⚠️ YAHAN APNA REAL CONVERSATION ID DALO
  const conversationId = "698d3e75d53d64bafef7ad86";

  // 🔓 Decode userId from JWT
  const getUserIdFromToken = () => {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  };

  const myUserId = getUserIdFromToken();

  useEffect(() => {
    if (!token) {
      console.log("❌ No token found");
      return;
    }

    const newSocket = io("http://localhost:5000", {
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Connected:", newSocket.id);

      // Join conversation room
      newSocket.emit("joinConversation", conversationId);
    });

    newSocket.on("receiveMessage", (msg) => {
      console.log("📩 Message received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("connect_error", (err) => {
      console.log("❌ Socket error:", err.message);
    });

    return () => newSocket.disconnect();
  }, [token]);

  const sendMessage = () => {
    if (!socket || !text.trim()) return;

    socket.emit("sendMessage", {
      conversationId,
      text,
    });

    setText("");
  };

  return (
  <div
    style={{
      height: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Header */}
    <div
      style={{
        padding: "15px",
        borderBottom: "1px solid #1e293b",
        fontWeight: "bold",
        fontSize: "18px",
      }}
    >
      SafeChat 💬
    </div>

    {/* Messages */}
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {messages.map((msg, index) => {
        const isMe = msg.sender === myUserId;

        return (
          <div
            key={index}
            style={{
              alignSelf: isMe ? "flex-end" : "flex-start",
              backgroundColor: isMe ? "#22c55e" : "#334155",
              padding: "12px 16px",
              borderRadius: "16px",
              maxWidth: "70%",
              fontSize: "15px",
            }}
          >
            {msg.text}
          </div>
        );
      })}
    </div>

  {/* Input Section */}
<div
  style={{
    padding: "15px",
    borderTop: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  }}
>
  <input
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Type message..."
    style={{
      width: "100%",
      padding: "16px",
      borderRadius: "12px",
      border: "none",
      fontSize: "16px",
    }}
  />

  <button
    onClick={sendMessage}
    style={{
      width: "100%",
      padding: "16px",
      background: "#22c55e",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    Send
  </button>
</div>
  </div>
);
};

export default Chat;