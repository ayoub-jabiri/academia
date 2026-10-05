// External Modules
import bcrypt from "bcrypt";

// Internal Modules
import { clientErrorResponse } from "../../utils/client.responses.js";
import { serverErrorResponse } from "../../utils/server.error.js";
import { getUserByEmail, getUserByIdService } from "./user.service.js";
import {
    userLoginSchema,
    userRegisterSchema,
    userUpdateSchema,
} from "./user.validation.js";

export const registerDataValidationCheck = (req, res, next) => {
    try {
        const {
            fullName,
            phoneNumber,
            email,
            gender,
            dateOfBirth,
            role,
            password,
            passwordConfirm,
        } = req.body;

        userRegisterSchema.parse({
            fullName,
            phoneNumber,
            email,
            gender,
            dateOfBirth,
            role,
            password,
            passwordConfirm,
        });
    } catch (error) {
        return serverErrorResponse(res, error);
    }

    next();
};

export const loginDataValidationCheck = (req, res, next) => {
    try {
        const { email, password } = req.body;

        userLoginSchema.parse({
            email,
            password,
        });
    } catch (error) {
        return serverErrorResponse(res, error);
    }

    next();
};

export const userExistCheck = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await getUserByEmail(email);

        if (user) {
            return clientErrorResponse(
                res,
                409,
                "User already exists with this email"
            );
        }
    } catch (error) {
        return serverErrorResponse(res, error);
    }

    next();
};

export const userNotExistCheck = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await getUserByEmail(email);

        if (!user) {
            return clientErrorResponse(res, 400, "Invalid email or password");
        }
    } catch (error) {
        return serverErrorResponse(res, error);
    }

    next();
};

export const passwordMatchCheck = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return clientErrorResponse(res, 400, "Invalid email or password");
        }
    } catch (error) {
        return serverErrorResponse(res, error);
    }

    next();
};

export const userExistsByIdCheck = async (req, res, next) => {
    try {
        const user = await getUserByIdService(req.params.userId);

        if (!user) {
            return clientErrorResponse(res, 404, "User not found");
        }

        req.targetUser = user;
        next();
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

export const userUpdateDataValidationCheck = (req, res, next) => {
    try {
        const {
            fullName,
            phoneNumber,
            email,
            gender,
            role,
            password,
            passwordConfirm,
        } = req.body;

        userUpdateSchema.parse({
            fullName,
            phoneNumber,
            email,
            gender,
            role,
            password: password || undefined,
            passwordConfirm: passwordConfirm || undefined,
        });

        next();
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

export const userUpdateExistCheck = async (req, res, next) => {
    try {
        const user = await getUserByEmail(req.body.email);

        if (user && user._id.toString() !== req.params.userId) {
            return clientErrorResponse(
                res,
                409,
                "User already exists with this email"
            );
        }

        next();
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};
