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

/**
 * @swagger
 * /api/school-rooms:
 *   get:
 *     summary: Get a paginated, searchable list of school rooms
 *     tags: [School Rooms]
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
 *         description: Matches against room title or number
 *     responses:
 *       200:
 *         description: Paginated list of school rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage: { type: integer }
 *                 roomsPerPage: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalRooms: { type: integer }
 *                 rooms:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SchoolRoom' }
 *       401: { description: Not authenticated }
 */
router.get(
    "/",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    getSchoolRooms
);

/**
 * @swagger
 * /api/school-rooms:
 *   post:
 *     summary: Create a school room (admin only)
 *     tags: [School Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SchoolRoomInput' }
 *     responses:
 *       201:
 *         description: School room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 room: { $ref: '#/components/schemas/SchoolRoom' }
 *       400: { description: Validation error or room number already exists }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 */
router.post(
    "/",
    authorizationCheck(["admin"]),
    requestBodyCheck,
    schoolRoomDataValidation,
    schoolRoomNumberExistsCheck,
    registerSchoolRoom
);

/**
 * @swagger
 * /api/school-rooms/{schoolRoomId}:
 *   get:
 *     summary: Get a single school room by id
 *     tags: [School Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolRoomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested school room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room: { $ref: '#/components/schemas/SchoolRoom' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       404: { description: School room not found }
 */
router.get(
    "/:schoolRoomId",
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    paramsIdCheck("schoolRoomId"),
    schoolRoomExistsCheck,
    getSingleSchoolRoom
);

/**
 * @swagger
 * /api/school-rooms/{schoolRoomId}:
 *   put:
 *     summary: Update a school room (admin only)
 *     tags: [School Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolRoomId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SchoolRoomInput' }
 *     responses:
 *       200:
 *         description: School room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 room: { $ref: '#/components/schemas/SchoolRoom' }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: School room not found }
 */
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

/**
 * @swagger
 * /api/school-rooms/{schoolRoomId}:
 *   delete:
 *     summary: Delete a school room (admin only)
 *     tags: [School Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolRoomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: School room deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400: { description: Missing id parameter, or room still has classes assigned }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: School room not found }
 */
router.delete(
    "/:schoolRoomId",
    authorizationCheck(["admin"]),
    paramsIdCheck("schoolRoomId"),
    schoolRoomExistsCheck,
    schoolRoomDeleteCheck,
    deleteSchoolRoom
);

export default router;
