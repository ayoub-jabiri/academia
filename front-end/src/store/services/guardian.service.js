import api from "../../api/axios.instance";

export const getGuardiansRequest = (params) =>
    api.get("/guardians", { params });

export const registerGuardianRequest = (guardianData) =>
    api.post("/guardians", guardianData);

export const deleteGuardianRequest = (guardianId) =>
    api.delete(`/guardians/${guardianId}`);

export const updateGuardianRequest = (guardianId, guardianData) =>
    api.put(`/guardians/${guardianId}`, guardianData);

export const getMyChildrenRequest = () =>
    api.get("/guardians/my-children");
