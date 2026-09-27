import { Router } from "express";
import {
    authenticationCheck,
    authorizationCheck,
} from "../../middlewares/global.middlewares.js";
import {
    getAdminDashboard,
    getParentDashboard,
    getStudentDashboard,
    getTeacherDashboard,
} from "./dashboard.controller.js";

const router = Router();

router.use(authenticationCheck);

router.get("/admin/stats", authorizationCheck(["admin"]), getAdminDashboard);

/**
 * @swagger
 * /api/dashboard/teacher/stats:
 *   get:
 *     summary: Get aggregate stats for the teacher dashboard (teacher only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Shape depends on the current teacher dashboard implementation (own classes, homework, grades summaries, etc.)
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (teacher only) }
 */
router.get(
    "/teacher/stats",
    authorizationCheck(["teacher"]),
    getTeacherDashboard
);

/**
 * @swagger
 * /api/dashboard/student/stats:
 *   get:
 *     summary: Get aggregate stats for the student dashboard (student only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Shape depends on the current student dashboard implementation (own grades, homework, classes summaries, etc.)
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (student only) }
 */
router.get(
    "/student/stats",
    authorizationCheck(["student"]),
    getStudentDashboard
);

/**
 * @swagger
 * /api/dashboard/parent/stats:
 *   get:
 *     summary: Get aggregate stats for the parent dashboard (parent only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parent dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Shape depends on the current parent dashboard implementation (children's summaries, announcements, etc.)
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (parent only) }
 */
router.get("/parent/stats", authorizationCheck(["parent"]), getParentDashboard);

export default router;
