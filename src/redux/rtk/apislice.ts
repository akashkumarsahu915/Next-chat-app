import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store";

const baseurl = import.meta.env.VITE_BASE_URL;

export const apiSlice = createApi({
    reducerPath: "apiSlice",
    baseQuery: fetchBaseQuery({
        baseUrl: baseurl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth?.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: () => ({}),
});

export default apiSlice;