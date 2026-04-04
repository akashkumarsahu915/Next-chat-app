import apiSlice from "../rtk/apislice";
import { User } from "../../types";

export interface RequestStatusResponse {
    success: boolean;
    data: {
        incoming: Array<{
            _id: string;
            from: {
                username: string;
                profilePicture: string;
                _id: string; // usually present in response though not in user snippet
            };
            status: string;
            createdAt?: string; // added for UI compatibility
        }>;
        outgoing: Array<{
            _id: string;
            to: {
                username: string;
                profilePicture: string;
                _id: string;
            };
            status: string;
            createdAt?: string;
        }>;
        count: {
            incoming: number;
            outgoing: number;
        };
    };
}

export interface FriendListResponse {
    success: boolean;
    friends: User[];
    count: number;
}

const friendsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFriends: builder.query<any, void>({
            query: () => "/friends",
            providesTags: ["Friends"],
        }),
        getFriendList: builder.query<FriendListResponse, void>({
            query: () => "/friend-request/friend-list",
            providesTags: ["Friends"],
        }),
        getFriendRequests: builder.query<RequestStatusResponse, void>({
            query: () => "/friend-request/request-status",
            providesTags: ["FriendRequest"],
        }),
        searchUsers: builder.query<User[], string>({
            query: (search) => `/user/search?search=${search}`,
        }),
        locateUsers: builder.query<User[], string>({
            query: (search) => `/user/locate-users?search=${search}`,
        }),
        sendFriendRequest: builder.mutation<any, { receiverId: string }>({
            query: (body) => ({
                url: "/friend-request/send-request",
                method: "POST",
                body,
            }),
            invalidatesTags: ["FriendRequest"],
        }),
        respondToFriendRequest: builder.mutation<any, { requestId: string, action: 'accepted' | 'rejected' }>({
            query: ({ requestId, action }) => ({
                url: `/friend-request/respond/${requestId}`,
                method: "POST",
                body: { action },
            }),
            invalidatesTags: (result, error, { action }) => 
                action === 'accepted' ? ["FriendRequest", "Friends"] : ["FriendRequest"],
        }),
    }),
});

export const { 
    useGetFriendsQuery, 
    useGetFriendListQuery,
    useGetFriendRequestsQuery, 
    useSearchUsersQuery, 
    useLocateUsersQuery,
    useSendFriendRequestMutation,
    useRespondToFriendRequestMutation,
} = friendsApi;
export default friendsApi;