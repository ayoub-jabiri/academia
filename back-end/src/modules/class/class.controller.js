import {
    deleteClassService,
    getClassByIdService,
    getClassesService,
    getClassSchoolRoomService,
    getClassStudentsService,
    getClassTeacherService,
    getSingleClassService,
    handleStudentRegistrationService,
    handleTeacherAssignmentService,
    registerClassService,
    updateClassService,
} from "./class.service.js";
import { serverErrorResponse } from "../../utils/server.error.js";
import { excludeUserPassword } from "../../utils/client.responses.js";

export const getClasses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 15,
            search = "",
            level = "",
            mine = "false",
            studentId = "",
        } = req.query;

        const currentPage = +page;
        const classesLimit = +limit;

        const { classes, totalClasses } = await getClassesService({
            user: req.user,
            page: currentPage,
            limit: classesLimit,
            search,
            level,
            mine,
            studentId,
        });

        res.json({
            currentPage,
            classesPerPage: classesLimit,
            totalPages: Math.ceil(totalClasses / classesLimit) || 1,
            totalClasses,
            classes,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const registerClass = async (req, res) => {
    try {
        const { level, levelYear, group, schoolRoomId, subjectId } = req.body;

        const newClass = await registerClassService({
            level,
            levelYear,
            group,
            schoolRoomId,
            subjectId,
        });

        res.status(201).json({
            message: "Class has been registered successfully",
            class: newClass,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getSingleClass = async (req, res) => {
    try {
        const currentClass = await getSingleClassService(req.params.classId);

        res.json({ class: currentClass });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const updateClass = async (req, res) => {
    try {
        const currentClass = await updateClassService(
            req.params.classId,
            req.body
        );

        res.json({
            message: "Class has been updated successfully",
            class: currentClass,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const deleteClass = async (req, res) => {
    try {
        await deleteClassService(req.params.classId);

        res.json({
            message: "Class has been deleted successfully",
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const assignTeacherToClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { teacherId } = req.body;

        const currentClass = await handleTeacherAssignmentService(
            "assign",
            classId,
            teacherId
        );

        res.json({
            message: "The teacher has been assigned to the class successfully",
            class: currentClass,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const unassignTeacherToClass = async (req, res) => {
    try {
        const { classId } = req.params;

        const currentClass = await handleTeacherAssignmentService(
            "unassign",
            classId
        );

        res.json({
            message:
                "The teacher has been unassigned from the class successfully",
            class: currentClass,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const registerStudentToClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentId } = req.body;

        const currentClass = await handleStudentRegistrationService(
            "register",
            classId,
            studentId
        );

        res.json({
            message:
                "The student has been registered to the class successfully",
            class: currentClass,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const unregisterStudentToClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentId } = req.body;

        const currentClass = await handleStudentRegistrationService(
            "unregister",
            classId,
            studentId
        );

        res.json({
            message:
                "The student has been unregistered from the class successfully",
            class: currentClass,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getClassSchoolRoom = async (req, res) => {
    try {
        const { classId } = req.params;
        const schoolRoom = await getClassSchoolRoomService(classId);

        res.json({ schoolRoom });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getClassTeacher = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacher = await getClassTeacherService(classId);

        if (!teacher) {
            return res.json({ teacher: null });
        }

        res.json({ teacher: excludeUserPassword(teacher) });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getClassStudents = async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await getClassStudentsService(classId);

        res.json({
            students: students.map((student) => excludeUserPassword(student)),
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};
