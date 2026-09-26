import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAdminDashboardRequest,
    getTeacherDashboardRequest,
    getStudentDashboardRequest,
    getParentDashboardRequest,
} from "../services/dashboard.service";

export const getAdminDashboard = createAsyncThunk(
    "dashboard/getAdminDashboard",
    async (_, { rejectWithValue }) => {
        try {
            return await getAdminDashboardRequest();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getTeacherDashboard = createAsyncThunk(
    "dashboard/getTeacherDashboard",
    async (_, { rejectWithValue }) => {
        try {
            return await getTeacherDashboardRequest();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getStudentDashboard = createAsyncThunk(
    "dashboard/getStudentDashboard",
    async (_, { rejectWithValue }) => {
        try {
            return await getStudentDashboardRequest();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getParentDashboard = createAsyncThunk(
    "dashboard/getParentDashboard",
    async (_, { rejectWithValue }) => {
        try {
            return await getParentDashboardRequest();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    adminDashboardData: null,
    teacherDashboardData: null,
    studentDashboardData: null,
    parentDashboardData: null,
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Admin Dashboard
        builder
            .addCase(getAdminDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAdminDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.adminDashboardData = action.payload;
                state.error = null;
            })
            .addCase(getAdminDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Teacher Dashboard
        builder
            .addCase(getTeacherDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTeacherDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.teacherDashboardData = action.payload;
                state.error = null;
            })
            .addCase(getTeacherDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Student Dashboard
        builder
            .addCase(getStudentDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getStudentDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.studentDashboardData = action.payload;
                state.error = null;
            })
            .addCase(getStudentDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Parent Dashboard
        builder
            .addCase(getParentDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getParentDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.parentDashboardData = action.payload;
                state.error = null;
            })
            .addCase(getParentDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;
