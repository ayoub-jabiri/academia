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

/**
 * @swagger
 * /api/announcements:
 *   get:
 *     summary: Get a paginated, filtered list of announcements. Non-admins only ever see announcements targeted at "all" or their own role.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 15 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches against title or description
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [general, academic, event, urgent] }
 *       - in: query
 *         name: targetAudience
 *         schema: { type: string, enum: [all, teacher, student, parent] }
 *         description: Admin only — non-admins are already scoped to their own audience
 *     responses:
 *       200:
 *         description: Paginated list of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage: { type: integer }
 *                 announcementsPerPage: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalAnnouncements: { type: integer }
 *                 announcements:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Announcement' }
 *       401: { description: Not authenticated }
 */
router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getAnnouncements
);

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Create an announcement (admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AnnouncementInput' }
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 announcement: { $ref: '#/components/schemas/Announcement' }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 */
router.post(
    "/",
    authorizationCheck(["admin"]),
    requestBodyCheck,
    announcementDataValidation,
    registerAnnouncement
);

/**
 * @swagger
 * /api/announcements/{announcementId}:
 *   get:
 *     summary: Get a single announcement by id (blocked for non-admins if it isn't targeted at "all" or their own role)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested announcement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 announcement: { $ref: '#/components/schemas/Announcement' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized to view this announcement }
 *       404: { description: Announcement not found }
 */
router.get(
    "/:announcementId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("announcementId"),
    announcementExistsCheck,
    getSingleAnnouncement
);

/**
 * @swagger
 * /api/announcements/{announcementId}:
 *   put:
 *     summary: Update an announcement (admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AnnouncementInput' }
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 announcement: { $ref: '#/components/schemas/Announcement' }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Announcement not found }
 */
router.put(
    "/:announcementId",
    authorizationCheck(["admin"]),
    paramsIdCheck("announcementId"),
    announcementExistsCheck,
    requestBodyCheck,
    announcementDataValidation,
    updateAnnouncement
);

/**
 * @swagger
 * /api/announcements/{announcementId}:
 *   delete:
 *     summary: Delete an announcement (admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Announcement not found }
 */
router.delete(
    "/:announcementId",
    authorizationCheck(["admin"]),
    paramsIdCheck("announcementId"),
    announcementExistsCheck,
    deleteAnnouncement
);

export default router;
