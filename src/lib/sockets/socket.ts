import { io, Socket } from "socket.io-client";

const socketUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const createSocketConnection = (token: string): Socket => {
  return io(socketUrl, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });
};
 