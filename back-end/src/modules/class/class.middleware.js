import { clientErrorResponse } from "../../utils/client.responses.js";
import { serverErrorResponse } from "../../utils/server.error.js";
import { getHomeWorkByQueryService } from "../homework/homework.service.js";
import { getSchoolRoomByIdService } from "../school-room/room.service.js";
import { getSubjectById } from "../subject/subject.service.js";
import { getUserByIdService } from "../users/user.service.js";
import { getClassByIdService, getClassByQuery } from "./class.service.js";
import {
    assignTeacherSchema,
    classSchema,
    studentRegistrationSchema,
} from "./class.validation.js";

export const classDataValidation = (req, res, next) => {
    try {
        const { level, levelYear, group, schoolRoomId, subjectId } = req.body;

        classSchema.parse({
            level,
            levelYear,
            group,
            schoolRoomId,
            subjectId,
        });

        next();
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const classAlreadyExistsCheck = async (req, res, next) => {
    try {
        const { level, levelYear, group, subjectId } = req.body;

        const currentClass = await getClassByQuery({
            level,
            levelYear,
            group,
            subjectId,
        });

        if (currentClass) {
            return clientErrorResponse(res, 409, "Class already registered");
        }

        next();
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const schoolRoomExistsCheck = async (req, res, next) => {
    try {
        const { schoolRoomId } = req.body;

        const schoolRoom = await getSchoolRoomByIdService(schoolRoomId);

        if (!schoolRoom) {
            return clientErrorResponse(res, 404, "School room not found");
        }

        next();
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const subjectExistsCheck = async (req, res, next) => {
    try {
        const { subjectId } = req.body;

        const subject = await getSubjectById(subjectId);

        if (!subject) {
            return clientErrorResponse(res, 404, "Subject not found");
        }

        next();
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const classExistsCheck = async (req, res, next) => {
    try {
        const { classId } = req.params;

        const currentClass = await getClassByIdService(classId);

        if (!currentClass) {
            return clientErrorResponse(res, 404, "Class not found");
        }

        next();
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const classDeleteCheck = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const currentClass = await getClassByIdService(classId);

        if (currentClass?.students?.length > 0) {
            return clientErrorResponse(
                res,
                400,
                "Cannot delete class with registered students"
            );
        }

        if (currentClass?.teacherId) {
            return clientErrorResponse(
                res,
                400,
                "Cannot delete class with a teacher assigned"
            );
        }

        const homeworks = await getHomeWorkByQueryService({ classId });

        if (homeworks) {
            return clientErrorResponse(
                res,
                400,
                "Cannot delete class with assigned homeworks"
            );
        }

        const grades = await getHomeWorkByQueryService({ classId });

        if (grades) {
            return clientErrorResponse(
                res,
                400,
                "Cannot delete class with assigned grades"
            );
        }

        next();
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const teacherAssignmentCheck = (checkType) => {
    return async (req, res, next) => {
        try {
            const { classId } = req.params;

            const currentClass = await getClassByIdService(classId);

            if (checkType === "hasTeacher" && currentClass?.teacherId) {
                return clientErrorResponse(
                    res,
                    400,
                    "Class already has a teacher assigned"
                );
            }

            if (
                checkType === "doesNotHaveTeacher" &&
                currentClass?.teacherId == null
            ) {
                return clientErrorResponse(
                    res,
                    400,
                    "Class does not have a teacher assigned"
                );
            }

            next();
        } catch (error) {
            serverErrorResponse(res, error);
        }
    };
};

export const assignTeacherDataValidation = async (req, res, next) => {
    try {
        const { teacherId } = req.body;

        assignTeacherSchema.parse({ teacherId });

        const teacher = await getUserByIdService(teacherId);

        if (!teacher) {
            return clientErrorResponse(res, 404, "Teacher not found");
        }

        if (teacher?.role !== "teacher") {
            return clientErrorResponse(res, 400, "The user is not a teacher");
        }

        next();
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const studentRegistrationDataValidation = async (req, res, next) => {
    try {
        const { studentId } = req.body;

        studentRegistrationSchema.parse({ studentId });

        const student = await getUserByIdService(studentId);

        if (!student) {
            return clientErrorResponse(res, 404, "Student not found");
        }

        if (student?.role !== "student") {
            return clientErrorResponse(res, 400, "The user is not a student");
        }

        next();
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const studentRegistrationCheck = (checkType) => {
    return async (req, res, next) => {
        try {
            const { classId } = req.params;
            const { studentId } = req.body;

            const currentClass = await getClassByIdService(classId);

            if (
                checkType === "isRegistered" &&
                currentClass?.students?.includes(studentId)
            ) {
                return clientErrorResponse(
                    res,
                    400,
                    "Student is already registered in this class"
                );
            }

            if (
                checkType === "isNotRegistered" &&
                !currentClass?.students?.includes(studentId)
            ) {
                return clientErrorResponse(
                    res,
                    400,
                    "Student is not registered in this class"
                );
            }

            next();
        } catch (error) {
            serverErrorResponse(res, error);
        }
    };
};
