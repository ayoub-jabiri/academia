import api from "../../api/axios.instance";

export const getHomeworksRequest = (params) =>
    api.get("/homeworks", { params });

export const getHomeworkByIdRequest = (homeworkId) =>
    api.get(`/homeworks/${homeworkId}`);

export const createHomeworkRequest = (homeworkData) =>
    api.post("/homeworks", homeworkData);

export const updateHomeworkRequest = (homeworkId, homeworkData) =>
    api.put(`/homeworks/${homeworkId}`, homeworkData);

export const deleteHomeworkRequest = (homeworkId) =>
    api.delete(`/homeworks/${homeworkId}`);
