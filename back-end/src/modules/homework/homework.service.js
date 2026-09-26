import ClassModel from "../class/class.model.js";
import guardianModel from "../guardian/guardian.model.js";
import Homework from "./homework.model.js";

const populateOptions = [
    {
        path: "classId",
        select: "level levelYear group subjectId",
        populate: { path: "subjectId", select: "title" },
    },
    { path: "teacherId", select: "fullName email" },
];

export const getAllHomeworksService = async ({
    user,
    page,
    limit,
    search,
    classId,
    status,
}) => {
    const skip = (page - 1) * limit;

    const filter = {};

    if (user.role === "teacher") {
        filter.teacherId = user.id;
    } else if (user.role === "student") {
        const classes = await ClassModel.find({ students: user.id }).select(
            "_id"
        );

        const classesIds = classes.map((currentClass) => currentClass._id);

        filter.classId = { $in: classesIds };
    } else if (user.role === "parent") {
        const childrenIds = (
            await guardianModel.find({ parentId: user.id })
        ).map((guardian) => guardian.studentId);

        const classesIds = (
            await ClassModel.find({
                students: { $in: childrenIds },
            })
        ).map((cls) => cls._id);

        filter.classId = { $in: classesIds };
    }

    if (classId && classId.trim()) {
        filter.classId = classId;
    }

    if (search && search.trim()) {
        filter.title = new RegExp(search.trim(), "i");
    }

    const now = new Date();

    if (status === "active") {
        filter.dueDate = { $gt: now };
    } else if (status === "expired") {
        filter.dueDate = { $lte: now };
    }

    const [homeworks, totalHomeworks] = await Promise.all([
        Homework.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate(populateOptions),

        Homework.countDocuments(filter),
    ]);

    return { homeworks, totalHomeworks };
};

export const getHomeWorkByQueryService = async (query) =>
    await Homework.findOne(query);

export const getHomeworkByIdService = async (homeworkId) =>
    await Homework.findById(homeworkId);

export const getSingleHomeworkService = async (homeworkId) =>
    await Homework.findById(homeworkId).populate(populateOptions);

export const registerHomeworkService = async (homeworkData) =>
    await Homework.create(homeworkData);

export const updateHomeworkService = async (homeworkId, homeworkData) => {
    const homework = await getHomeworkByIdService(homeworkId);

    homework.title = homeworkData.title;
    homework.description = homeworkData.description;
    homework.dueDate = new Date(homeworkData.dueDate);

    return await homework.save();
};

export const deleteHomeworkService = async (homeworkId) =>
    await Homework.findByIdAndDelete(homeworkId);
