import request from "supertest";
import app from "../../app.js";
import { adminTestingToken, teacherTestingToken } from "../setup.js";
import User from "../../modules/users/user.model.js";

let teacherUserId;
let studentUserId;

beforeAll(async () => {
    const teacher = await User.create({
        fullName: "Alice Teacher",
        phoneNumber: "0600000001",
        email: "aliceteacher@gmail.com",
        password: "password123",
        gender: "female",
        role: "teacher",
    });
    teacherUserId = teacher._id;

    const student = await User.create({
        fullName: "Bob Student",
        phoneNumber: "0600000002",
        email: "bobstudent@gmail.com",
        password: "password123",
        gender: "male",
        role: "student",
    });
    studentUserId = student._id;
});

describe("get all users", () => {
    describe("success test cases", () => {
        test("get all users successfully as admin", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("users");
            expect(res.body).toHaveProperty("totalUsers");
            expect(res.body).toHaveProperty("totalPages");
            // Password must never be leaked in a list response.
            res.body.users.forEach((user) => {
                expect(user).not.toHaveProperty("password");
            });
        });

        test("filter users by role", async () => {
            const res = await request(app)
                .get("/api/users?role=student")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(
                res.body.users.every((user) => user.role === "student")
            ).toBe(true);
        });

        test("search users by name/email/phone", async () => {
            const res = await request(app)
                .get("/api/users?search=aliceteacher")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body.users.length).toBeGreaterThanOrEqual(1);
            expect(
                res.body.users.some(
                    (user) => user.email === "aliceteacher@gmail.com"
                )
            ).toBe(true);
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/users");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("forbidden role", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get single user", () => {
    describe("success test cases", () => {
        test("get a single user successfully", async () => {
            const res = await request(app)
                .get(`/api/users/${teacherUserId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).not.toHaveProperty("password");
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get(`/api/users/${teacherUserId}`);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("forbidden role", async () => {
            const res = await request(app)
                .get(`/api/users/${teacherUserId}`)
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        // NOTE: paramsIdCheck now returns 404 (not 400) for a malformed ID,
        // the same status it uses for a well-formed-but-missing ID — the two
        // cases are no longer distinguishable by status code alone.
        test("invalid user ID format", async () => {
            const res = await request(app)
                .get("/api/users/1111")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("user not found", async () => {
            const res = await request(app)
                .get("/api/users/111111111111111111111111")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("update user", () => {
    describe("success test cases", () => {
        test("update a user successfully", async () => {
            const res = await request(app)
                .put(`/api/users/${studentUserId}`)
                .send({
                    fullName: "Bob Updated",
                    phoneNumber: "0600000099",
                    email: "bobstudent@gmail.com",
                    gender: "male",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user.fullName).toBe("Bob Updated");
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app)
                .put(`/api/users/${studentUserId}`)
                .send({
                    fullName: "Bob Updated",
                    phoneNumber: "0600000099",
                    email: "bobstudent@gmail.com",
                    gender: "male",
                });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("forbidden role", async () => {
            const res = await request(app)
                .put(`/api/users/${studentUserId}`)
                .send({
                    fullName: "Bob Updated",
                    phoneNumber: "0600000099",
                    email: "bobstudent@gmail.com",
                    gender: "male",
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid user ID format", async () => {
            const res = await request(app)
                .put("/api/users/1111")
                .send({
                    fullName: "Bob Updated",
                    phoneNumber: "0600000099",
                    email: "bobstudent@gmail.com",
                    gender: "male",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("user not found", async () => {
            const res = await request(app)
                .put("/api/users/111111111111111111111111")
                .send({
                    fullName: "Bob Updated",
                    phoneNumber: "0600000099",
                    email: "bobstudent@gmail.com",
                    gender: "male",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("missing request body", async () => {
            const res = await request(app)
                .put(`/api/users/${studentUserId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("missing gender in request body", async () => {
            const res = await request(app)
                .put(`/api/users/${studentUserId}`)
                .send({
                    fullName: "Bob Updated",
                    phoneNumber: "0600000099",
                    email: "bobstudent@gmail.com",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("email conflicts with another existing user", async () => {
            const res = await request(app)
                .put(`/api/users/${studentUserId}`)
                .send({
                    fullName: "Bob Updated",
                    phoneNumber: "0600000099",
                    email: "aliceteacher@gmail.com",
                    gender: "male",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("message");
        });
    });
});
