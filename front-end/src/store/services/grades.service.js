import api from "../../api/axios.instance";

export const getGradesRequest = (params) => api.get("/grades", { params });

export const getGradeByIdRequest = (gradeId) => api.get(`/grades/${gradeId}`);

export const getGradeClassStatsRequest = (params) =>
    api.get("/grades", { params });

export const createGradeRequest = (gradeData) => api.post("/grades", gradeData);

export const updateGradeRequest = (gradeId, gradeData) =>
    api.put(`/grades/${gradeId}`, gradeData);

export const deleteGradeRequest = (gradeId) => api.delete(`/grades/${gradeId}`);
