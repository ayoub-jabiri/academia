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

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get a paginated, filtered list of grades, scoped by role (admin sees all, teacher sees grades they gave, student sees their own)
 *     tags: [Grades]
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
 *         description: Matches against the evaluation name
 *       - in: query
 *         name: classId
 *         schema: { type: string }
 *       - in: query
 *         name: studentId
 *         schema: { type: string }
 *         description: Ignored for students (already scoped to themselves)
 *       - in: query
 *         name: subjectId
 *         schema: { type: string }
 *         description: Resolved via the classes that teach this subject
 *     responses:
 *       200:
 *         description: Paginated list of grades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage: { type: integer }
 *                 gradesPerPage: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalGrades: { type: integer }
 *                 grades:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Grade' }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized }
 */
router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getGrades
);

/**
 * @swagger
 * /api/grades:
 *   post:
 *     summary: Record a grade for a student (teacher only, must be the class's own teacher)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GradeInput' }
 *     responses:
 *       201:
 *         description: Grade recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 grade: { $ref: '#/components/schemas/Grade' }
 *       400: { description: Validation error, class not found, or student not enrolled in the class }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (teacher only, or not this class's teacher) }
 */
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

/**
 * @swagger
 * /api/grades/{gradeId}:
 *   get:
 *     summary: Get a single grade by id (admin, the grading teacher, or the owning student only)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested grade
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 grade: { $ref: '#/components/schemas/Grade' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized to view this grade }
 *       404: { description: Grade not found }
 */
router.get(
    "/:gradeId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("gradeId"),
    gradeExistsCheck,
    gradeAccessCheck,
    getSingleGrade
);

/**
 * @swagger
 * /api/grades/{gradeId}:
 *   put:
 *     summary: Update a grade's evaluation name and score (teacher only, must be its own grade)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GradeUpdateInput' }
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 grade: { $ref: '#/components/schemas/Grade' }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (not this grade's teacher) }
 *       404: { description: Grade not found }
 */
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

/**
 * @swagger
 * /api/grades/{gradeId}:
 *   delete:
 *     summary: Delete a grade (teacher only, must be its own grade)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Grade deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (not this grade's teacher) }
 *       404: { description: Grade not found }
 */
router.delete(
    "/:gradeId",
    authorizationCheck(["teacher"]),
    paramsIdCheck("gradeId"),
    gradeExistsCheck,
    gradeAccessCheck,
    deleteGrade
);

export default router;
