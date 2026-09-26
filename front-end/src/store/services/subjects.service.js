import api from "../../api/axios.instance";

export const getSubjectsRequest = (params) =>
    api.get("/subjects", { params });

export const createSubjectRequest = (subjectData) =>
    api.post("/subjects", subjectData);

export const updateSubjectRequest = (subjectId, subjectData) =>
    api.put(`/subjects/${subjectId}`, subjectData);

export const deleteSubjectRequest = (subjectId) =>
    api.delete(`/subjects/${subjectId}`);
