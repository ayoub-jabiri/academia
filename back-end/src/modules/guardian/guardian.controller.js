import {
    deleteGuardianService,
    getGuardianByIdService,
    getGuardianParentService,
    getGuardiansService,
    getGuardianStudentService,
    getMyChildrenService,
    registerGuardianService,
    updateGuardianService,
} from "./guardian.service.js";
import { serverErrorResponse } from "../../utils/server.error.js";
import { excludeUserPassword } from "../../utils/client.responses.js";

export const getGuardians = async (req, res) => {
    try {
        const { page = 1, limit = 15, search = "" } = req.query;

        const currentPage = +page;
        const guardiansLimit = +limit;

        const { guardians, totalGuardians } = await getGuardiansService({
            page: currentPage,
            limit: guardiansLimit,
            search,
        });

        res.json({
            currentPage,
            guardiansPerPage: guardiansLimit,
            totalPages: Math.ceil(totalGuardians / guardiansLimit) || 1,
            totalGuardians,
            guardians,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const registerGuardian = async (req, res) => {
    try {
        const { studentId, parentId } = req.body;

        const newGuardian = await registerGuardianService({
            studentId,
            parentId,
        });

        res.status(201).json({
            message: "Guardian has been registered successfully",
            guardian: newGuardian,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getSingleGuardian = async (req, res) => {
    try {
        const guardian = await getGuardianByIdService(req.params.guardianId);

        res.json({ guardian });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const updateGuardian = async (req, res) => {
    try {
        const guardian = await updateGuardianService(
            req.params.guardianId,
            req.body
        );

        res.json({
            message: "Guardian has been updated successfully",
            guardian,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const deleteGuardian = async (req, res) => {
    try {
        await deleteGuardianService(req.params.guardianId);

        res.json({
            message: "Guardian has been deleted successfully",
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getGuardianStudent = async (req, res) => {
    try {
        const student = await getGuardianStudentService(req.params.guardianId);

        res.json({ student: excludeUserPassword(student) });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getGuardianParent = async (req, res) => {
    try {
        const parent = await getGuardianParentService(req.params.guardianId);

        res.json({ parent: excludeUserPassword(parent) });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};

export const getMyChildren = async (req, res) => {
    try {
        const children = await getMyChildrenService(req.user.id);

        res.json({
            children: children,
        });
    } catch (error) {
        serverErrorResponse(res, error);
    }
};
