import api from "../../api/axios.instance";

export const getAnnouncementsRequest = (params) =>
    api.get("/announcements", { params });

export const getAnnouncementByIdRequest = (announcementId) =>
    api.get(`/announcements/${announcementId}`);

export const createAnnouncementRequest = (announcementData) =>
    api.post("/announcements", announcementData);

export const updateAnnouncementRequest = (announcementId, announcementData) =>
    api.put(`/announcements/${announcementId}`, announcementData);

export const deleteAnnouncementRequest = (announcementId) =>
    api.delete(`/announcements/${announcementId}`);
