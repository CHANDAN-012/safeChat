import { useNavigate } from "react-router-dom";

const Home = () => {

  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      <h1>Welcome to SafeChat 💬</h1>

      <p>
        Private • Secure • Real-Time Chat
      </p>

      <button
        onClick={() => navigate("/chat")}
        style={styles.button}
      >
        Open Chats
      </button>

    </div>
  );
};

const styles = {

  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#0f172a,#1e293b)",
    color: "white",
  },

  button: {
    marginTop: "20px",
    padding: "14px 25px",
    borderRadius: "10px",
    border: "none",
    background: "#22c55e",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },

};

export default Home;