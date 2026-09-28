import { Router } from "express";
import {
    authenticationCheck,
    authorizationCheck,
    paramsIdCheck,
    requestBodyCheck,
} from "../../middlewares/global.middlewares.js";
import {
    deleteHomework,
    getHomeworks,
    getSingleHomework,
    registerHomework,
    updateHomework,
} from "./homework.controller.js";
import {
    homeworkDataValidation,
    homeworkExistsCheck,
    classCheck,
    teacherCheck,
    updateHomeworkDataValidation,
    homeworkAccessCheck,
} from "./homework.middleware.js";

const router = Router();

router.use(authenticationCheck);

router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getHomeworks
);

router.post(
    "/",
    authorizationCheck(["teacher"]),
    requestBodyCheck,
    homeworkDataValidation,
    teacherCheck,
    classCheck,
    registerHomework
);

router.get(
    "/:homeworkId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("homeworkId"),
    homeworkExistsCheck,
    homeworkAccessCheck,
    getSingleHomework
);

router.put(
    "/:homeworkId",
    authorizationCheck(["teacher"]),
    paramsIdCheck("homeworkId"),
    homeworkExistsCheck,
    homeworkAccessCheck,
    requestBodyCheck,
    updateHomeworkDataValidation,
    updateHomework
);

router.delete(
    "/:homeworkId",
    authorizationCheck(["teacher"]),
    paramsIdCheck("homeworkId"),
    homeworkExistsCheck,
    homeworkAccessCheck,
    deleteHomework
);

export default router;
