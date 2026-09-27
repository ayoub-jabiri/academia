import { Router } from "express";
import {
    getAdminUsers,
    getSingleUser,
    login,
    profile,
    register,
    updateUser,
} from "./user.controller.js";
import {
    loginDataValidationCheck,
    passwordMatchCheck,
    registerDataValidationCheck,
    userExistCheck,
    userExistsByIdCheck,
    userNotExistCheck,
    userUpdateDataValidationCheck,
    userUpdateExistCheck,
} from "./user.middleware.js";
import {
    authenticationCheck,
    authorizationCheck,
    paramsIdCheck,
    requestBodyCheck,
} from "../../middlewares/global.middlewares.js";

const router = Router();

/**
 * @swagger
 * /api/users/auth/register:
 *   post:
 *     summary: Register a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserInput' }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error or email already registered }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 */
router.post(
    "/auth/register",
    authenticationCheck,
    authorizationCheck(["admin"]),
    requestBodyCheck,
    registerDataValidationCheck,
    userExistCheck,
    register
);

/**
 * @swagger
 * /api/users/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error }
 *       401: { description: Invalid email or password }
 */
router.post(
    "/auth/login",
    requestBodyCheck,
    loginDataValidationCheck,
    userNotExistCheck,
    passwordMatchCheck,
    login
);

/**
 * @swagger
 * /api/users/auth/profile:
 *   get:
 *     summary: Get the authenticated user's own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The authenticated user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       401: { description: Not authenticated }
 */
router.get(
    "/auth/profile",
    authenticationCheck,
    authorizationCheck(["admin", "teacher", "student", "parent"]),
    profile
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get a paginated, searchable, filterable list of users (admin only)
 *     tags: [Users]
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
 *         description: Matches against name/email
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [admin, teacher, student, parent] }
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage: { type: integer }
 *                 usersPerPage: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalUsers: { type: integer }
 *                 users:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 */
router.get(
    "/",
    authenticationCheck,
    authorizationCheck(["admin"]),
    getAdminUsers
);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get a single user by id (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Missing id parameter }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: User not found }
 */
router.get(
    "/:userId",
    authenticationCheck,
    authorizationCheck(["admin"]),
    paramsIdCheck("userId"),
    userExistsByIdCheck,
    getSingleUser
);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserUpdateInput' }
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error or email already in use }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized (admin only) }
 *       404: { description: User not found }
 */
router.put(
    "/:userId",
    authenticationCheck,
    authorizationCheck(["admin"]),
    paramsIdCheck("userId"),
    userExistsByIdCheck,
    requestBodyCheck,
    userUpdateDataValidationCheck,
    userUpdateExistCheck,
    updateUser
);

export default router;
