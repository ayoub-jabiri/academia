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

/**
 * @swagger
 * /api/homeworks:
 *   get:
 *     summary: Get a paginated, filtered list of homework assignments, scoped by role
 *     tags: [Homework]
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
 *         description: Matches against title/description
 *       - in: query
 *         name: classId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of homework assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage: { type: integer }
 *                 homeworksPerPage: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalHomeworks: { type: integer }
 *                 homeworks:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Homework' }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized }
 */
router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getHomeworks
);

/**
 * @swagger
 * /api/homeworks:
 *   post:
 *     summary: Create a homework assignment (teacher only, must be the class's own teacher)
 *     tags: [Homework]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/HomeworkInput' }
 *     responses:
 *       201:
 *         description: Homework created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 homework: { $ref: '#/components/schemas/Homework' }
 *       400: { description: Validation error or class not found }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (teacher only, or not this class's teacher) }
 */
router.post(
    "/",
    authorizationCheck(["teacher"]),
    requestBodyCheck,
    homeworkDataValidation,
    teacherCheck,
    classCheck,
    registerHomework
);

/**
 * @swagger
 * /api/homeworks/{homeworkId}:
 *   get:
 *     summary: Get a single homework assignment by id (admin, the assigning teacher, or a student in the class only)
 *     tags: [Homework]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeworkId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested homework assignment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 homework: { $ref: '#/components/schemas/Homework' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized to view this homework }
 *       404: { description: Homework not found }
 */
router.get(
    "/:homeworkId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("homeworkId"),
    homeworkExistsCheck,
    homeworkAccessCheck,
    getSingleHomework
);

/**
 * @swagger
 * /api/homeworks/{homeworkId}:
 *   put:
 *     summary: Update a homework assignment (teacher only, must be its own assignment)
 *     tags: [Homework]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeworkId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Homework updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 homework: { $ref: '#/components/schemas/Homework' }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (not this homework's teacher) }
 *       404: { description: Homework not found }
 */
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

/**
 * @swagger
 * /api/homeworks/{homeworkId}:
 *   delete:
 *     summary: Delete a homework assignment (teacher only, must be its own assignment)
 *     tags: [Homework]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeworkId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Homework deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (not this homework's teacher) }
 *       404: { description: Homework not found }
 */
router.delete(
    "/:homeworkId",
    authorizationCheck(["teacher"]),
    paramsIdCheck("homeworkId"),
    homeworkExistsCheck,
    homeworkAccessCheck,
    deleteHomework
);

export default router;
