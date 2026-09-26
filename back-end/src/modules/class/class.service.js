import { getSchoolRoomByIdService } from "../school-room/room.service.js";
import { getSubjectById } from "../subject/subject.service.js";
import { getUserByIdService, getUsersService } from "../users/user.service.js";
import Class from "./class.model.js";
import Guardian from "../guardian/guardian.model.js";

export const getClassesService = async ({
    user,
    page,
    limit,
    search,
    level,
    mine,
    studentId,
}) => {
    const skip = (page - 1) * limit;

    const filter = {};

    if (search.trim()) {
        if (!isNaN(+search.trim())) {
            const value = +search.trim();

            filter.$or = [{ levelYear: value }, { group: value }];
        } else {
            const regex = new RegExp(search.trim(), "i");

            filter.level = regex;
        }
    }

    if (level) {
        filter.level = level;
    }

    if (studentId && user.role === "parent") {
        const allowedToFilterByStudent = await Guardian.findOne({
            parentId: user.id,
            studentId,
        });

        if (allowedToFilterByStudent) {
            filter.students = studentId;
        } else {
            filter.students = null;
        }
    }

    if (mine === "true" && user.role !== "admin") {
        if (user.role === "teacher") {
            filter.teacherId = user.id;
        } else if (user.role === "student") {
            filter.students = user.id;
        }
    }

    const [classes, totalClasses] = await Promise.all([
        Class.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("schoolRoomId", "title roomNumber")
            .populate("subjectId", "title")
            .populate("teacherId", "fullName email")
            .populate("students", "fullName email"),

        Class.countDocuments(filter),
    ]);

    return {
        classes,
        totalClasses,
    };
};

export const getClassesByQuery = async (query) => await Class.findOne(query);
export const getClassByQuery = async (query) => await Class.findOne(query);

export const getClassByIdService = async (classId) =>
    await Class.findById(classId);

export const getSingleClassService = async (classId) =>
    await Class.findById(classId)
        .populate("schoolRoomId", "title roomNumber")
        .populate("subjectId", "title")
        .populate("teacherId", "fullName email phoneNumber")
        .populate("students", "fullName email phoneNumber");

export const registerClassService = async (classData) => {
    const newClass = await Class.create(classData);

    const subject = await getSubjectById(classData.subjectId);

    subject.classes.push(newClass._id);
    await subject.save();

    const schoolRoom = await getSchoolRoomByIdService(classData.schoolRoomId);
    schoolRoom.classes.push(newClass._id);
    await schoolRoom.save();

    return newClass;
};

export const updateClassService = async (classId, classData) => {
    const currentClass = await getClassByIdService(classId);

    currentClass.level = classData.level;
    currentClass.levelYear = classData.levelYear;
    currentClass.schoolRoomId = classData.schoolRoomId;
    currentClass.group = classData.group;

    return await currentClass.save();
};

export const deleteClassService = async (classId) => {
    const currentClass = await getClassByIdService(classId);
    const subject = await getSubjectById(currentClass.subjectId);

    subject.classes = subject.classes.filter(
        (id) => id.toString() !== classId.toString()
    );
    await subject.save();

    const schoolRoom = await getSchoolRoomByIdService(
        currentClass.schoolRoomId
    );
    schoolRoom.classes = schoolRoom.classes.filter(
        (id) => id.toString() !== classId.toString()
    );
    await schoolRoom.save();

    return await currentClass.deleteOne();
};

export const handleTeacherAssignmentService = async (
    action,
    classId,
    teacherId = null
) => {
    const currentClass = await getClassByIdService(classId);

    if (action === "assign") {
        currentClass.teacherId = teacherId;
    } else if (action === "unassign") {
        currentClass.teacherId = null;
    }

    return await currentClass.save();
};

export const handleStudentRegistrationService = async (
    action,
    classId,
    studentId
) => {
    const currentClass = await getClassByIdService(classId);

    if (action === "register") {
        currentClass.students.push(studentId);
    } else if (action === "unregister") {
        currentClass.students = currentClass.students.filter(
            (id) => id.toString() !== studentId.toString()
        );
    }

    return await currentClass.save();
};

export const getClassSchoolRoomService = async (classId) => {
    const currentClass = await getClassByIdService(classId);

    return await getSchoolRoomByIdService(currentClass.schoolRoomId);
};

export const getClassTeacherService = async (classId) => {
    const currentClass = await getClassByIdService(classId);

    if (!currentClass.teacherId) {
        return null;
    }

    return await getUserByIdService(currentClass.teacherId);
};

export const getClassStudentsService = async (classId) => {
    const currentClass = await getClassByIdService(classId);

    return await getUsersService(currentClass.students);
};
