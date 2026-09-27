import request from "supertest";
import app from "../../app.js";
import { adminTestingToken, teacherTestingToken } from "../setup.js";
import { signToken } from "../../utils/user.utils.js";
import User from "../../modules/users/user.model.js";
import Subject from "../../modules/subject/subject.model.js";
import SchoolRoom from "../../modules/school-room/room.model.js";
import ClassModel from "../../modules/class/class.model.js";
import Guardian from "../../modules/guardian/guardian.model.js";

let schoolRoomId;
let subjectId;
let teacherId;
let secondTeacherToken;
let studentId;
let studentToken;
let secondStudentToken;
let parentToken;
let unrelatedParentToken;
let mainClassId;
let secondTeacherClassId;

let homeworkId;

beforeAll(async () => {
    const subject = await Subject.create({ title: "mathematics" });
    subjectId = subject._id;

    const schoolRoom = await SchoolRoom.create({
        title: "Room A",
        roomNumber: 501,
    });
    schoolRoomId = schoolRoom._id;

    const teacher = await User.create({
        _id: "64b8f1e2c9e77f0012345678",
        fullName: "Jane Smith",
        phoneNumber: "0600000010",
        email: "janesmith@gmail.com",
        password: "password123",
        gender: "female",
        role: "teacher",
    });
    teacherId = teacher._id;

    const secondTeacher = await User.create({
        fullName: "Second Teacher",
        phoneNumber: "0600000011",
        email: "secondteacher@gmail.com",
        password: "password123",
        gender: "male",
        role: "teacher",
    });
    secondTeacherToken = signToken({ _id: secondTeacher._id, role: "teacher" });

    const student = await User.create({
        fullName: "Homework Student",
        phoneNumber: "0600000012",
        email: "homeworkstudent@gmail.com",
        password: "password123",
        gender: "male",
        role: "student",
    });
    studentId = student._id;
    studentToken = signToken({ _id: studentId, role: "student" });

    const secondStudent = await User.create({
        fullName: "Unregistered Student",
        phoneNumber: "0600000013",
        email: "unregisteredstudent2@gmail.com",
        password: "password123",
        gender: "female",
        role: "student",
    });
    secondStudentToken = signToken({ _id: secondStudent._id, role: "student" });

    const parent = await User.create({
        fullName: "Homework Parent",
        phoneNumber: "0600000015",
        email: "homeworkparent@gmail.com",
        password: "password123",
        gender: "female",
        role: "parent",
    });
    parentToken = signToken({ _id: parent._id, role: "parent" });
    await Guardian.create({ studentId, parentId: parent._id });

    const unrelatedParent = await User.create({
        fullName: "Unrelated Parent",
        phoneNumber: "0600000016",
        email: "unrelatedparenthw@gmail.com",
        password: "password123",
        gender: "male",
        role: "parent",
    });
    unrelatedParentToken = signToken({
        _id: unrelatedParent._id,
        role: "parent",
    });

    const mainClass = await ClassModel.create({
        level: "primary",
        levelYear: 3,
        group: 1,
        teacherId,
        students: [studentId],
        schoolRoomId,
        subjectId,
    });
    mainClassId = mainClass._id;

    const secondTeacherClass = await ClassModel.create({
        level: "primary",
        levelYear: 3,
        group: 2,
        teacherId: secondTeacher._id,
        students: [],
        schoolRoomId,
        subjectId,
    });
    secondTeacherClassId = secondTeacherClass._id;
});

describe("homework register", () => {
    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).post("/api/homeworks").send({
                title: "Algebra exercises",
                description: "Do exercises 1 to 10",
                dueDate: "2026-09-20",
                classId: mainClassId,
            });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("non-teacher token", async () => {
            const res = await request(app)
                .post("/api/homeworks")
                .send({
                    title: "Algebra exercises",
                    description: "Do exercises 1 to 10",
                    dueDate: "2026-09-20",
                    classId: mainClassId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("class does not belong to this teacher", async () => {
            const res = await request(app)
                .post("/api/homeworks")
                .send({
                    title: "Algebra exercises",
                    description: "Do exercises 1 to 10",
                    dueDate: "2026-09-20",
                    classId: secondTeacherClassId,
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid dueDate format", async () => {
            const res = await request(app)
                .post("/api/homeworks")
                .send({
                    title: "Algebra exercises",
                    description: "Do exercises 1 to 10",
                    dueDate: "not-a-date",
                    classId: mainClassId,
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("homework registered successfully", async () => {
            const res = await request(app)
                .post("/api/homeworks")
                .send({
                    title: "Algebra exercises",
                    description: "Do exercises 1 to 10",
                    dueDate: "2026-09-20",
                    classId: mainClassId,
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("homework");
            expect(res.body.homework.teacherId).toBe(teacherId.toString());

            homeworkId = res.body.homework._id;
        });
    });
});

describe("get all homeworks", () => {
    describe("success test cases", () => {
        test("get all homeworks successfully as admin", async () => {
            const res = await request(app)
                .get("/api/homeworks")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("homeworks");
            expect(res.body).toHaveProperty("totalHomeworks");
        });

        test("get all homeworks successfully as the owning teacher", async () => {
            const res = await request(app)
                .get("/api/homeworks")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body.homeworks.length).toBeGreaterThanOrEqual(1);
        });

        test("get all homeworks successfully as an enrolled student", async () => {
            const res = await request(app)
                .get("/api/homeworks")
                .set("Authorization", `Bearer ${studentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.homeworks.length).toBeGreaterThanOrEqual(1);
        });

        test("get all homeworks successfully as the linked parent", async () => {
            const res = await request(app)
                .get("/api/homeworks")
                .set("Authorization", `Bearer ${parentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.homeworks.length).toBeGreaterThanOrEqual(1);
        });

        test("an unrelated parent sees no homeworks", async () => {
            const res = await request(app)
                .get("/api/homeworks")
                .set("Authorization", `Bearer ${unrelatedParentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.homeworks).toHaveLength(0);
        });

        test("filter homeworks by active status", async () => {
            const res = await request(app)
                .get("/api/homeworks?status=active")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
        });

        test("filter homeworks by classId", async () => {
            const res = await request(app)
                .get(`/api/homeworks?classId=${mainClassId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(
                res.body.homeworks.every(
                    (hw) => hw.classId._id === mainClassId.toString()
                )
            ).toBe(true);
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/homeworks");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get single homework", () => {
    describe("success test cases", () => {
        test("get single homework successfully as admin", async () => {
            const res = await request(app)
                .get(`/api/homeworks/${homeworkId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("homework");
            expect(res.body.homework.classId).toHaveProperty("level");
            expect(res.body.homework.classId.subjectId).toHaveProperty("title");
        });

        test("get single homework successfully as the linked parent", async () => {
            const res = await request(app)
                .get(`/api/homeworks/${homeworkId}`)
                .set("Authorization", `Bearer ${parentToken}`);
            expect(res.status).toBe(200);
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get(`/api/homeworks/${homeworkId}`);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid homework ID", async () => {
            const res = await request(app)
                .get(`/api/homeworks/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("homework not found", async () => {
            const res = await request(app)
                .get(`/api/homeworks/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("non-owning teacher cannot access this homework", async () => {
            const res = await request(app)
                .get(`/api/homeworks/${homeworkId}`)
                .set("Authorization", `Bearer ${secondTeacherToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("non-enrolled student cannot access this homework", async () => {
            const res = await request(app)
                .get(`/api/homeworks/${homeworkId}`)
                .set("Authorization", `Bearer ${secondStudentToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("an unrelated parent cannot access this homework", async () => {
            const res = await request(app)
                .get(`/api/homeworks/${homeworkId}`)
                .set("Authorization", `Bearer ${unrelatedParentToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("update homework", () => {
    describe("failure test cases", () => {
        test("non-owning teacher cannot update this homework", async () => {
            const res = await request(app)
                .put(`/api/homeworks/${homeworkId}`)
                .send({
                    title: "Hijack",
                    description: "Do exercises 1 to 15",
                    dueDate: "2026-09-22",
                })
                .set("Authorization", `Bearer ${secondTeacherToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("update homework successfully", async () => {
            const res = await request(app)
                .put(`/api/homeworks/${homeworkId}`)
                .send({
                    title: "Algebra exercises v2",
                    description: "Do exercises 1 to 15",
                    dueDate: "2026-09-22",
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("homework");
        });
    });
});

describe("delete homework", () => {
    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).delete(
                `/api/homeworks/${homeworkId}`
            );
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("admin can no longer delete a homework directly", async () => {
            const res = await request(app)
                .delete(`/api/homeworks/${homeworkId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("non-owning teacher cannot delete this homework", async () => {
            const res = await request(app)
                .delete(`/api/homeworks/${homeworkId}`)
                .set("Authorization", `Bearer ${secondTeacherToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("delete homework successfully as the owning teacher", async () => {
            const res = await request(app)
                .delete(`/api/homeworks/${homeworkId}`)
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");
        });
    });
});
