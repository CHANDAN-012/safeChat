import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const Chat = () => {

  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);

  const isMobile = window.innerWidth < 768;

  // ✅ Decode user
  const getMyId = () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const myId = getMyId();

  // ✅ GET USERS
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await axios.get("/api/chat/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(data);
    };

    fetchUsers();
  }, []);

  // ✅ START CHAT
  const startChat = async (user) => {

    setSelectedUser(user);

    const { data } = await axios.post(
      "/api/chat/conversation",
      { receiverId: user._id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setConversationId(data._id);

    const res = await axios.get(
      `/api/chat/messages/${data._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessages(res.data);
  };

  // ✅ SOCKET
  useEffect(() => {

    if (!conversationId) return;

    const newSocket = io();

    setSocket(newSocket);

    newSocket.emit("joinRoom", conversationId);

    newSocket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.disconnect();

  }, [conversationId]);

  // ✅ SEND MESSAGE
  const sendMessage = () => {

    if (!text.trim()) return;

    socket.emit("sendMessage", {
      conversationId,
      text,
    });

    setMessages((prev) => [
      ...prev,
      {
        text,
        sender: myId,
      },
    ]);

    setText("");
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={styles.container(isMobile)}>

      {/* SIDEBAR */}
      <div style={styles.sidebar(isMobile)}>

        <h2>SafeChat 💬</h2>

        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => startChat(user)}
            style={styles.user}
          >
            {user.name}
          </div>
        ))}

        <button onClick={logout} style={styles.logout}>
          Logout
        </button>

      </div>

      {/* CHAT AREA */}
      <div style={styles.chatArea}>

        {selectedUser ? (
          <>
            <div style={styles.header}>
              {selectedUser.name}
            </div>

            <div style={styles.messages}>

              {messages.map((msg, i) => {

                const isMe =
                  msg.sender?.toString() === myId;

                return (
                  <div
                    key={i}
                    style={{
                      ...styles.message,
                      alignSelf: isMe
                        ? "flex-end"
                        : "flex-start",
                      background: isMe
                        ? "#22c55e"
                        : "#1e293b",
                    }}
                  >
                    {msg.text}
                  </div>
                );
              })}

            </div>

            <div style={styles.inputArea}>

              <input
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
                placeholder="Type message..."
                style={styles.input}
              />

              <button
                onClick={sendMessage}
                style={styles.send}
              >
                Send
              </button>

            </div>
          </>
        ) : (
          <div style={styles.select}>
            Select user to chat
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {

  container: (mobile) => ({
    display: "flex",
    flexDirection: mobile ? "column" : "row",
    height: "100vh",
    background: "#020617",
    color: "white",
  }),

  sidebar: (mobile) => ({
    width: mobile ? "100%" : "280px",
    background: "#020617",
    padding: "20px",
    borderRight: "1px solid #1e293b",
  }),

  user: {
    padding: "12px",
    marginTop: "10px",
    background: "#1e293b",
    borderRadius: "8px",
    cursor: "pointer",
  },

  logout: {
    marginTop: "20px",
    background: "red",
    border: "none",
    padding: "10px",
    width: "100%",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px",
  },

  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  header: {
    padding: "15px",
    background: "#020617",
    borderBottom: "1px solid #1e293b",
  },

  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  message: {
    padding: "12px 16px",
    borderRadius: "12px",
    maxWidth: "70%",
  },

  inputArea: {
    display: "flex",
    padding: "15px",
    background: "#020617",
  },

  input: {
    flex: 1,
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
  },

  send: {
    marginLeft: "10px",
    padding: "14px 20px",
    background: "#22c55e",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px",
  },

  select: {
    margin: "auto",
    fontSize: "20px",
    opacity: 0.7,
  },
};

export default Chat;