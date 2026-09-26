import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAnnouncementsRequest,
    getAnnouncementByIdRequest,
    createAnnouncementRequest,
    updateAnnouncementRequest,
    deleteAnnouncementRequest,
} from "../services/announcements.service";

export const getAnnouncements = createAsyncThunk(
    "announcements/getAnnouncements",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getAnnouncementsRequest(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getAnnouncementById = createAsyncThunk(
    "announcements/getAnnouncementById",
    async (announcementId, { rejectWithValue }) => {
        try {
            return await getAnnouncementByIdRequest(announcementId);
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
            });
        }
    }
);

export const createAnnouncement = createAsyncThunk(
    "announcements/createAnnouncement",
    async (announcementData, { rejectWithValue }) => {
        try {
            const response = await createAnnouncementRequest(announcementData);

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

export const updateAnnouncement = createAsyncThunk(
    "announcements/updateAnnouncement",
    async ({ announcementId, ...announcementData }, { rejectWithValue }) => {
        try {
            const response = await updateAnnouncementRequest(
                announcementId,
                announcementData
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

export const deleteAnnouncement = createAsyncThunk(
    "announcements/deleteAnnouncement",
    async (announcementId, { rejectWithValue }) => {
        try {
            const response = await deleteAnnouncementRequest(announcementId);

            return { ...response, announcementId };
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
    announcementsList: {
        data: null,
        loading: false,
        error: null,
        tableActions: {
            search: "",
            startDate: "",
            endDate: "",
            page: 1,
            limit: 15,
        },
    },
    announcementDetails: {
        data: null,
        loading: false,
        error: null,
    },
};

const announcementsSlice = createSlice({
    name: "announcements",
    initialState,
    reducers: {
        clearAnnouncementsRegisterAlerts(state) {
            state.registerData.message = null;
            state.registerData.error = null;
        },
        clearAnnouncementsDeleteAlerts(state) {
            state.deleteData.message = null;
            state.deleteData.error = null;
        },
        clearAnnouncementsUpdateAlerts(state) {
            state.updateData.message = null;
            state.updateData.error = null;
        },
        handleTableActions(state, action) {
            const { key, value } = action.payload;

            switch (key) {
                case "search":
                    state.announcementsList.tableActions.search = value;
                    break;
                case "startDate":
                    state.announcementsList.tableActions.startDate = value;
                    break;
                case "endDate":
                    state.announcementsList.tableActions.endDate = value;
                    break;
                case "page":
                    state.announcementsList.tableActions.page = value;
                    break;
                case "limit":
                    state.announcementsList.tableActions.limit = value;
                    break;
                default:
                    break;
            }
        },
    },
    extraReducers: (builder) => {
        // Create Announcement
        builder
            .addCase(createAnnouncement.pending, (state) => {
                state.registerData.message = null;
                state.registerData.registering = true;
                state.registerData.error = null;
            })
            .addCase(createAnnouncement.fulfilled, (state, action) => {
                state.registerData.message = action.payload.message;
                state.registerData.registering = false;
                state.registerData.error = null;
            })
            .addCase(createAnnouncement.rejected, (state, action) => {
                state.registerData.message = null;
                state.registerData.registering = false;
                state.registerData.error = action.payload;
            });

        // Get Announcements
        builder
            .addCase(getAnnouncements.pending, (state) => {
                state.announcementsList.loading = true;
                state.announcementsList.error = null;
            })
            .addCase(getAnnouncements.fulfilled, (state, action) => {
                state.announcementsList.loading = false;
                state.announcementsList.data = action.payload;
                state.announcementsList.error = null;
            })
            .addCase(getAnnouncements.rejected, (state, action) => {
                state.announcementsList.loading = false;
                state.announcementsList.error = action.payload;
            });

        // Get Announcement By Id
        builder
            .addCase(getAnnouncementById.pending, (state) => {
                state.announcementDetails.loading = true;
                state.announcementDetails.error = null;
            })
            .addCase(getAnnouncementById.fulfilled, (state, action) => {
                state.announcementDetails.loading = false;
                state.announcementDetails.data = action.payload.announcement;
                state.announcementDetails.error = null;
            })
            .addCase(getAnnouncementById.rejected, (state, action) => {
                state.announcementDetails.loading = false;
                state.announcementDetails.error = action.payload;
            });

        // Delete Announcement
        builder
            .addCase(deleteAnnouncement.pending, (state) => {
                state.deleteData.deleting = true;
                state.deleteData.message = null;
                state.deleteData.error = null;
            })
            .addCase(deleteAnnouncement.fulfilled, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = action.payload.message;
                state.deleteData.error = null;

                if (state.announcementsList.data?.announcements) {
                    state.announcementsList.data.announcements =
                        state.announcementsList.data.announcements.filter(
                            (announcement) =>
                                announcement._id !==
                                action.payload.announcementId
                        );
                }
            })
            .addCase(deleteAnnouncement.rejected, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = null;
                state.deleteData.error = action.payload;
            });

        // Update Announcement
        builder
            .addCase(updateAnnouncement.pending, (state) => {
                state.updateData.updating = true;
                state.updateData.message = null;
                state.updateData.error = null;
            })
            .addCase(updateAnnouncement.fulfilled, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = action.payload.message;
                state.updateData.error = null;
            })
            .addCase(updateAnnouncement.rejected, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = null;
                state.updateData.error = action.payload;
            });
    },
});

export const {
    clearAnnouncementsRegisterAlerts,
    clearAnnouncementsDeleteAlerts,
    clearAnnouncementsUpdateAlerts,
    handleTableActions,
} = announcementsSlice.actions;

export default announcementsSlice.reducer;
