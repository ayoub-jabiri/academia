import { Router } from "express";
import {
    authenticationCheck,
    authorizationCheck,
    paramsIdCheck,
    requestBodyCheck,
} from "../../middlewares/global.middlewares.js";
import {
    deleteGuardian,
    getGuardianParent,
    getGuardians,
    getGuardianStudent,
    getMyChildren,
    getSingleGuardian,
    registerGuardian,
    updateGuardian,
} from "./guardian.controller.js";
import {
    guardianAlreadyExistsCheck,
    guardianDataValidation,
    guardianExistsCheck,
    parentExistsCheck,
    studentExistsCheck,
} from "./guardian.middleware.js";

const router = Router();

router.use(authenticationCheck);

router.get("/", authorizationCheck(["admin"]), getGuardians);

router.post(
    "/",
    authorizationCheck(["admin"]),
    requestBodyCheck,
    guardianDataValidation,
    studentExistsCheck,
    parentExistsCheck,
    guardianAlreadyExistsCheck,
    registerGuardian
);

router.get("/my-children", authorizationCheck(["parent"]), getMyChildren);

router.get(
    "/:guardianId",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    getSingleGuardian
);

router.put(
    "/:guardianId",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    requestBodyCheck,
    guardianDataValidation,
    studentExistsCheck,
    parentExistsCheck,
    guardianAlreadyExistsCheck,
    updateGuardian
);

router.delete(
    "/:guardianId",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    deleteGuardian
);

router.get(
    "/:guardianId/student",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    getGuardianStudent
);

router.get(
    "/:guardianId/parent",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    getGuardianParent
);

export default router;
