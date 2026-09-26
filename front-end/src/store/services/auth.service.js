import api from "../../api/axios.instance";

export const userLoginRequest = (credentials) =>
    api.post("/users/auth/login", credentials);

export const getUserProfileRequest = (credentials) =>
    api.get("/users/auth/profile", credentials);
