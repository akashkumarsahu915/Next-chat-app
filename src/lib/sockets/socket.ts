import { io, Socket } from "socket.io-client";

const URL = "http://localhost:8080";

export const socket: Socket = io(URL, {
    query: {
        userId: "test_user_123", // 🔥 temporary
    },
    transports: ["websocket"], // 🔥 avoids polling issues
}); 