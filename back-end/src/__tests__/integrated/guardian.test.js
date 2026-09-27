import request from "supertest";
import app from "../../app.js";
import { adminTestingToken, teacherTestingToken } from "../setup.js";
import { signToken } from "../../utils/user.utils.js";
import User from "../../modules/users/user.model.js";
import Guardian from "../../modules/guardian/guardian.model.js";

let guardianId;
let secondGuardianId;

let studentId;
let parentId;
let secondStudentId;
let secondParentId;
let teacherId;
let parentToken;

beforeAll(async () => {
    const student = await User.create({
        fullName: "Student One",
        phoneNumber: "0600000001",
        email: "studentone@gmail.com",
        password: "password123",
        gender: "male",
        role: "student",
    });
    studentId = student._id;

    const parent = await User.create({
        fullName: "Parent One",
        phoneNumber: "0600000002",
        email: "parentone@gmail.com",
        password: "password123",
        gender: "female",
        role: "parent",
    });
    parentId = parent._id;
    parentToken = signToken({ _id: parentId, role: "parent" });

    const secondStudent = await User.create({
        fullName: "Student Two",
        phoneNumber: "0600000003",
        email: "studenttwo@gmail.com",
        password: "password123",
        gender: "female",
        role: "student",
    });
    secondStudentId = secondStudent._id;

    const secondParent = await User.create({
        fullName: "Parent Two",
        phoneNumber: "0600000004",
        email: "parenttwo@gmail.com",
        password: "password123",
        gender: "male",
        role: "parent",
    });
    secondParentId = secondParent._id;

    const teacher = await User.create({
        fullName: "Teacher One",
        phoneNumber: "0600000005",
        email: "teacherone@gmail.com",
        password: "password123",
        gender: "female",
        role: "teacher",
    });
    teacherId = teacher._id;
});

describe("guardian register", () => {
    describe("success test cases", () => {
        test("guardian registered successfully", async () => {
            const res = await request(app)
                .post("/api/guardians")
                .send({ studentId, parentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("guardian");

            guardianId = res.body.guardian._id;
        });

        test("a second guardian link is registered successfully", async () => {
            const res = await request(app)
                .post("/api/guardians")
                .send({ studentId: secondStudentId, parentId: secondParentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(201);

            secondGuardianId = res.body.guardian._id;
        });
    });

    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app)
                .post("/api/guardians")
                .send({ studentId, parentId });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .post("/api/guardians")
                .send({ studentId, parentId })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("registered user is not a student", async () => {
            const res = await request(app)
                .post("/api/guardians")
                .send({ studentId: teacherId, parentId: secondParentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("registered user is not a parent", async () => {
            const res = await request(app)
                .post("/api/guardians")
                .send({ studentId: secondStudentId, parentId: teacherId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("duplicate guardian", async () => {
            const res = await request(app)
                .post("/api/guardians")
                .send({ studentId, parentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get all guardians", () => {
    describe("success test cases", () => {
        test("get all guardians successfully", async () => {
            const res = await request(app)
                .get("/api/guardians")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("guardians");
            expect(res.body).toHaveProperty("totalGuardians");
        });

        test("search guardians by the parent's name", async () => {
            const res = await request(app)
                .get("/api/guardians?search=Parent One")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body.guardians.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app).get("/api/guardians");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get my children (parent self-service)", () => {
    describe("success test cases", () => {
        test("a parent gets their own linked children", async () => {
            const res = await request(app)
                .get("/api/guardians/my-children")
                .set("Authorization", `Bearer ${parentToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("children");
            expect(res.body.children).toHaveLength(1);
            expect(res.body.children[0]._id).toBe(studentId.toString());
        });

        test("a parent with no linked children gets an empty list", async () => {
            const lonelyParent = await User.create({
                fullName: "Lonely Parent",
                phoneNumber: "0600000006",
                email: "lonelyparent@gmail.com",
                password: "password123",
                gender: "male",
                role: "parent",
            });
            const lonelyParentToken = signToken({
                _id: lonelyParent._id,
                role: "parent",
            });

            const res = await request(app)
                .get("/api/guardians/my-children")
                .set("Authorization", `Bearer ${lonelyParentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.children).toHaveLength(0);
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/guardians/my-children");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("forbidden role", async () => {
            const res = await request(app)
                .get("/api/guardians/my-children")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("admin cannot use the parent self-service route either", async () => {
            const res = await request(app)
                .get("/api/guardians/my-children")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get single guardian", () => {
    describe("success test cases", () => {
        test("get single guardian successfully", async () => {
            const res = await request(app)
                .get(`/api/guardians/${guardianId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("guardian");
        });
    });

    describe("failure test cases", () => {
        test("invalid guardian ID", async () => {
            const res = await request(app)
                .get(`/api/guardians/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("guardian not found", async () => {
            const res = await request(app)
                .get(`/api/guardians/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("update guardian", () => {
    describe("failure test cases", () => {
        test("registered user is not a student", async () => {
            const res = await request(app)
                .put(`/api/guardians/${guardianId}`)
                .send({ studentId: teacherId, parentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("update to a pairing that already exists elsewhere", async () => {
            const res = await request(app)
                .put(`/api/guardians/${guardianId}`)
                .send({
                    studentId: secondStudentId,
                    parentId: secondParentId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get guardian student / parent", () => {
    test("get guardian student successfully", async () => {
        const res = await request(app)
            .get(`/api/guardians/${guardianId}/student`)
            .set("Authorization", `Bearer ${adminTestingToken}`);
        expect(res.status).toBe(200);
        expect(res.body.student).not.toHaveProperty("password");
    });

    test("get guardian parent successfully", async () => {
        const res = await request(app)
            .get(`/api/guardians/${guardianId}/parent`)
            .set("Authorization", `Bearer ${adminTestingToken}`);
        expect(res.status).toBe(200);
        expect(res.body.parent).not.toHaveProperty("password");
    });
});

describe("delete guardian", () => {
    describe("failure test cases", () => {
        test("guardian not found", async () => {
            const res = await request(app)
                .delete(`/api/guardians/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("delete guardian successfully", async () => {
            const res = await request(app)
                .delete(`/api/guardians/${guardianId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");
        });

        test("delete the second guardian successfully", async () => {
            const res = await request(app)
                .delete(`/api/guardians/${secondGuardianId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
        });
    });
});
