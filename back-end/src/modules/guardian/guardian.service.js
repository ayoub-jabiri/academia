import { getUserByIdService } from "../users/user.service.js";
import Guardian from "./guardian.model.js";
import User from "../users/user.model.js";

export const getGuardiansService = async ({ page, limit, search }) => {
    const skip = (page - 1) * limit;

    const filter = { role: "parent" };

    if (search.trim()) {
        const regex = new RegExp(search.trim(), "i");

        filter.$or = [
            { fullName: regex },
            { email: regex },
            { phoneNumber: regex },
        ];
    }

    const [allGuardians, totalGuardians] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        User.countDocuments(filter),
    ]);

    const parentIds = allGuardians.map((parent) => parent._id);

    const guardians = await Guardian.find({
        parentId: { $in: parentIds },
    })
        .sort({ createdAt: -1 })
        .populate("parentId", "fullName email phoneNumber")
        .populate("studentId", "fullName email phoneNumber");

    return {
        guardians,
        totalGuardians,
    };
};

export const getGuardiansByQuery = async (query) => await Guardian.find(query);

export const getGuardianByQuery = async (query) =>
    await Guardian.findOne(query);

export const getGuardianByIdService = async (guardianId) =>
    await Guardian.findById(guardianId);

export const registerGuardianService = async (guardianData) =>
    await Guardian.create(guardianData);

export const updateGuardianService = async (guardianId, guardianData) => {
    const guardian = await getGuardianByIdService(guardianId);

    guardian.studentId = guardianData.studentId;
    guardian.parentId = guardianData.parentId;

    return await guardian.save();
};

export const deleteGuardianService = async (guardianId) =>
    await Guardian.findByIdAndDelete(guardianId);

export const getGuardianStudentService = async (guardianId) => {
    const guardian = await getGuardianByIdService(guardianId);

    return await getUserByIdService(guardian.studentId);
};

export const getGuardianParentService = async (guardianId) => {
    const guardian = await getGuardianByIdService(guardianId);

    return await getUserByIdService(guardian.parentId);
};

export const getMyChildrenService = async (parentId) => {
    const guardianLinks = await Guardian.find({ parentId }).populate(
        "studentId",
        "fullName email gender"
    );

    return guardianLinks.map((link) => link.studentId);
};
