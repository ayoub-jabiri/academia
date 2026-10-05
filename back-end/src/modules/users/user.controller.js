import {
    getAdminUsersService,
    updateUserService,
    userRegister,
} from "./user.service.js";
import { serverErrorResponse } from "../../utils/server.error.js";
import { hashPassword, signToken } from "../../utils/user.utils.js";
import { getUserByEmail } from "./user.service.js";
import { excludeUserPassword } from "../../utils/client.responses.js";

export const register = async (req, res) => {
    try {
        const { fullName, phoneNumber, email, gender, role, password } =
            req.body;

        const hashedPassword = await hashPassword(password);

        const newUser = await userRegister({
            fullName,
            phoneNumber,
            email,
            gender,
            role,
            password: hashedPassword,
        });

        const accessToken = signToken(newUser);

        res.status(201).json({
            message: "The user has been registered successfully",
            accessToken,
            user: excludeUserPassword(newUser),
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const login = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await getUserByEmail(email);

        const accessToken = signToken(user);

        res.json({
            message: "The user has been logged in successfully",
            accessToken,
            user: excludeUserPassword(user),
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const profile = async (req, res) => {
    try {
        const user = await getUserByEmail(req.user.email);

        res.json({
            user: excludeUserPassword(user),
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getAdminUsers = async (req, res) => {
    try {
        const { page = 1, limit = 15, search = "", role = "" } = req.query;

        const currentPage = +page;
        const usersLimit = +limit;

        const { users, totalUsers } = await getAdminUsersService({
            page: currentPage,
            limit: usersLimit,
            search,
            role,
        });

        res.json({
            currentPage,
            usersPerPage: usersLimit,
            totalPages: Math.ceil(totalUsers / usersLimit) || 1,
            totalUsers,
            users,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getSingleUser = async (req, res) => {
    try {
        res.json({
            user: excludeUserPassword(req.targetUser),
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await updateUserService(req.params.userId, req.body);

        res.json({
            message: "User has been updated successfully",
            user: excludeUserPassword(user),
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};
