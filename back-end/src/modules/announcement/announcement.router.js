import { Router } from "express";
import {
    authenticationCheck,
    authorizationCheck,
    paramsIdCheck,
    requestBodyCheck,
} from "../../middlewares/global.middlewares.js";
import {
    deleteAnnouncement,
    getAnnouncements,
    getSingleAnnouncement,
    registerAnnouncement,
    updateAnnouncement,
} from "./announcement.controller.js";
import {
    announcementDataValidation,
    announcementExistsCheck,
} from "./announcement.middleware.js";

const router = Router();

router.use(authenticationCheck);

router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getAnnouncements
);

router.post(
    "/",
    authorizationCheck(["admin"]),
    requestBodyCheck,
    announcementDataValidation,
    registerAnnouncement
);

router.get(
    "/:announcementId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("announcementId"),
    announcementExistsCheck,
    getSingleAnnouncement
);

router.put(
    "/:announcementId",
    authorizationCheck(["admin"]),
    paramsIdCheck("announcementId"),
    announcementExistsCheck,
    requestBodyCheck,
    announcementDataValidation,
    updateAnnouncement
);

router.delete(
    "/:announcementId",
    authorizationCheck(["admin"]),
    paramsIdCheck("announcementId"),
    announcementExistsCheck,
    deleteAnnouncement
);

export default router;
