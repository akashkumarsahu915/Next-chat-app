import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '../../types';

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  messages: Record<string, Message[]>;
  isTyping: Record<string, boolean>;
}

const initialState: ChatState = {
  chats: [],
  selectedChatId: null,
  messages: {},
  isTyping: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setSelectedChat: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: Message[] }>) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      console.log(`[REDUX] addMessage called for chatId: ${chatId}`, message);
      
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      // Check if message already exists (to avoid duplicates from history vs real-time)
      const exists = state.messages[chatId].some(m => m._id === message._id);
      if (!exists) {
        state.messages[chatId].push(message);
        console.log('[REDUX] Message added to state successfully');
      } else {
        console.warn('[REDUX] Message already exists, skipping duplicate addition');
      }
    },
    deleteMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].filter(m => m._id !== messageId);
      }
    },
    setTyping: (state, action: PayloadAction<{ chatId: string; isTyping: boolean }>) => {
      state.isTyping[action.payload.chatId] = action.payload.isTyping;
    },
    updateChatMetadata: (state, action: PayloadAction<{ 
      chatId: string; 
      lastMessage: Message; 
      userId?: string 
    }>) => {
      const { chatId, lastMessage, userId } = action.payload;
      console.log(`[REDUX] updateChatMetadata called for chatId: ${chatId}`, lastMessage);
      
      const chatIndex = state.chats.findIndex(c => c._id === chatId);
      
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = lastMessage;
        
        // Get sender ID
        const senderId = typeof lastMessage.senderId === 'string' ? lastMessage.senderId : lastMessage.senderId._id;

        // Only increment unread if:
        // 1. The chat is not currently selected
        // 2. The message is NOT from the current user
        if (state.selectedChatId !== chatId && userId && senderId !== userId) {
          if (!state.chats[chatIndex].unreadCounts) {
            state.chats[chatIndex].unreadCounts = {};
          }
          const currentCount = state.chats[chatIndex].unreadCounts[userId] || 0;
          state.chats[chatIndex].unreadCounts[userId] = currentCount + 1;
          console.log(`[REDUX] Unread count incremented for user ${userId}`);
        } else {
          console.log('[REDUX] Unread count NOT incremented (chat active or self-message)');
        }
      } else {
        console.error('[REDUX] Chat index not found in updateChatMetadata');
      }
    },


    markAsReadSuccess: (state, action: PayloadAction<{ chatId: string; userId: string }>) => {
      const { chatId, userId } = action.payload;
      const chatIndex = state.chats.findIndex(c => c._id === chatId);
      if (chatIndex !== -1 && state.chats[chatIndex].unreadCounts) {
        state.chats[chatIndex].unreadCounts![userId] = 0;
      }
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      const onlineIds = action.payload;
      state.chats.forEach(chat => {
        chat.participants.forEach(p => {
          p.isOnline = onlineIds.includes(p._id);
        });
      });
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      const updatedChat = action.payload;
      console.log(`[REDUX] updateChat called for chatId: ${updatedChat._id}`, updatedChat);
      
      const chatIndex = state.chats.findIndex(c => c._id === updatedChat._id);
      if (chatIndex !== -1) {
        // Update existing chat
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          ...updatedChat
        };
        console.log('[REDUX] Chat successfully updated in state');
      } else {
        // Add new chat
        state.chats.unshift(updatedChat);
        console.log('[REDUX] New chat dynamically added to state');
      }

      // Sort chats by updatedAt (most recent first)
      state.chats.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      });
      console.log('[REDUX] Chat list sorted by recency');
    },


  },
});

export const { 
  setChats, 
  setSelectedChat, 
  setMessages, 
  addMessage, 
  deleteMessage, 
  setTyping,
  updateChatMetadata,
  markAsReadSuccess,
  setOnlineUsers,
  updateChat
} = chatSlice.actions;



export default chatSlice.reducer;
