import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
    userLoginRequest,
    getUserProfileRequest,
} from "../services/auth.service";

export const userLogin = createAsyncThunk(
    "user/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await userLoginRequest(credentials);

            return response;
        } catch (error) {
            let currentError = {
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
            };

            if (error.response?.data?.errors) {
                currentError.errors = error.response?.data?.errors;
            }

            return rejectWithValue({
                ...currentError,
            });
        }
    }
);

export const getUserProfile = createAsyncThunk(
    "user/profile",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await getUserProfileRequest(credentials);

            return response;
        } catch (error) {
            let currentError = {
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "An error occurred",
                statusCode: error.response?.status,
            };

            if (error.response?.data?.errors) {
                currentError.errors = error.response?.data?.errors;
            }

            return rejectWithValue({
                ...currentError,
            });
        }
    }
);

export const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        loading: false,
        error: null,
        accessToken: localStorage.getItem("accessToken") || null,
    },
    reducers: {
        userLogOut: (state) => {
            state.user = null;
            state.accessToken = null;
            localStorage.removeItem("accessToken");
        },
    },
    extraReducers: (builder) => {
        // Handle user login actions
        builder
            .addCase(userLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                localStorage.setItem("accessToken", action.payload.accessToken);
            })
            .addCase(userLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Handle get user profile actions
        builder
            .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { userLogOut } = userSlice.actions;

export default userSlice.reducer;
