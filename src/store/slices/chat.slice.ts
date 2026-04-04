import apiSlice from "../rtk/apislice";
import { Chat } from "../../types";

const chatApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        accessChat: builder.mutation<Chat, { userId: string }>({
            query: (body) => ({
                url: "/api/chats",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Chats"],
        }),
    }),
});

export const { 
    useAccessChatMutation,
} = chatApi;
export default chatApi;
