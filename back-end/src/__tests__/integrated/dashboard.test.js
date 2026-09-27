import request from "supertest";
import app from "../../app.js";
import { adminTestingToken, teacherTestingToken } from "../setup.js";
import { signToken } from "../../utils/user.utils.js";
import User from "../../modules/users/user.model.js";
import Subject from "../../modules/subject/subject.model.js";
import SchoolRoom from "../../modules/school-room/room.model.js";
import ClassModel from "../../modules/class/class.model.js";
import Guardian from "../../modules/guardian/guardian.model.js";
import Grade from "../../modules/grade/grade.model.js";
import Homework from "../../modules/homework/homework.model.js";
import Announcement from "../../modules/announcement/announcement.model.js";

let teacherId;
let studentId;
let parentToken;
let classId;

beforeAll(async () => {
    const subject = await Subject.create({ title: "mathematics" });
    const schoolRoom = await SchoolRoom.create({
        title: "Room A",
        roomNumber: 601,
    });

    const teacher = await User.create({
        _id: "64b8f1e2c9e77f0012345678",
        fullName: "Jane Smith",
        phoneNumber: "0600000001",
        email: "janesmith@gmail.com",
        password: "password123",
        gender: "female",
        role: "teacher",
    });
    teacherId = teacher._id;

    const student = await User.create({
        fullName: "Dashboard Student",
        phoneNumber: "0600000002",
        email: "dashboardstudent@gmail.com",
        password: "password123",
        gender: "male",
        role: "student",
    });
    studentId = student._id;

    const parent = await User.create({
        fullName: "Dashboard Parent",
        phoneNumber: "0600000003",
        email: "dashboardparent@gmail.com",
        password: "password123",
        gender: "female",
        role: "parent",
    });
    parentToken = signToken({ _id: parent._id, role: "parent" });
    await Guardian.create({ studentId, parentId: parent._id });

    const currentClass = await ClassModel.create({
        level: "primary",
        levelYear: 3,
        group: 1,
        teacherId,
        students: [studentId],
        schoolRoomId: schoolRoom._id,
        subjectId: subject._id,
    });
    classId = currentClass._id;

    await Announcement.create({
        title: "Dashboard announcement",
        description: "For dashboard stats testing",
    });

    await Grade.create({
        grade: 15,
        evaluation: "Good work",
        studentId,
        teacherId,
        classId,
    });

    await Homework.create({
        title: "Dashboard homework",
        description: "For dashboard stats testing",
        dueDate: new Date("2026-12-31"),
        teacherId,
        classId,
    });
});

describe("admin dashboard stats", () => {
    describe("success test cases", () => {
        test("get admin dashboard stats successfully", async () => {
            const res = await request(app)
                .get("/api/dashboard/admin/stats")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("overview");
            expect(res.body.overview.students).toBeGreaterThanOrEqual(1);
            expect(res.body.overview.classes).toBeGreaterThanOrEqual(1);
            expect(res.body).toHaveProperty("recentAnnouncements");
            expect(res.body).toHaveProperty("recentGrades");
            expect(res.body).toHaveProperty("latestRegisteredStudents");
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/dashboard/admin/stats");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("forbidden role", async () => {
            const res = await request(app)
                .get("/api/dashboard/admin/stats")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("teacher dashboard stats", () => {
    describe("success test cases", () => {
        test("get teacher dashboard stats successfully", async () => {
            const res = await request(app)
                .get("/api/dashboard/teacher/stats")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("stats");
            expect(res.body.stats.classes).toBe(1);
            expect(res.body.stats.students).toBe(1);
            expect(res.body.stats.pendingHomeworks).toBe(1);
            expect(res.body).toHaveProperty("teacherClasses");
            expect(res.body).toHaveProperty("recentGrades");
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get(
                "/api/dashboard/teacher/stats"
            );
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("forbidden role", async () => {
            const res = await request(app)
                .get("/api/dashboard/teacher/stats")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("student dashboard stats", () => {
    describe("success test cases", () => {
        test("get student dashboard stats successfully", async () => {
            const studentToken = signToken({ _id: studentId, role: "student" });

            const res = await request(app)
                .get("/api/dashboard/student/stats")
                .set("Authorization", `Bearer ${studentToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("stats");
            expect(res.body.stats.classes).toBe(1);
            expect(res.body.stats.pendingHomeworks).toBe(1);
            expect(res.body).toHaveProperty("studentsClasses");
            expect(res.body).toHaveProperty("recentGrades");
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get(
                "/api/dashboard/student/stats"
            );
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("forbidden role", async () => {
            const res = await request(app)
                .get("/api/dashboard/student/stats")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("parent dashboard stats", () => {
    describe("success test cases", () => {
        test("get parent dashboard stats successfully", async () => {
            const res = await request(app)
                .get("/api/dashboard/parent/stats")
                .set("Authorization", `Bearer ${parentToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("stats");
            expect(res.body.stats.students).toBe(1);
            expect(res.body.stats.grades).toBe(1);
            expect(res.body).toHaveProperty("children");
            res.body.children.forEach((child) => {
                expect(child).not.toHaveProperty("password");
                expect(child).not.toHaveProperty("role");
            });
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/dashboard/parent/stats");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("forbidden role", async () => {
            const res = await request(app)
                .get("/api/dashboard/parent/stats")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });
});
