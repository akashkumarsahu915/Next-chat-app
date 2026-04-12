import apiSlice from "../rtk/apislice";

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<{ message: string; imageUrl: string }, FormData>({
      query: (formData) => ({
        url: "/api/upload/profile",
        method: "POST",
        body: formData,
      }),
    }),
    updateProfile: builder.mutation<any, {
      username: string;
      bio: string;
      avatar: string;
      isPrivate: boolean;
      interests: string[];
      location: string[];
      notificationSettings: {
        pushEnabled: boolean;
        newMessages: boolean;
        friendRequests: boolean;
        systemAlerts: boolean;
      };
    }>({
      query: (body) => ({
        url: "/user/update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Friends"], // Assuming this might affect user data seen by friends
    }),
  }),
});

export const { useUploadImageMutation, useUpdateProfileMutation } = settingsApi;