import api from "../../api/axios.instance";

export const getClassesRequest = (params) =>
    api.get("/classes", { params });

export const createClassRequest = (classData) =>
    api.post("/classes", classData);

export const updateClassRequest = (classId, classData) =>
    api.put(`/classes/${classId}`, classData);

export const deleteClassRequest = (classId) =>
    api.delete(`/classes/${classId}`);

export const getClassByIdRequest = (classId) =>
    api.get(`/classes/${classId}`);

export const assignTeacherToClassRequest = (classId, teacherId) =>
    api.patch(`/classes/${classId}/assign-teacher`, { teacherId });

export const unassignTeacherFromClassRequest = (classId) =>
    api.patch(`/classes/${classId}/unassign-teacher`);

export const registerStudentToClassRequest = (classId, studentId) =>
    api.patch(`/classes/${classId}/register-student`, { studentId });

export const unregisterStudentFromClassRequest = (classId, studentId) =>
    api.patch(`/classes/${classId}/unregister-student`, { studentId });
