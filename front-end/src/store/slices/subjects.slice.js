import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getSubjectsRequest,
    createSubjectRequest,
    updateSubjectRequest,
    deleteSubjectRequest,
} from "../services/subjects.service";

export const getSubjects = createAsyncThunk(
    "subjects/getSubjects",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getSubjectsRequest(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createSubject = createAsyncThunk(
    "subjects/createSubject",
    async (subjectData, { rejectWithValue }) => {
        try {
            const response = await createSubjectRequest(subjectData);

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

export const updateSubject = createAsyncThunk(
    "subjects/updateSubject",
    async ({ subjectId, ...subjectData }, { rejectWithValue }) => {
        try {
            const response = await updateSubjectRequest(subjectId, subjectData);

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

export const deleteSubject = createAsyncThunk(
    "subjects/deleteSubject",
    async (subjectId, { rejectWithValue }) => {
        try {
            const response = await deleteSubjectRequest(subjectId);

            return { ...response, subjectId };
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
    subjectsList: {
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

const subjectsSlice = createSlice({
    name: "subjects",
    initialState,
    reducers: {
        clearSubjectsMessage(state) {
            state.registerData.message = null;
        },
        clearSubjectsError(state) {
            state.registerData.error = null;
        },
        clearSubjectDeleteMessage(state) {
            state.deleteData.message = null;
        },
        clearSubjectDeleteError(state) {
            state.deleteData.error = null;
        },
        clearSubjectUpdateMessage(state) {
            state.updateData.message = null;
        },
        clearSubjectUpdateError(state) {
            state.updateData.error = null;
        },
        handleTableActions(state, action) {
            const { key, value } = action.payload;

            switch (key) {
                case "search":
                    state.subjectsList.tableActions.search = value;
                    break;
                case "page":
                    state.subjectsList.tableActions.page = value;
                    break;
                case "limit":
                    state.subjectsList.tableActions.limit = value;
                    break;
                default:
                    break;
            }
        },
    },
    extraReducers: (builder) => {
        // Create Subject
        builder
            .addCase(createSubject.pending, (state) => {
                state.registerData.message = null;
                state.registerData.registering = true;
                state.registerData.error = null;
            })
            .addCase(createSubject.fulfilled, (state, action) => {
                state.registerData.message = action.payload.message;
                state.registerData.registering = false;
                state.registerData.error = null;
            })
            .addCase(createSubject.rejected, (state, action) => {
                state.registerData.message = null;
                state.registerData.registering = false;
                state.registerData.error = action.payload;
            });

        // Get Subjects
        builder
            .addCase(getSubjects.pending, (state) => {
                state.subjectsList.loading = true;
                state.subjectsList.error = null;
            })
            .addCase(getSubjects.fulfilled, (state, action) => {
                state.subjectsList.loading = false;
                state.subjectsList.data = action.payload;
                state.subjectsList.error = null;
            })
            .addCase(getSubjects.rejected, (state, action) => {
                state.subjectsList.loading = false;
                state.subjectsList.error = action.payload;
            });

        // Delete Subject
        builder
            .addCase(deleteSubject.pending, (state) => {
                state.deleteData.deleting = true;
                state.deleteData.message = null;
                state.deleteData.error = null;
            })
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = action.payload.message;
                state.deleteData.error = null;

                state.subjectsList.data.subjects =
                    state.subjectsList.data.subjects.filter(
                        (subject) => subject._id !== action.payload.subjectId
                    );
            })
            .addCase(deleteSubject.rejected, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = null;
                state.deleteData.error = action.payload;
            });

        // Update Subject
        builder
            .addCase(updateSubject.pending, (state) => {
                state.updateData.updating = true;
                state.updateData.message = null;
                state.updateData.error = null;
            })
            .addCase(updateSubject.fulfilled, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = action.payload.message;
                state.updateData.error = null;
            })
            .addCase(updateSubject.rejected, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = null;
                state.updateData.error = action.payload;
            });
    },
});

export const {
    clearSubjectsMessage,
    clearSubjectsError,
    clearSubjectDeleteMessage,
    clearSubjectDeleteError,
    clearSubjectUpdateMessage,
    clearSubjectUpdateError,
    handleTableActions,
} = subjectsSlice.actions;

export default subjectsSlice.reducer;
