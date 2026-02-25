import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Home from "./pages/Home";

function App() {

  const token = localStorage.getItem("token");

  return (
    <Routes>

      <Route
        path="/"
        element={token ? <Home /> : <Navigate to="/login" />}
      />

      <Route
        path="/chat"
        element={token ? <Chat /> : <Navigate to="/login" />}
      />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

    </Routes>
  );
}

export default App;