import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { createSocketConnection } from '../lib/sockets/socket';
import { setOnlineUsers, updateChat } from '../store/slices/chatSlice';
import { incomingCall, acceptCall, endCall } from '../store/slices/callSlice';
import { addToast } from '../store/slices/toastSlice';
import { Chat, User } from '../types';


interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let newSocket: Socket | null = null;

    if (isAuthenticated && token) {
      console.log('Initializing fresh socket connection...');
      newSocket = createSocketConnection(token);

      newSocket.on('connect', () => {
        console.log(`[Socket] Connected: ${newSocket?.id}`);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log(`[Socket] Disconnected: ${reason}`);
        setIsConnected(false);
      });

      const handleOnlineUsers = (onlineIds: string[]) => {
        dispatch(setOnlineUsers(onlineIds));
      };

      const handleUpdateChat = (updatedChat: Chat) => {
        console.log('[DEBUG] Received update_chat event globally:', updatedChat);
        dispatch(updateChat(updatedChat));
      };

      const handleIncomingCall = ({ from, chatId }: { from: User; chatId: string }) => {
        console.log('[Socket] Incoming call from:', from.username);
        dispatch(incomingCall({ caller: from, chatId }));
      };

      const handleCallAccepted = ({ signal }: { signal: any }) => {
        console.log('[Socket] Call accepted');
        dispatch(acceptCall());
      };

      const handleCallRejected = () => {
        console.log('[Socket] Call rejected');
        dispatch(endCall());
        dispatch(addToast({ message: 'Call rejected', type: 'info' }));
      };

      const handleCallEnded = () => {
        console.log('[Socket] Call ended by other party');
        dispatch(endCall());
        dispatch(addToast({ message: 'Call ended', type: 'info' }));
      };

      newSocket.on('online_users', handleOnlineUsers);
      newSocket.on('update_chat', handleUpdateChat);
      newSocket.on('incoming_call', handleIncomingCall);
      newSocket.on('call_accepted', handleCallAccepted);
      newSocket.on('call_rejected', handleCallRejected);
      newSocket.on('call_ended', handleCallEnded);

      newSocket.on('reconnect', (attempt) => {

        console.log(`[Socket] Reconnected after ${attempt} attempts`);
        setIsConnected(true);
      });

      newSocket.on('reconnect_attempt', (attempt) => {
        console.log(`[Socket] Reconnecting (attempt ${attempt})...`);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('[Socket] Reconnection error:', error);
      });

      newSocket.on('connect_error', (error) => {
        console.error('[Socket] Initial connection error:', error.message);
        // Ensure state is updated correctly if connection fails immediately
        setIsConnected(false);
      });

      // DEBUG: Log EVERY incoming event to see raw data flow
      newSocket.onAny((eventName, ...args) => {
        console.log(`[DEBUG] Raw Socket Event: ${eventName}`, args);
      });

      setSocket(newSocket);
    }


    return () => {
      if (newSocket) {
        console.log('[Socket] Cleaning up connection...');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, token]);



  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
