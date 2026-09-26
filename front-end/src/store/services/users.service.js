import api from "../../api/axios.instance";

export const registerUserRequest = (userData) =>
    api.post("/users/auth/register", userData);

export const getUsersRequest = (params) =>
    api.get("/users", { params });

export const getUserByIdRequest = (userId) =>
    api.get(`/users/${userId}`);

export const updateUserRequest = (userId, userData) =>
    api.put(`/users/${userId}`, userData);
