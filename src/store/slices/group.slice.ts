import apiSlice from "../rtk/apislice";
import { Chat, Message, User } from "../../types";

export const groupApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createGroup: builder.mutation<Chat, { groupName: string; participants: string[] }>({
            query: (body) => ({
                url: "/api/chats/group",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Chats"],
        }),
        sendGroupMessage: builder.mutation<Message, { chatId: string; content: string; type: 'text' | 'image' }>({
            query: ({ chatId, ...body }) => ({
                url: `/api/chats/${chatId}/message`,
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { chatId }) => [{ type: "Messages", id: chatId }, "Chats"],
        }),
        getGroupMessages: builder.query<Message[], string>({
            query: (chatId) => `/api/chats/${chatId}/messages`,
            providesTags: (result, error, chatId) => [{ type: "Messages", id: chatId }],
        }),
        getGroupMembers: builder.query<{ members: User[] }, string>({
            query: (chatId) => `/api/chats/${chatId}/members`,
            providesTags: (result, error, chatId) => [{ type: "GroupMembers", id: chatId }],
        }),
        markGroupChatAsRead: builder.mutation<{ message: string }, string>({
            query: (chatId) => ({
                url: `/api/chats/${chatId}/read`,
                method: "post",
            }),
            invalidatesTags: ["Chats"],
        }),
        addUserToGroup: builder.mutation<Chat, { chatId: string; userId: string }>({
            query: ({ chatId, userId }) => ({
                url: `/api/chats/${chatId}/add-user`,
                method: "POST",
                body: { userId },
            }),
            invalidatesTags: (result, error, { chatId }) => [{ type: "GroupMembers", id: chatId }, "Chats"],
        }),
        removeUserFromGroup: builder.mutation<{ success: boolean; message: string }, { chatId: string; userId: string }>({
            query: ({ chatId, userId }) => ({
                url: `/api/chats/${chatId}/remove-user/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { chatId }) => [{ type: "GroupMembers", id: chatId }, "Chats"],
        }),
    }),
});

export const {
    useCreateGroupMutation,
    useSendGroupMessageMutation,
    useGetGroupMessagesQuery,
    useMarkGroupChatAsReadMutation,
    useAddUserToGroupMutation,
    useGetGroupMembersQuery,
    useRemoveUserFromGroupMutation,
} = groupApi;
