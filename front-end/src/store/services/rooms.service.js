import api from "../../api/axios.instance";

export const getRoomsRequest = (params) =>
    api.get("/school-rooms", { params });

export const createRoomRequest = (roomData) =>
    api.post("/school-rooms", roomData);

export const updateRoomRequest = (roomId, roomData) =>
    api.put(`/school-rooms/${roomId}`, roomData);

export const deleteRoomRequest = (roomId) =>
    api.delete(`/school-rooms/${roomId}`);
