import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getGuardiansRequest,
    registerGuardianRequest,
    deleteGuardianRequest,
    updateGuardianRequest,
    getMyChildrenRequest,
} from "../services/guardian.service";

export const getGuardians = createAsyncThunk(
    "guardians/getGuardians",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getGuardiansRequest(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const registerGuardian = createAsyncThunk(
    "guardians/registerGuardian",
    async (guardianData, { rejectWithValue }) => {
        try {
            const response = await registerGuardianRequest(guardianData);

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

export const deleteGuardian = createAsyncThunk(
    "guardians/deleteGuardian",
    async (guardianId, { rejectWithValue }) => {
        try {
            const response = await deleteGuardianRequest(guardianId);

            return { ...response, guardianId };
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
            });
        }
    }
);

export const updateGuardian = createAsyncThunk(
    "guardians/updateGuardian",
    async ({ guardianId, ...guardianData }, { rejectWithValue }) => {
        try {
            const response = await updateGuardianRequest(
                guardianId,
                guardianData
            );

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

export const getMyChildren = createAsyncThunk(
    "guardians/getMyChildren",
    async (_, { rejectWithValue }) => {
        try {
            return await getMyChildrenRequest();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
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
    guardiansList: {
        data: null,
        loading: false,
        error: null,
        tableActions: {
            search: "",
            page: 1,
            limit: 15,
        },
    },
    myChildren: {
        data: null,
        loading: false,
        error: null,
    },
};

const guardianSlice = createSlice({
    name: "guardians",
    initialState,
    reducers: {
        clearGuardianRegisterAlerts(state) {
            state.registerData.message = null;
            state.registerData.error = null;
        },
        clearGuardianDeleteMessage(state) {
            state.deleteData.message = null;
        },
        clearGuardianDeleteError(state) {
            state.deleteData.error = null;
        },

        clearGuardinaUpdateAlerts(state) {
            state.updateData.message = null;
            state.updateData.error = null;
        },
        handleTableActions(state, action) {
            const { key, value } = action.payload;

            switch (key) {
                case "search":
                    state.guardiansList.tableActions.search = value;
                    break;
                case "page":
                    state.guardiansList.tableActions.page = value;
                    break;
                case "limit":
                    state.guardiansList.tableActions.limit = value;
                    break;
                default:
                    break;
            }
        },
    },
    extraReducers: (builder) => {
        // Register Guardian
        builder
            .addCase(registerGuardian.pending, (state) => {
                state.registerData.message = null;
                state.registerData.registering = true;
                state.registerData.error = null;
            })
            .addCase(registerGuardian.fulfilled, (state, action) => {
                state.registerData.message = action.payload.message;
                state.registerData.registering = false;
                state.registerData.error = null;
            })
            .addCase(registerGuardian.rejected, (state, action) => {
                state.registerData.message = null;
                state.registerData.registering = false;
                state.registerData.error = action.payload;
            });

        // Get Guardians
        builder
            .addCase(getGuardians.pending, (state) => {
                state.guardiansList.loading = true;
                state.guardiansList.error = null;
            })
            .addCase(getGuardians.fulfilled, (state, action) => {
                state.guardiansList.loading = false;
                state.guardiansList.data = action.payload;
                state.guardiansList.error = null;
            })
            .addCase(getGuardians.rejected, (state, action) => {
                state.guardiansList.loading = false;
                state.guardiansList.error = action.payload;
            });

        // Delete Guardian
        builder
            .addCase(deleteGuardian.pending, (state) => {
                state.deleteData.deleting = true;
                state.deleteData.message = null;
                state.deleteData.error = null;
            })
            .addCase(deleteGuardian.fulfilled, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = action.payload.message;
                state.deleteData.error = null;

                state.guardiansList.data.guardians =
                    state.guardiansList.data.guardians.filter(
                        (guardian) => guardian._id !== action.payload.guardianId
                    );
            })
            .addCase(deleteGuardian.rejected, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = null;
                state.deleteData.error = action.payload;
            });

        // Update Guardian
        builder
            .addCase(updateGuardian.pending, (state) => {
                state.updateData.updating = true;
                state.updateData.message = null;
                state.updateData.error = null;
            })
            .addCase(updateGuardian.fulfilled, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = action.payload.message;
                state.updateData.error = null;
            })
            .addCase(updateGuardian.rejected, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = null;
                state.updateData.error = action.payload;
            });

        // Get My Children (parent self-service)
        builder
            .addCase(getMyChildren.pending, (state) => {
                state.myChildren.loading = true;
                state.myChildren.error = null;
            })
            .addCase(getMyChildren.fulfilled, (state, action) => {
                state.myChildren.loading = false;
                state.myChildren.data = action.payload;
                state.myChildren.error = null;
            })
            .addCase(getMyChildren.rejected, (state, action) => {
                state.myChildren.loading = false;
                state.myChildren.error = action.payload;
            });
    },
});

export const {
    clearGuardianRegisterAlerts,
    clearGuardianDeleteMessage,
    clearGuardianDeleteError,
    clearGuardinaUpdateAlerts,
    handleTableActions,
} = guardianSlice.actions;

export default guardianSlice.reducer;
