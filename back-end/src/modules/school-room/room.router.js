import { Router } from "express";
import {
    authenticationCheck,
    authorizationCheck,
    paramsIdCheck,
    requestBodyCheck,
} from "../../middlewares/global.middlewares.js";
import {
    deleteSchoolRoom,
    getSchoolRooms,
    getSingleSchoolRoom,
    registerSchoolRoom,
    updateSchoolRoom,
} from "./room.controller.js";
import {
    schoolRoomDataValidation,
    schoolRoomDeleteCheck,
    schoolRoomExistsCheck,
    schoolRoomNumberExistsCheck,
    schoolRoomRegisterCheck,
} from "./room.middleware.js";

const router = Router();

router.use(authenticationCheck);

router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getSchoolRooms
);

router.post(
    "/",
    authorizationCheck(["admin"]),
    requestBodyCheck,
    schoolRoomDataValidation,
    schoolRoomNumberExistsCheck,
    registerSchoolRoom
);

router.get(
    "/:schoolRoomId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("schoolRoomId"),
    schoolRoomExistsCheck,
    getSingleSchoolRoom
);

router.put(
    "/:schoolRoomId",
    authorizationCheck(["admin"]),
    paramsIdCheck("schoolRoomId"),
    schoolRoomExistsCheck,
    requestBodyCheck,
    schoolRoomDataValidation,
    schoolRoomRegisterCheck,
    updateSchoolRoom
);

router.delete(
    "/:schoolRoomId",
    authorizationCheck(["admin"]),
    paramsIdCheck("schoolRoomId"),
    schoolRoomExistsCheck,
    schoolRoomDeleteCheck,
    deleteSchoolRoom
);

export default router;
