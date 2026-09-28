import { Router } from "express";
import {
    deleteSubject,
    getSingleSubject,
    getSubjects,
    registerSubject,
    updateSubject,
} from "./subject.controller.js";
import {
    authenticationCheck,
    authorizationCheck,
    paramsIdCheck,
    requestBodyCheck,
} from "../../middlewares/global.middlewares.js";
import {
    subjectDataValidation,
    subjectAlreadyExistCheck,
    subjectExistsCheck,
    subjectDeleteCheck,
} from "./subject.middleware.js";

const router = Router();

router.use(authenticationCheck);

router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getSubjects
);

router.post(
    "/",
    authorizationCheck(["admin"]),
    requestBodyCheck,
    subjectDataValidation,
    subjectAlreadyExistCheck,
    registerSubject
);

router.get(
    "/:subjectId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("subjectId"),
    subjectExistsCheck,
    getSingleSubject
);

router.put(
    "/:subjectId",
    authorizationCheck(["admin"]),
    paramsIdCheck("subjectId"),
    subjectExistsCheck,
    requestBodyCheck,
    subjectDataValidation,
    updateSubject
);

router.delete(
    "/:subjectId",
    authorizationCheck(["admin"]),
    paramsIdCheck("subjectId"),
    subjectExistsCheck,
    subjectDeleteCheck,
    deleteSubject
);

export default router;
