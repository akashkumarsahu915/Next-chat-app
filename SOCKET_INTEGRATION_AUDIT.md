# NexChat: Socket.io Real-Time Synchronization Audit

This document provides a detailed technical overview of how Real-Time Messaging and Synchronization are implemented in NexChat. Use this as a reference for maintenance or when building similar systems in the future.

---

## 1. Core Architecture: The "User-Room" Pattern

### The Problem
In a standard chat, updates (like unread counts or names) are often only sent to the *active* chat room. If a user has multiple tabs open or is looking at their Profile/Settings, they miss updates in the Sidebar.

### The Solution
We implemented the **User-Room Pattern**:
- Every user, upon connecting, joins a private socket room named after their `userId`.
- The Backend emits all metadata updates (`update_chat`) directly to this `userId` room.
- **Result**: Every open session (Tab, Mobile, Desktop) for that user stays perfectly synced in real-time, regardless of which page they are currently viewing.

---

## 2. Installation & Prerequisites

### Dependencies
```bash
npm install socket.io-client
```

### Environment Variables
The client needs to know the Backend URL. This is managed in `.env`:
`VITE_BASE_URL=https://your-backend-url.com`

---

## 3. Implementation Breakdown

### A. Initialization (`src/lib/sockets/socket.ts`)
This is the factory for our socket connection. It handles authentication by passing the JWT token in the `auth` handshake.

```typescript
export const createSocketConnection = (token: string): Socket => {
  return io(socketUrl, {
    auth: { token },
    transports: ["websocket"],
  });
};
```

### B. The Global Provider (`src/context/SocketContext.tsx`)
This is the "Engine Room" of the real-time system.
- **Connection Lifecycle**: Spawns a connection when `isAuthenticated` is true; disconnects on logout.
- **Global Listeners**: Listens for events that affect the *whole app* (like Sidebar updates or Presence).
    - `online_users`: Syncs the list of active users to Redux.
    - `update_chat`: Syncs the latest message, count, and metadata for any chat to Redux.

### C. Component-Level Usage (`src/pages/Dashboard.tsx`)
While global sync is handled by the Provider, specific views (like the active Chat screen) listen for targeted events:
- `join_chat`: Emitted by the client to tell the server "I am focused on this specific conversation."
- `new_message`: Listens for incoming chat bubbles for the *active* chat only.

---

## 4. State Synchronization (Redux Integration)

We use **Redux Toolkit** to bridge the gap between Sockets and the UI.

### The `updateChat` Reducer (`src/store/slices/chatSlice.ts`)
When a socket event arrives, we don't just "show" it; we patch the Redux state:
1. **Find**: Locate the chat in `state.chats` using its `_id`.
2. **Patch**: Overwrite the old metadata with the fresh `updatedChat` object from the server.
3. **Sort**: Move the updated chat to the top of the Sidebar (Recent First).

---

## 5. Socket Event Catalog

| Event Name | Direction | Payload | Usage |
| :--- | :--- | :--- | :--- |
| `connect` | Server -> Client | None | Marks connection as active. |
| `join_chat` | Client -> Server | `chatId` | User enters a specific chat room. |
| `new_message` | Server -> Client | `Message` object | Real-time chat bubble display. |
| `update_chat` | Server -> Client | `Chat` object | **Universal Sync**: Updates Sidebar info & unread counts. |
| `online_users`| Server -> Client | `string[]` | Updates "Online" status dots in the UI. |

---

## 6. Best Practices for Future Use

1. **Cleanup Matters**: Always remove socket listeners (`socket.off(eventName)`) in the `return` of a `useEffect` to prevent memory leaks and duplicate UI updates.
2. **Authorization**: Always pass the `token` in the `auth` header during connection. Don't send sensitive data over raw `emit`s if possible.
3. **Redux over Local State**: For global info (like a Chat List), always pipe socket data into **Redux** rather than local `useState`. This ensures that even if a component unmounts, the data is preserved.

---

### Implementation Status: **AUDITED & VERIFIED**
The current integration is resilient, handles multi-tab synchronization, and includes safe fallbacks for production environments.
