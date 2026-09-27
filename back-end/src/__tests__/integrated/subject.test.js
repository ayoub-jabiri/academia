import request from "supertest";
import app from "../../app.js";
import { adminTestingToken, teacherTestingToken } from "../setup.js";
import Subject from "../../modules/subject/subject.model.js";
import SchoolRoom from "../../modules/school-room/room.model.js";
import ClassModel from "../../modules/class/class.model.js";

let subjectId;
let subjectWithClassId;

describe("subject register", () => {
    describe("success test cases", () => {
        test("subject registered successfully", async () => {
            const res = await request(app)
                .post("/api/subjects")
                .send({ title: "Mathematics" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("subject");
            // Titles are normalized to lowercase.
            expect(res.body.subject.title).toBe("mathematics");

            subjectId = res.body.subject._id;
        });
    });

    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app)
                .post("/api/subjects")
                .send({ title: "Physics" });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .post("/api/subjects")
                .send({ title: "Physics" })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("missing request body", async () => {
            const res = await request(app)
                .post("/api/subjects")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("title shorter than 3 characters", async () => {
            const res = await request(app)
                .post("/api/subjects")
                .send({ title: "Hi" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("duplicate subject", async () => {
            const res = await request(app)
                .post("/api/subjects")
                .send({ title: "mathematics" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get all subjects", () => {
    describe("success test cases", () => {
        test("get all subjects successfully as admin", async () => {
            const res = await request(app)
                .get("/api/subjects")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("subjects");
            expect(res.body).toHaveProperty("totalSubjects");
            expect(res.body).toHaveProperty("totalPages");
        });

        // NOTE: reads are no longer admin-only; every role can browse subjects.
        test("get all subjects successfully as teacher", async () => {
            const res = await request(app)
                .get("/api/subjects")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("subjects");
        });

        test("search subjects by title", async () => {
            const res = await request(app)
                .get("/api/subjects?search=math")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(
                res.body.subjects.some((s) => s.title === "mathematics")
            ).toBe(true);
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/subjects");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get single subject", () => {
    describe("success test cases", () => {
        test("get single subject successfully as a non-admin role", async () => {
            const res = await request(app)
                .get(`/api/subjects/${subjectId}`)
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("subject");
        });
    });

    describe("failure test cases", () => {
        test("invalid subject ID", async () => {
            const res = await request(app)
                .get(`/api/subjects/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("subject not found", async () => {
            const res = await request(app)
                .get(`/api/subjects/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("update subject", () => {
    describe("success test cases", () => {
        test("update subject successfully", async () => {
            const res = await request(app)
                .put(`/api/subjects/${subjectId}`)
                .send({ title: "Advanced Mathematics" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("subject");
            expect(res.body.subject.title).toBe("advanced mathematics");
        });
    });

    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app)
                .put(`/api/subjects/${subjectId}`)
                .send({ title: "Physics" });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .put(`/api/subjects/${subjectId}`)
                .send({ title: "Physics" })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid subject ID", async () => {
            const res = await request(app)
                .put(`/api/subjects/1111`)
                .send({ title: "Physics" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("subject not found", async () => {
            const res = await request(app)
                .put(`/api/subjects/111111111111111111111111`)
                .send({ title: "Physics" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("missing request body", async () => {
            const res = await request(app)
                .put(`/api/subjects/${subjectId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("delete subject", () => {
    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app).delete(`/api/subjects/${subjectId}`);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .delete(`/api/subjects/${subjectId}`)
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid subject ID", async () => {
            const res = await request(app)
                .delete(`/api/subjects/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("subject not found", async () => {
            const res = await request(app)
                .delete(`/api/subjects/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("cannot delete a subject with associated classes", async () => {
            const subject = await Subject.create({ title: "chemistry" });
            subjectWithClassId = subject._id;

            const schoolRoom = await SchoolRoom.create({
                title: "Room A",
                roomNumber: 9001,
            });

            const newClass = await ClassModel.create({
                level: "primary",
                levelYear: 3,
                group: 1,
                schoolRoomId: schoolRoom._id,
                subjectId: subjectWithClassId,
            });

            subject.classes.push(newClass._id);
            await subject.save();

            const res = await request(app)
                .delete(`/api/subjects/${subjectWithClassId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("delete subject successfully", async () => {
            const res = await request(app)
                .delete(`/api/subjects/${subjectId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");
        });
    });
});
