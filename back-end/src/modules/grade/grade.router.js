import { Router } from "express";
import {
    authenticationCheck,
    authorizationCheck,
    paramsIdCheck,
    requestBodyCheck,
} from "../../middlewares/global.middlewares.js";
import {
    deleteGrade,
    getGrades,
    getSingleGrade,
    registerGrade,
    updateGrade,
} from "./grade.controller.js";
import {
    gradeDataValidation,
    gradeExistsCheck,
    studentCheck,
    classCheck,
    teacherCheck,
    updateGradeDataValidation,
    gradeAccessCheck,
} from "./grade.middleware.js";

const router = Router();

router.use(authenticationCheck);

router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getGrades
);

router.post(
    "/",
    authorizationCheck(["teacher"]),
    requestBodyCheck,
    gradeDataValidation,
    teacherCheck,
    classCheck,
    studentCheck,
    registerGrade
);

router.get(
    "/:gradeId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("gradeId"),
    gradeExistsCheck,
    gradeAccessCheck,
    getSingleGrade
);

router.put(
    "/:gradeId",
    authorizationCheck(["teacher"]),
    paramsIdCheck("gradeId"),
    gradeExistsCheck,
    gradeAccessCheck,
    requestBodyCheck,
    updateGradeDataValidation,
    updateGrade
);

router.delete(
    "/:gradeId",
    authorizationCheck(["teacher"]),
    paramsIdCheck("gradeId"),
    gradeExistsCheck,
    gradeAccessCheck,
    deleteGrade
);

export default router;
