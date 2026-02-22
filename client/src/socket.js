import { io } from "socket.io-client";

const socketConnect = (token) => {
  return io("http://localhost:5000", {
    auth: { token },
  });
};

export default socketConnect;