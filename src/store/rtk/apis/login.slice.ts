import { LoginRequest, LoginResponse, RegisterRequest } from "../../../types/auth";
import apiSlice from "../apislice";

const loginSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),
        register: builder.mutation<LoginResponse, RegisterRequest>({
            query: (credentials) => ({
                url: "/auth/register",
                method: "POST",
                body: credentials,
            }),
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation } = loginSlice;
export default loginSlice;
