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
let secondStudentId;
let secondStudentToken;
let parentToken;
let unrelatedParentToken;
let mainClassId;
let secondTeacherClassId;

let gradeId;

beforeAll(async () => {
    const subject = await Subject.create({ title: "mathematics" });
    subjectId = subject._id;

    const schoolRoom = await SchoolRoom.create({
        title: "Room A",
        roomNumber: 401,
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
        fullName: "Grade Student",
        phoneNumber: "0600000012",
        email: "gradestudent@gmail.com",
        password: "password123",
        gender: "male",
        role: "student",
    });
    studentId = student._id;
    studentToken = signToken({ _id: studentId, role: "student" });

    const secondStudent = await User.create({
        fullName: "Unregistered Student",
        phoneNumber: "0600000013",
        email: "unregisteredstudent@gmail.com",
        password: "password123",
        gender: "female",
        role: "student",
    });
    secondStudentId = secondStudent._id;
    secondStudentToken = signToken({ _id: secondStudentId, role: "student" });

    const parent = await User.create({
        fullName: "Grade Parent",
        phoneNumber: "0600000015",
        email: "gradeparent@gmail.com",
        password: "password123",
        gender: "female",
        role: "parent",
    });
    parentToken = signToken({ _id: parent._id, role: "parent" });
    await Guardian.create({ studentId, parentId: parent._id });

    const unrelatedParent = await User.create({
        fullName: "Unrelated Parent",
        phoneNumber: "0600000016",
        email: "unrelatedparentgrade@gmail.com",
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

describe("grade register", () => {
    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).post("/api/grades").send({
                grade: 15,
                evaluation: "Good work",
                studentId,
                classId: mainClassId,
            });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("non-teacher token", async () => {
            const res = await request(app)
                .post("/api/grades")
                .send({
                    grade: 15,
                    evaluation: "Good work",
                    studentId,
                    classId: mainClassId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("class does not belong to this teacher", async () => {
            const res = await request(app)
                .post("/api/grades")
                .send({
                    grade: 15,
                    evaluation: "Good work",
                    studentId,
                    classId: secondTeacherClassId,
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("student is not registered in this class", async () => {
            const res = await request(app)
                .post("/api/grades")
                .send({
                    grade: 15,
                    evaluation: "Good work",
                    studentId: secondStudentId,
                    classId: mainClassId,
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("grade registered successfully", async () => {
            const res = await request(app)
                .post("/api/grades")
                .send({
                    grade: 15,
                    evaluation: "Good work",
                    studentId,
                    classId: mainClassId,
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("grade");
            expect(res.body.grade.teacherId).toBe(teacherId.toString());

            gradeId = res.body.grade._id;
        });
    });
});

describe("get all grades", () => {
    describe("success test cases", () => {
        test("get all grades successfully as admin", async () => {
            const res = await request(app)
                .get("/api/grades")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("grades");
            expect(res.body).toHaveProperty("totalGrades");
        });

        test("get all grades successfully as the owning teacher", async () => {
            const res = await request(app)
                .get("/api/grades")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(
                res.body.grades.every(
                    (grade) => grade.teacherId._id === teacherId.toString()
                )
            ).toBe(true);
        });

        test("get all grades successfully as the owning student", async () => {
            const res = await request(app)
                .get("/api/grades")
                .set("Authorization", `Bearer ${studentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.grades.length).toBeGreaterThanOrEqual(1);
        });

        test("get all grades successfully as the linked parent", async () => {
            const res = await request(app)
                .get("/api/grades")
                .set("Authorization", `Bearer ${parentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.grades.length).toBeGreaterThanOrEqual(1);
        });

        test("an unrelated parent sees no grades", async () => {
            const res = await request(app)
                .get("/api/grades")
                .set("Authorization", `Bearer ${unrelatedParentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.grades).toHaveLength(0);
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/grades");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get single grade", () => {
    describe("success test cases", () => {
        test("get single grade successfully as admin", async () => {
            const res = await request(app)
                .get(`/api/grades/${gradeId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("grade");
            expect(res.body.grade.classId).toHaveProperty("level");
            expect(res.body.grade.classId.subjectId).toHaveProperty("title");
        });

        test("get single grade successfully as the linked parent", async () => {
            const res = await request(app)
                .get(`/api/grades/${gradeId}`)
                .set("Authorization", `Bearer ${parentToken}`);
            expect(res.status).toBe(200);
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get(`/api/grades/${gradeId}`);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid grade ID", async () => {
            const res = await request(app)
                .get(`/api/grades/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("grade not found", async () => {
            const res = await request(app)
                .get(`/api/grades/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("non-owning teacher cannot access this grade", async () => {
            const res = await request(app)
                .get(`/api/grades/${gradeId}`)
                .set("Authorization", `Bearer ${secondTeacherToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("non-owning student cannot access this grade", async () => {
            const res = await request(app)
                .get(`/api/grades/${gradeId}`)
                .set("Authorization", `Bearer ${secondStudentToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("an unrelated parent cannot access this grade", async () => {
            const res = await request(app)
                .get(`/api/grades/${gradeId}`)
                .set("Authorization", `Bearer ${unrelatedParentToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("update grade", () => {
    describe("failure test cases", () => {
        test("non-teacher token", async () => {
            const res = await request(app)
                .put(`/api/grades/${gradeId}`)
                .send({ grade: 18, evaluation: "Excellent work" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("non-owning teacher cannot update this grade", async () => {
            const res = await request(app)
                .put(`/api/grades/${gradeId}`)
                .send({ grade: 18, evaluation: "Excellent work" })
                .set("Authorization", `Bearer ${secondTeacherToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("update grade successfully", async () => {
            const res = await request(app)
                .put(`/api/grades/${gradeId}`)
                .send({ grade: 18, evaluation: "Excellent work" })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("grade");
        });
    });
});

describe("delete grade", () => {
    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).delete(`/api/grades/${gradeId}`);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("admin can no longer delete a grade directly", async () => {
            const res = await request(app)
                .delete(`/api/grades/${gradeId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("non-owning teacher cannot delete this grade", async () => {
            const res = await request(app)
                .delete(`/api/grades/${gradeId}`)
                .set("Authorization", `Bearer ${secondTeacherToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("delete grade successfully as the owning teacher", async () => {
            const res = await request(app)
                .delete(`/api/grades/${gradeId}`)
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");
        });
    });
});
