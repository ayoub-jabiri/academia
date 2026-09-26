import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.instance";

export const getClasses = createAsyncThunk(
    "classes/getClasses",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await api.get("/classes", { params });
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createClass = createAsyncThunk(
    "classes/createClass",
    async (classData, { rejectWithValue }) => {
        try {
            const response = await api.post("/classes", classData);

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

export const updateClass = createAsyncThunk(
    "classes/updateClass",
    async ({ classId, ...classData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/classes/${classId}`, classData);

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

export const deleteClass = createAsyncThunk(
    "classes/deleteClass",
    async (classId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/classes/${classId}`);

            return { ...response, classId };
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
            });
        }
    }
);

export const getClassById = createAsyncThunk(
    "classes/getClassById",
    async (classId, { rejectWithValue }) => {
        try {
            return await api.get(`/classes/${classId}`);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const assignTeacherToClass = createAsyncThunk(
    "classes/assignTeacherToClass",
    async ({ classId, teacherId }, { rejectWithValue }) => {
        try {
            return await api.patch(`/classes/${classId}/assign-teacher`, {
                teacherId,
            });
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
            });
        }
    }
);

export const unassignTeacherFromClass = createAsyncThunk(
    "classes/unassignTeacherFromClass",
    async (classId, { rejectWithValue }) => {
        try {
            return await api.patch(`/classes/${classId}/unassign-teacher`);
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
            });
        }
    }
);

export const registerStudentToClass = createAsyncThunk(
    "classes/registerStudentToClass",
    async ({ classId, studentId }, { rejectWithValue }) => {
        try {
            return await api.patch(`/classes/${classId}/register-student`, {
                studentId,
            });
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "An error occurred",
                statusCode: error.response?.status,
            });
        }
    }
);

export const unregisterStudentFromClass = createAsyncThunk(
    "classes/unregisterStudentFromClass",
    async ({ classId, studentId }, { rejectWithValue }) => {
        try {
            return await api.patch(`/classes/${classId}/unregister-student`, {
                studentId,
            });
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

    classesList: {
        data: null,
        loading: false,
        error: null,
        tableActions: {
            search: "",
            level: "",
            mine: false,
            studentId: "",
            page: 1,
            limit: 15,
        },
    },

    activeTab: "overview",

    classDetails: {
        data: null,
        loading: false,
        error: null,
    },

    teacherAssignmentData: {
        assigning: false,
        message: null,
        error: null,
    },

    studentRegistrationData: {
        registering: false,
        message: null,
        error: null,
    },
};

const classesSlice = createSlice({
    name: "classes",
    initialState,

    reducers: {
        clearClassesMessage(state) {
            state.registerData.message = null;
        },

        clearClassesError(state) {
            state.registerData.error = null;
        },

        clearClassDeleteMessage(state) {
            state.deleteData.message = null;
        },

        clearClassDeleteError(state) {
            state.deleteData.error = null;
        },

        clearClassUpdateMessage(state) {
            state.updateData.message = null;
        },

        clearClassUpdateError(state) {
            state.updateData.error = null;
        },

        clearAssignStudentAlerts(state) {
            state.studentRegistrationData.message = null;
            state.studentRegistrationData.error = null;
        },
        clearAssignTeacherAlerts(state) {
            state.teacherAssignmentData.message = null;
            state.teacherAssignmentData.error = null;
        },

        handleTableActions(state, action) {
            const { key, value } = action.payload;

            switch (key) {
                case "search":
                    state.classesList.tableActions.search = value;
                    break;

                case "level":
                    state.classesList.tableActions.level = value;
                    break;

                case "page":
                    state.classesList.tableActions.page = value;
                    break;

                case "mine":
                    state.classesList.tableActions.mine = value;
                    break;
                case "studentId":
                    state.classesList.tableActions.studentId = value;
                    break;

                case "limit":
                    state.classesList.tableActions.limit = value;
                    break;

                default:
                    break;
            }
        },
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
    },

    extraReducers: (builder) => {
        // Create Class
        builder
            .addCase(createClass.pending, (state) => {
                state.registerData.message = null;
                state.registerData.registering = true;
                state.registerData.error = null;
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.registerData.message = action.payload.message;
                state.registerData.registering = false;
                state.registerData.error = null;
            })
            .addCase(createClass.rejected, (state, action) => {
                state.registerData.message = null;
                state.registerData.registering = false;
                state.registerData.error = action.payload;
            });

        // Get Classes
        builder
            .addCase(getClasses.pending, (state) => {
                state.classesList.loading = true;
                state.classesList.error = null;
            })
            .addCase(getClasses.fulfilled, (state, action) => {
                state.classesList.loading = false;
                state.classesList.data = action.payload;
                state.classesList.error = null;
            })
            .addCase(getClasses.rejected, (state, action) => {
                state.classesList.loading = false;
                state.classesList.error = action.payload;
            });

        // Delete Class
        builder
            .addCase(deleteClass.pending, (state) => {
                state.deleteData.deleting = true;
                state.deleteData.message = null;
                state.deleteData.error = null;
            })
            .addCase(deleteClass.fulfilled, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = action.payload.message;
                state.deleteData.error = null;

                state.classesList.data.classes =
                    state.classesList.data.classes.filter(
                        (currentClass) =>
                            currentClass._id !== action.payload.classId
                    );
            })
            .addCase(deleteClass.rejected, (state, action) => {
                state.deleteData.deleting = false;
                state.deleteData.message = null;
                state.deleteData.error = action.payload;
            });

        // Update Class
        builder
            .addCase(updateClass.pending, (state) => {
                state.updateData.updating = true;
                state.updateData.message = null;
                state.updateData.error = null;
            })
            .addCase(updateClass.fulfilled, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = action.payload.message;
                state.updateData.error = null;
            })
            .addCase(updateClass.rejected, (state, action) => {
                state.updateData.updating = false;
                state.updateData.message = null;
                state.updateData.error = action.payload;
            });

        // Get Class Details
        builder
            .addCase(getClassById.pending, (state) => {
                state.classDetails.loading = true;
                state.classDetails.error = null;
            })
            .addCase(getClassById.fulfilled, (state, action) => {
                state.classDetails.loading = false;
                state.classDetails.data = action.payload.class;
                state.classDetails.error = null;
            })
            .addCase(getClassById.rejected, (state, action) => {
                state.classDetails.loading = false;
                state.classDetails.error = action.payload;
            });

        // Assign / Unassign Teacher
        builder
            .addCase(assignTeacherToClass.pending, (state) => {
                state.teacherAssignmentData.assigning = true;
                state.teacherAssignmentData.message = null;
                state.teacherAssignmentData.error = null;
            })
            .addCase(assignTeacherToClass.fulfilled, (state, action) => {
                state.teacherAssignmentData.assigning = false;
                state.teacherAssignmentData.message = action.payload.message;
                state.teacherAssignmentData.error = null;
            })
            .addCase(assignTeacherToClass.rejected, (state, action) => {
                state.teacherAssignmentData.assigning = false;
                state.teacherAssignmentData.message = null;
                state.teacherAssignmentData.error = action.payload;
            })

            .addCase(unassignTeacherFromClass.pending, (state) => {
                state.teacherAssignmentData.assigning = true;
                state.teacherAssignmentData.message = null;
                state.teacherAssignmentData.error = null;
            })
            .addCase(unassignTeacherFromClass.fulfilled, (state, action) => {
                state.teacherAssignmentData.assigning = false;
                state.teacherAssignmentData.message = action.payload.message;
                state.teacherAssignmentData.error = null;
            })
            .addCase(unassignTeacherFromClass.rejected, (state, action) => {
                state.teacherAssignmentData.assigning = false;
                state.teacherAssignmentData.message = null;
                state.teacherAssignmentData.error = action.payload;
            });

        // Register / Unregister Student
        builder
            .addCase(registerStudentToClass.pending, (state) => {
                state.studentRegistrationData.registering = true;
                state.studentRegistrationData.message = null;
                state.studentRegistrationData.error = null;
            })
            .addCase(registerStudentToClass.fulfilled, (state, action) => {
                state.studentRegistrationData.registering = false;
                state.studentRegistrationData.message = action.payload.message;
                state.studentRegistrationData.error = null;
            })
            .addCase(registerStudentToClass.rejected, (state, action) => {
                state.studentRegistrationData.registering = false;
                state.studentRegistrationData.message = null;
                state.studentRegistrationData.error = action.payload;
            })

            .addCase(unregisterStudentFromClass.pending, (state) => {
                state.studentRegistrationData.registering = true;
                state.studentRegistrationData.message = null;
                state.studentRegistrationData.error = null;
            })
            .addCase(unregisterStudentFromClass.fulfilled, (state, action) => {
                state.studentRegistrationData.registering = false;
                state.studentRegistrationData.message = action.payload.message;
                state.studentRegistrationData.error = null;
            })
            .addCase(unregisterStudentFromClass.rejected, (state, action) => {
                state.studentRegistrationData.registering = false;
                state.studentRegistrationData.message = null;
                state.studentRegistrationData.error = action.payload;
            });
    },
});

export const {
    clearClassesMessage,
    clearClassesError,
    clearClassDeleteMessage,
    clearClassDeleteError,
    clearClassUpdateMessage,
    clearClassUpdateError,
    handleTableActions,
    setActiveTab,
    clearAssignStudentAlerts,
    clearAssignTeacherAlerts,
} = classesSlice.actions;

export default classesSlice.reducer;
