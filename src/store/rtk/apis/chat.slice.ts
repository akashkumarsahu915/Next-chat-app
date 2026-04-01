import { apiSlice } from "../apislice";
import { Chat, Message } from "../../../types";

export interface GetChatsResponse {
  success: boolean;
  chats: Chat[];
  count: number;
}

export interface GetMessagesResponse {
  success: boolean;
  messages: Message[];
}

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<GetChatsResponse, void>({
      query: () => "/api/chats",
      providesTags: ["Chats"],
    }),
    getMessages: builder.query<GetMessagesResponse, { chatId: string; page?: number; limit?: number }>({
      query: ({ chatId, page = 1, limit = 20 }) => `/api/message/${chatId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { chatId }) => [{ type: "Messages", id: chatId }],
    }),
    sendMessage: builder.mutation<{ success: boolean; message: Message }, { chatId: string; content: string; type: string }>({
      query: (body) => ({
        url: "/api/message",
        method: "POST",
        body,
      }),
      // Invalidate tags so the sidebar unread counts and conversation list update
      invalidatesTags: (result, error, { chatId }) => [{ type: "Messages", id: chatId }, "Chats"],
    }),
    markChatAsRead: builder.mutation<{ success: boolean }, string>({
      query: (chatId) => ({
        url: `/api/messages/read/${chatId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Chats"], // Invalidate so unread counts refresh
    }),
  }),
});

export const { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation, useMarkChatAsReadMutation } = chatApi;
