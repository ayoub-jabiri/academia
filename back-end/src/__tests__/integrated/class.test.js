import request from "supertest";
import app from "../../app.js";
import { adminTestingToken, teacherTestingToken } from "../setup.js";
import { signToken } from "../../utils/user.utils.js";
import User from "../../modules/users/user.model.js";
import Subject from "../../modules/subject/subject.model.js";
import SchoolRoom from "../../modules/school-room/room.model.js";
import ClassModel from "../../modules/class/class.model.js";
import Guardian from "../../modules/guardian/guardian.model.js";
import Homework from "../../modules/homework/homework.model.js";

let classId;
let subjectId;
let secondSubjectId;
let schoolRoomId;
let secondSchoolRoomId;

let teacherId;
let secondTeacherToken;
let studentId;
let studentToken;
let secondStudentId;
let secondStudentToken;
let parentToken;
let unrelatedParentToken;

beforeAll(async () => {
    const subject = await Subject.create({ title: "mathematics" });
    subjectId = subject._id;

    const secondSubject = await Subject.create({ title: "physics" });
    secondSubjectId = secondSubject._id;

    const schoolRoom = await SchoolRoom.create({
        title: "Room A",
        roomNumber: 301,
    });
    schoolRoomId = schoolRoom._id;

    const secondSchoolRoom = await SchoolRoom.create({
        title: "Room B",
        roomNumber: 302,
    });
    secondSchoolRoomId = secondSchoolRoom._id;

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

    const secondTeacher = await User.create({
        fullName: "Second Teacher",
        phoneNumber: "0600000002",
        email: "secondteacher@gmail.com",
        password: "password123",
        gender: "male",
        role: "teacher",
    });
    secondTeacherToken = signToken({ _id: secondTeacher._id, role: "teacher" });

    const student = await User.create({
        fullName: "Student One",
        phoneNumber: "0600000003",
        email: "studentone@gmail.com",
        password: "password123",
        gender: "male",
        role: "student",
    });
    studentId = student._id;
    studentToken = signToken({ _id: studentId, role: "student" });

    const secondStudent = await User.create({
        fullName: "Student Two",
        phoneNumber: "0600000004",
        email: "studenttwo@gmail.com",
        password: "password123",
        gender: "female",
        role: "student",
    });
    secondStudentId = secondStudent._id;
    secondStudentToken = signToken({ _id: secondStudentId, role: "student" });

    const parent = await User.create({
        fullName: "Parent One",
        phoneNumber: "0600000005",
        email: "parentone@gmail.com",
        password: "password123",
        gender: "female",
        role: "parent",
    });
    parentToken = signToken({ _id: parent._id, role: "parent" });
    await Guardian.create({ studentId, parentId: parent._id });

    const unrelatedParent = await User.create({
        fullName: "Unrelated Parent",
        phoneNumber: "0600000006",
        email: "unrelatedparent@gmail.com",
        password: "password123",
        gender: "male",
        role: "parent",
    });
    unrelatedParentToken = signToken({
        _id: unrelatedParent._id,
        role: "parent",
    });
});

describe("class register", () => {
    describe("success test cases", () => {
        test("class registered successfully", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    group: 1,
                    schoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("class");

            classId = res.body.class._id;
        });

        test("the class was pushed onto the subject and room's classes arrays", async () => {
            const subject = await Subject.findById(subjectId);
            const room = await SchoolRoom.findById(schoolRoomId);
            expect(subject.classes.map(String)).toContain(classId);
            expect(room.classes.map(String)).toContain(classId);
        });
    });

    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app).post("/api/classes").send({
                level: "primary",
                levelYear: 3,
                group: 2,
                schoolRoomId,
                subjectId,
            });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    group: 2,
                    schoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("missing request body", async () => {
            const res = await request(app)
                .post("/api/classes")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid levelYear for the selected level", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 9,
                    group: 2,
                    schoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("missing group in request body", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    schoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("group number below 1", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    group: 0,
                    schoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid schoolRoomId format", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    group: 2,
                    schoolRoomId: "1234",
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid subjectId format", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    group: 2,
                    schoolRoomId,
                    subjectId: "1234",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("school room not found", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    group: 2,
                    schoolRoomId: "111111111111111111111111",
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("subject not found", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    group: 2,
                    schoolRoomId,
                    subjectId: "111111111111111111111111",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("duplicate class (same level, levelYear, group and subject)", async () => {
            const res = await request(app)
                .post("/api/classes")
                .send({
                    level: "primary",
                    levelYear: 3,
                    group: 1,
                    schoolRoomId: secondSchoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get all classes", () => {
    describe("success test cases", () => {
        test("get all classes successfully as admin", async () => {
            const res = await request(app)
                .get("/api/classes")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("classes");
            expect(res.body).toHaveProperty("totalClasses");
        });

        test("get all classes successfully as a student (unscoped by default)", async () => {
            const res = await request(app)
                .get("/api/classes")
                .set("Authorization", `Bearer ${studentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.classes.length).toBeGreaterThanOrEqual(1);
        });

        test("filter to the teacher's own classes with mine=true", async () => {
            await request(app)
                .patch(`/api/classes/${classId}/assign-teacher`)
                .send({ teacherId })
                .set("Authorization", `Bearer ${adminTestingToken}`);

            const res = await request(app)
                .get("/api/classes?mine=true")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(
                res.body.classes.every(
                    (currentClass) =>
                        currentClass.teacherId._id === teacherId.toString()
                )
            ).toBe(true);

            // Unassign again so later tests can exercise assign-teacher from a clean state.
            await request(app)
                .patch(`/api/classes/${classId}/unassign-teacher`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
        });

        test("search classes by level", async () => {
            const res = await request(app)
                .get("/api/classes?search=primary")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body.classes.length).toBeGreaterThanOrEqual(1);
        });

        test("filter classes by level", async () => {
            const res = await request(app)
                .get("/api/classes?level=primary")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body.classes.every((c) => c.level === "primary")).toBe(
                true
            );
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/classes");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get single class", () => {
    describe("success test cases", () => {
        test("get single class successfully as admin", async () => {
            const res = await request(app)
                .get(`/api/classes/${classId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("class");
        });

        test("an unrelated teacher can still fetch the class by ID", async () => {
            const res = await request(app)
                .get(`/api/classes/${classId}`)
                .set("Authorization", `Bearer ${secondTeacherToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("class");
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get(`/api/classes/${classId}`);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid class ID", async () => {
            const res = await request(app)
                .get(`/api/classes/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("class not found", async () => {
            const res = await request(app)
                .get(`/api/classes/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("update class", () => {
    describe("success test cases", () => {
        test("update class successfully", async () => {
            const res = await request(app)
                .put(`/api/classes/${classId}`)
                .send({
                    level: "primary",
                    levelYear: 4,
                    group: 1,
                    schoolRoomId: secondSchoolRoomId,

                    subjectId: secondSubjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("class");
            expect(res.body.class.levelYear).toBe(4);
        });

        test("the subject is not actually changed by update", async () => {
            const res = await request(app)
                .get(`/api/classes/${classId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.body.class.subjectId._id).toBe(subjectId.toString());
        });
    });

    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app).put(`/api/classes/${classId}`).send({
                level: "primary",
                levelYear: 4,
                group: 1,
                schoolRoomId,
                subjectId,
            });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .put(`/api/classes/${classId}`)
                .send({
                    level: "primary",
                    levelYear: 4,
                    group: 1,
                    schoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid class ID", async () => {
            const res = await request(app)
                .put(`/api/classes/1111`)
                .send({
                    level: "primary",
                    levelYear: 4,
                    group: 1,
                    schoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("class not found", async () => {
            const res = await request(app)
                .put(`/api/classes/111111111111111111111111`)
                .send({
                    level: "primary",
                    levelYear: 4,
                    group: 1,
                    schoolRoomId,
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("missing request body", async () => {
            const res = await request(app)
                .put(`/api/classes/${classId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("school room not found", async () => {
            const res = await request(app)
                .put(`/api/classes/${classId}`)
                .send({
                    level: "primary",
                    levelYear: 4,
                    group: 1,
                    schoolRoomId: "111111111111111111111111",
                    subjectId,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("assign teacher to class", () => {
    describe("failure test cases", () => {
        test("teacher not found", async () => {
            const res = await request(app)
                .patch(`/api/classes/${classId}/assign-teacher`)
                .send({ teacherId: "111111111111111111111111" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("assigned user is not a teacher", async () => {
            const res = await request(app)
                .patch(`/api/classes/${classId}/assign-teacher`)
                .send({ teacherId: studentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("teacher assigned to class successfully", async () => {
            const res = await request(app)
                .patch(`/api/classes/${classId}/assign-teacher`)
                .send({ teacherId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("class");
        });
    });

    describe("failure test cases after assignment", () => {
        test("class already has a teacher assigned", async () => {
            const res = await request(app)
                .patch(`/api/classes/${classId}/assign-teacher`)
                .send({ teacherId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get class teacher", () => {
    test("returns null when no teacher is assigned yet", async () => {
        const emptyClass = await ClassModel.create({
            level: "middle",
            levelYear: 1,
            group: 1,
            schoolRoomId,
            subjectId,
        });

        const res = await request(app)
            .get(`/api/classes/${emptyClass._id}/teacher`)
            .set("Authorization", `Bearer ${adminTestingToken}`);
        expect(res.status).toBe(200);
        expect(res.body.teacher).toBeNull();
    });

    test("get the assigned teacher successfully", async () => {
        const res = await request(app)
            .get(`/api/classes/${classId}/teacher`)
            .set("Authorization", `Bearer ${adminTestingToken}`);
        expect(res.status).toBe(200);
        expect(res.body.teacher).not.toHaveProperty("password");
    });

    test("forbidden for non-admin roles", async () => {
        const res = await request(app)
            .get(`/api/classes/${classId}/teacher`)
            .set("Authorization", `Bearer ${studentToken}`);
        expect(res.status).toBe(403);
    });
});

describe("register student to class", () => {
    describe("failure test cases", () => {
        test("student not found", async () => {
            const res = await request(app)
                .patch(`/api/classes/${classId}/register-student`)
                .send({ studentId: "111111111111111111111111" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("registered user is not a student", async () => {
            const res = await request(app)
                .patch(`/api/classes/${classId}/register-student`)
                .send({ studentId: teacherId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("student registered to class successfully", async () => {
            const res = await request(app)
                .patch(`/api/classes/${classId}/register-student`)
                .send({ studentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("class");
        });
    });

    describe("failure test cases after registration", () => {
        test("student is already registered in this class", async () => {
            const res = await request(app)
                .patch(`/api/classes/${classId}/register-student`)
                .send({ studentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get class students", () => {
    test("get class students successfully", async () => {
        const res = await request(app)
            .get(`/api/classes/${classId}/students`)
            .set("Authorization", `Bearer ${adminTestingToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("students");
        res.body.students.forEach((s) =>
            expect(s).not.toHaveProperty("password")
        );
    });
});

describe("get class school room", () => {
    test("get class school room successfully", async () => {
        const res = await request(app)
            .get(`/api/classes/${classId}/school-room`)
            .set("Authorization", `Bearer ${adminTestingToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("schoolRoom");
    });
});

describe("delete class", () => {
    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app).delete(`/api/classes/${classId}`);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid class ID", async () => {
            const res = await request(app)
                .delete(`/api/classes/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("class not found", async () => {
            const res = await request(app)
                .delete(`/api/classes/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("cannot delete a class with registered students", async () => {
            const res = await request(app)
                .delete(`/api/classes/${classId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("cannot delete a class with a teacher assigned", async () => {
            await request(app)
                .patch(`/api/classes/${classId}/unregister-student`)
                .send({ studentId })
                .set("Authorization", `Bearer ${adminTestingToken}`);

            const res = await request(app)
                .delete(`/api/classes/${classId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("cannot delete a class with assigned homeworks", async () => {
            await request(app)
                .patch(`/api/classes/${classId}/unassign-teacher`)
                .set("Authorization", `Bearer ${adminTestingToken}`);

            await Homework.create({
                title: "Leftover homework",
                description: "Should block deletion",
                dueDate: new Date("2026-12-01"),
                teacherId,
                classId,
            });

            const res = await request(app)
                .delete(`/api/classes/${classId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");

            await Homework.deleteMany({ classId });
        });
    });

    describe("success test cases", () => {
        test("delete class successfully once it has no dependents", async () => {
            const res = await request(app)
                .delete(`/api/classes/${classId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");
        });
    });
});
