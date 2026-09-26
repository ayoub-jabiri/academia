import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    registerUserRequest,
    getUsersRequest,
    getUserByIdRequest,
    updateUserRequest,
} from "../services/users.service";

export const registerUser = createAsyncThunk(
    "users/registerUser",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await registerUserRequest(userData);

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

export const getUsers = createAsyncThunk(
    "users/getUsers",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getUsersRequest(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getUserById = createAsyncThunk(
    "users/getUserById",
    async (userId, { rejectWithValue }) => {
        try {
            return await getUserByIdRequest(userId);
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
            });
        }
    }
);

export const updateUser = createAsyncThunk(
    "users/updateUser",
    async ({ userId, ...userData }, { rejectWithValue }) => {
        try {
            const response = await updateUserRequest(userId, userData);

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

const initialState = {
    registerData: {
        message: null,
        registering: false,
        error: null,
    },
    updateData: {
        message: null,
        updating: false,
        error: null,
    },
    usersList: {
        data: null,
        loading: false,
        error: null,
        tableActions: {
            search: "",
            role: "",
            page: 1,
            limit: 15,
        },
    },
    userDetails: {
        data: null,
        loading: false,
        error: null,
    },
};

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearUsersMessage(state) {
            state.registerData.message = null;
        },
        clearUsersError(state) {
            state.registerData.error = null;
        },
        clearUsersUpdateMessage(state) {
            state.updateData.message = null;
        },
        clearUsersUpdateError(state) {
            state.updateData.error = null;
        },
        handleTableActions(state, action) {
            const { key, value } = action.payload;

            switch (key) {
                case "search":
                    state.usersList.tableActions.search = value;
                    break;
                case "role":
                    state.usersList.tableActions.role = value;
                    break;
                case "page":
                    state.usersList.tableActions.page = value;
                    break;
                case "limit":
                    state.usersList.tableActions.limit = value;
                    break;
                default:
                    break;
            }
        },
    },
    extraReducers: (builder) => {
        // Register User
        builder
            .addCase(registerUser.pending, (state) => {
                state.registerData.message = null;
                state.registerData.registering = true;
                state.registerData.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.registerData.message = action.payload.message;
                state.registerData.registering = false;
                state.registerData.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.registerData.message = null;
                state.registerData.registering = false;
                state.registerData.error = action.payload;
            });

        // Get Users
        builder
            .addCase(getUsers.pending, (state) => {
                state.usersList.loading = true;
                state.usersList.error = null;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.usersList.loading = false;
                state.usersList.data = action.payload;
                state.usersList.error = null;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.usersList.loading = false;
                state.usersList.error = action.payload;
            });

        // Get User By Id
        builder
            .addCase(getUserById.pending, (state) => {
                state.userDetails.loading = true;
                state.userDetails.error = null;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.userDetails.loading = false;
                state.userDetails.data = action.payload.user;
                state.userDetails.error = null;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.userDetails.loading = false;
                state.userDetails.error = action.payload;
            });

        // Update User
        builder
            .addCase(updateUser.pending, (state) => {
                state.updateData.updating = true;
                state.updateData.message = null;
                state.updateData.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = action.payload.message;
                state.updateData.error = null;

                if (state.userDetails.data?._id === action.payload.user._id) {
                    state.userDetails.data = action.payload.user;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = null;
                state.updateData.error = action.payload;
            });
    },
});

export const {
    clearUsersMessage,
    clearUsersError,
    clearUsersUpdateMessage,
    clearUsersUpdateError,
    handleTableActions,
} = usersSlice.actions;

export default usersSlice.reducer;
