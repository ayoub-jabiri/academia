import api from "../../api/axios.instance";

export const getAdminDashboardRequest = () =>
    api.get("/dashboard/admin/stats");

export const getTeacherDashboardRequest = () =>
    api.get("/dashboard/teacher/stats");

export const getStudentDashboardRequest = () =>
    api.get("/dashboard/student/stats");

export const getParentDashboardRequest = () =>
    api.get("/dashboard/parent/stats");
