import { hashPassword } from "../../utils/user.utils.js";
import User from "./user.model.js";

export const getUserByEmail = async (email) => await User.findOne({ email });

export const getUserByIdService = async (id) => await User.findOne({ _id: id });

export const getUsersService = async (ids) =>
    await User.find({ _id: { $in: ids } });

export const userRegister = async (userData) => await User.create(userData);

export const getAdminUsersService = async ({ page, limit, search, role }) => {
    const skip = (page - 1) * limit;

    const filter = {};

    if (search.trim()) {
        const regex = new RegExp(search.trim(), "i");

        filter.$or = [
            { fullName: regex },
            { email: regex },
            { phoneNumber: regex },
        ];
    }

    if (role.trim()) {
        filter.role = role.trim();
    }

    const [users, totalUsers] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        User.countDocuments(filter),
    ]);

    return {
        users,
        totalUsers,
    };
};

export const updateUserService = async (userId, userData) => {
    const user = await getUserByIdService(userId);

    user.fullName = userData.fullName;
    user.phoneNumber = userData.phoneNumber;
    user.email = userData.email;
    user.gender = userData.gender;

    if (userData.password) {
        const newHashedPassword = await hashPassword(userData.password);

        user.password = newHashedPassword;
    }

    return await user.save();
};
