import { Router } from "express";
import {
    authenticationCheck,
    authorizationCheck,
    paramsIdCheck,
    requestBodyCheck,
} from "../../middlewares/global.middlewares.js";
import {
    assignTeacherToClass,
    deleteClass,
    getClasses,
    getClassSchoolRoom,
    getClassStudents,
    getClassTeacher,
    getSingleClass,
    registerClass,
    registerStudentToClass,
    unassignTeacherToClass,
    unregisterStudentToClass,
    updateClass,
} from "./class.controller.js";
import {
    assignTeacherDataValidation,
    classAlreadyExistsCheck,
    classDataValidation,
    classDeleteCheck,
    classExistsCheck,
    schoolRoomExistsCheck,
    studentRegistrationCheck,
    studentRegistrationDataValidation,
    subjectExistsCheck,
    teacherAssignmentCheck,
} from "./class.middleware.js";

const router = Router();

router.use(authenticationCheck);

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get a paginated, searchable, filterable list of classes
 *     tags: [Classes]
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
 *         description: Matches level, year, or group
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [primary, middle, high] }
 *       - in: query
 *         name: mine
 *         schema: { type: boolean }
 *         description: Scope results to classes the requesting user is personally involved in (teacher's own classes, a student's own classes, or a parent's children's classes). Ignored for admins.
 *       - in: query
 *         name: studentId
 *         schema: { type: string }
 *         description: Scope results to one specific student's classes. Admins/teachers may pass any student id; a parent may only pass one of their own children's ids.
 *     responses:
 *       200:
 *         description: Paginated list of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage: { type: integer }
 *                 classesPerPage: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalClasses: { type: integer }
 *                 classes:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Class' }
 *       401: { description: Not authenticated }
 */
router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getClasses
);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClassInput' }
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 class: { $ref: '#/components/schemas/Class' }
 *       400: { description: Validation error, room/subject not found, or an identical class already exists }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 */
router.post(
    "/",
    authorizationCheck(["admin"]),
    requestBodyCheck,
    classDataValidation,
    schoolRoomExistsCheck,
    subjectExistsCheck,
    classAlreadyExistsCheck,
    registerClass
);

/**
 * @swagger
 * /api/classes/{classId}:
 *   get:
 *     summary: Get a single class by id
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 class: { $ref: '#/components/schemas/Class' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       404: { description: Class not found }
 */
router.get(
    "/:classId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    getSingleClass
);

/**
 * @swagger
 * /api/classes/{classId}:
 *   put:
 *     summary: Update a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClassInput' }
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 class: { $ref: '#/components/schemas/Class' }
 *       400: { description: Validation error or room not found }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.put(
    "/:classId",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    requestBodyCheck,
    classDataValidation,
    schoolRoomExistsCheck,
    updateClass
);

/**
 * @swagger
 * /api/classes/{classId}:
 *   delete:
 *     summary: Delete a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400: { description: Missing id parameter, or class still has students/teacher assigned }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.delete(
    "/:classId",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    classDeleteCheck,
    deleteClass
);

/**
 * @swagger
 * /api/classes/{classId}/assign-teacher:
 *   patch:
 *     summary: Assign a teacher to a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [teacherId]
 *             properties:
 *               teacherId: { type: string }
 *     responses:
 *       200:
 *         description: Teacher assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 class: { $ref: '#/components/schemas/Class' }
 *       400: { description: Validation error, teacher not found, or class already has a teacher }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.patch(
    "/:classId/assign-teacher",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    teacherAssignmentCheck("hasTeacher"),
    requestBodyCheck,
    assignTeacherDataValidation,
    assignTeacherToClass
);

/**
 * @swagger
 * /api/classes/{classId}/unassign-teacher:
 *   patch:
 *     summary: Remove the assigned teacher from a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Teacher unassigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 class: { $ref: '#/components/schemas/Class' }
 *       400: { description: Class does not currently have a teacher assigned }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.patch(
    "/:classId/unassign-teacher",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    teacherAssignmentCheck("doesNotHaveTeacher"),
    unassignTeacherToClass
);

/**
 * @swagger
 * /api/classes/{classId}/register-student:
 *   patch:
 *     summary: Register a student into a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId]
 *             properties:
 *               studentId: { type: string }
 *     responses:
 *       200:
 *         description: Student registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 class: { $ref: '#/components/schemas/Class' }
 *       400: { description: Validation error, student not found, or student already registered }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.patch(
    "/:classId/register-student",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    requestBodyCheck,
    studentRegistrationDataValidation,
    studentRegistrationCheck("isRegistered"),
    registerStudentToClass
);

/**
 * @swagger
 * /api/classes/{classId}/unregister-student:
 *   patch:
 *     summary: Unregister a student from a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId]
 *             properties:
 *               studentId: { type: string }
 *     responses:
 *       200:
 *         description: Student unregistered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 class: { $ref: '#/components/schemas/Class' }
 *       400: { description: Validation error, student not found, or student not registered in this class }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.patch(
    "/:classId/unregister-student",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    requestBodyCheck,
    studentRegistrationDataValidation,
    studentRegistrationCheck("isNotRegistered"),
    unregisterStudentToClass
);

/**
 * @swagger
 * /api/classes/{classId}/school-room:
 *   get:
 *     summary: Get the school room assigned to a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The class's assigned school room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room: { $ref: '#/components/schemas/SchoolRoom' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.get(
    "/:classId/school-room",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    getClassSchoolRoom
);

/**
 * @swagger
 * /api/classes/{classId}/teacher:
 *   get:
 *     summary: Get the teacher assigned to a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The class's assigned teacher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teacher:
 *                   allOf:
 *                     - { $ref: '#/components/schemas/User' }
 *                   nullable: true
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.get(
    "/:classId/teacher",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    getClassTeacher
);

/**
 * @swagger
 * /api/classes/{classId}/students:
 *   get:
 *     summary: Get the students registered in a class (admin only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The class's registered students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: Class not found }
 */
router.get(
    "/:classId/students",
    authorizationCheck(["admin"]),
    paramsIdCheck("classId"),
    classExistsCheck,
    getClassStudents
);

export default router;
