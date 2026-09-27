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

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get a paginated, searchable list of subjects
 *     tags: [Subjects]
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
 *         description: Matches against the subject title
 *     responses:
 *       200:
 *         description: Paginated list of subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage: { type: integer }
 *                 subjectsPerPage: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalSubjects: { type: integer }
 *                 subjects:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Subject' }
 *       401: { description: Not authenticated }
 */
router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getSubjects
);

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a subject (admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SubjectInput' }
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 subject: { $ref: '#/components/schemas/Subject' }
 *       400: { description: Validation error or subject title already exists }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 */
router.post(
    "/",
    authorizationCheck(["admin"]),
    requestBodyCheck,
    subjectDataValidation,
    subjectAlreadyExistCheck,
    registerSubject
);

/**
 * @swagger
 * /api/subjects/{subjectId}:
 *   get:
 *     summary: Get a single subject by id
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested subject
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subject: { $ref: '#/components/schemas/Subject' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       404: { description: Subject not found }
 */
router.get(
    "/:subjectId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("subjectId"),
    subjectExistsCheck,
    getSingleSubject
);

/**
 * @swagger
 * /api/subjects/{subjectId}:
 *   put:
 *     summary: Update a subject (admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SubjectInput' }
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 subject: { $ref: '#/components/schemas/Subject' }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Subject not found }
 */
router.put(
    "/:subjectId",
    authorizationCheck(["admin"]),
    paramsIdCheck("subjectId"),
    subjectExistsCheck,
    requestBodyCheck,
    subjectDataValidation,
    updateSubject
);

/**
 * @swagger
 * /api/subjects/{subjectId}:
 *   delete:
 *     summary: Delete a subject (admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400: { description: Missing id parameter, or subject still has classes assigned }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Subject not found }
 */
router.delete(
    "/:subjectId",
    authorizationCheck(["admin"]),
    paramsIdCheck("subjectId"),
    subjectExistsCheck,
    subjectDeleteCheck,
    deleteSubject
);

export default router;
