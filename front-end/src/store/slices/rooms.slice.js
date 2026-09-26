import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getRoomsRequest,
    createRoomRequest,
    updateRoomRequest,
    deleteRoomRequest,
} from "../services/rooms.service";

export const getRooms = createAsyncThunk(
    "rooms/getRooms",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getRoomsRequest(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createRoom = createAsyncThunk(
    "rooms/createRoom",
    async (roomData, { rejectWithValue }) => {
        try {
            const response = await createRoomRequest(roomData);

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

export const updateRoom = createAsyncThunk(
    "rooms/updateRoom",
    async ({ roomId, ...roomData }, { rejectWithValue }) => {
        try {
            const response = await updateRoomRequest(roomId, roomData);

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

export const deleteRoom = createAsyncThunk(
    "rooms/deleteRoom",
    async (roomId, { rejectWithValue }) => {
        try {
            const response = await deleteRoomRequest(roomId);

            return { ...response, roomId };
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
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
    deleteData: {
        message: null,
        deleting: false,
        error: null,
    },
    updateData: {
        message: null,
        updating: false,
        error: null,
    },
    roomsList: {
        data: null,
        loading: false,
        error: null,
        tableActions: {
            search: "",
            page: 1,
            limit: 15,
        },
    },
};

const roomsSlice = createSlice({
    name: "rooms",
    initialState,
    reducers: {
        clearRoomsMessage(state) {
            state.registerData.message = null;
        },
        clearRoomsError(state) {
            state.registerData.error = null;
        },
        clearRoomDeleteMessage(state) {
            state.deleteData.message = null;
        },
        clearRoomDeleteError(state) {
            state.deleteData.error = null;
        },
        clearRoomUpdateMessage(state) {
            state.updateData.message = null;
        },
        clearRoomUpdateError(state) {
            state.updateData.error = null;
        },
        handleTableActions(state, action) {
            const { key, value } = action.payload;

            switch (key) {
                case "search":
                    state.roomsList.tableActions.search = value;
                    break;
                case "page":
                    state.roomsList.tableActions.page = value;
                    break;
                case "limit":
                    state.roomsList.tableActions.limit = value;
                    break;
                default:
                    break;
            }
        },
    },
    extraReducers: (builder) => {
        // Create Room
        builder
            .addCase(createRoom.pending, (state) => {
                state.registerData.message = null;
                state.registerData.registering = true;
                state.registerData.error = null;
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.registerData.message = action.payload.message;
                state.registerData.registering = false;
                state.registerData.error = null;
            })
            .addCase(createRoom.rejected, (state, action) => {
                state.registerData.message = null;
                state.registerData.registering = false;
                state.registerData.error = action.payload;
            });

        // Get Rooms
        builder
            .addCase(getRooms.pending, (state) => {
                state.roomsList.loading = true;
                state.roomsList.error = null;
            })
            .addCase(getRooms.fulfilled, (state, action) => {
                state.roomsList.loading = false;
                state.roomsList.data = action.payload;
                state.roomsList.error = null;
            })
            .addCase(getRooms.rejected, (state, action) => {
                state.roomsList.loading = false;
                state.roomsList.error = action.payload;
            });

        // Delete Room
        builder
            .addCase(deleteRoom.pending, (state) => {
                state.deleteData.deleting = true;
                state.deleteData.message = null;
                state.deleteData.error = null;
            })
            .addCase(deleteRoom.fulfilled, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = action.payload.message;
                state.deleteData.error = null;

                state.roomsList.data.rooms = state.roomsList.data.rooms.filter(
                    (room) => room._id !== action.payload.roomId
                );
            })
            .addCase(deleteRoom.rejected, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = null;
                state.deleteData.error = action.payload;
            });

        // Update Room
        builder
            .addCase(updateRoom.pending, (state) => {
                state.updateData.updating = true;
                state.updateData.message = null;
                state.updateData.error = null;
            })
            .addCase(updateRoom.fulfilled, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = action.payload.message;
                state.updateData.error = null;
            })
            .addCase(updateRoom.rejected, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = null;
                state.updateData.error = action.payload;
            });
    },
});

export const {
    clearRoomsMessage,
    clearRoomsError,
    clearRoomDeleteMessage,
    clearRoomDeleteError,
    clearRoomUpdateMessage,
    clearRoomUpdateError,
    handleTableActions,
} = roomsSlice.actions;

export default roomsSlice.reducer;
