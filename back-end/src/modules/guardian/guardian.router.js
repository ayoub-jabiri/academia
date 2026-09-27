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

/**
 * @swagger
 * /api/guardians:
 *   get:
 *     summary: Get a paginated, searchable list of parent-student guardian links (admin only)
 *     tags: [Guardians]
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
 *     responses:
 *       200:
 *         description: Paginated list of guardian links
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage: { type: integer }
 *                 guardiansPerPage: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalGuardians: { type: integer }
 *                 guardians:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Guardian' }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 */
router.get("/", authorizationCheck(["admin"]), getGuardians);

/**
 * @swagger
 * /api/guardians:
 *   post:
 *     summary: Link a parent to a student (admin only)
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GuardianInput' }
 *     responses:
 *       201:
 *         description: Guardian link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 guardian: { $ref: '#/components/schemas/Guardian' }
 *       400: { description: Validation error, student/parent not found, or link already exists }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 */
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

/**
 * @swagger
 * /api/guardians/my-children:
 *   get:
 *     summary: Get the authenticated parent's own linked children (self-service, parent only)
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the parent's own children
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 children:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (parent only) }
 */

router.get("/my-children", authorizationCheck(["parent"]), getMyChildren);

/**
 * @swagger
 * /api/guardians/{guardianId}:
 *   get:
 *     summary: Get a single guardian link by id (admin only)
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested guardian link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guardian: { $ref: '#/components/schemas/Guardian' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Guardian link not found }
 */
router.get(
    "/:guardianId",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    getSingleGuardian
);

/**
 * @swagger
 * /api/guardians/{guardianId}:
 *   put:
 *     summary: Update a guardian link (admin only)
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GuardianInput' }
 *     responses:
 *       200:
 *         description: Guardian link updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 guardian: { $ref: '#/components/schemas/Guardian' }
 *       400: { description: Validation error, student/parent not found, or link already exists }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Guardian link not found }
 */
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

/**
 * @swagger
 * /api/guardians/{guardianId}:
 *   delete:
 *     summary: Delete a guardian link (admin only)
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Guardian link deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Guardian link not found }
 */
router.delete(
    "/:guardianId",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    deleteGuardian
);

/**
 * @swagger
 * /api/guardians/{guardianId}/student:
 *   get:
 *     summary: Get the student for a guardian link (admin only)
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The linked student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student: { $ref: '#/components/schemas/User' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Guardian link not found }
 */
router.get(
    "/:guardianId/student",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    getGuardianStudent
);

/**
 * @swagger
 * /api/guardians/{guardianId}/parent:
 *   get:
 *     summary: Get the parent for a guardian link (admin only)
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The linked parent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 parent: { $ref: '#/components/schemas/User' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Guardian link not found }
 */
router.get(
    "/:guardianId/parent",
    authorizationCheck(["admin"]),
    paramsIdCheck("guardianId"),
    guardianExistsCheck,
    getGuardianParent
);

export default router;
