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
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      // Check if message already exists (to avoid duplicates from history vs real-time)
      const exists = state.messages[chatId].some(m => m._id === message._id);
      if (!exists) {
        state.messages[chatId].push(message);
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
  },
});

export const { setChats, setSelectedChat, setMessages, addMessage, deleteMessage, setTyping } = chatSlice.actions;
export default chatSlice.reducer;
