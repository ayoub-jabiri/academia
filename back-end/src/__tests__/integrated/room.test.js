import request from "supertest";
import app from "../../app.js";
import { adminTestingToken, teacherTestingToken } from "../setup.js";
import SchoolRoom from "../../modules/school-room/room.model.js";
import Subject from "../../modules/subject/subject.model.js";
import ClassModel from "../../modules/class/class.model.js";

let roomId;
let secondRoomId;
let roomWithClassId;

describe("school room register", () => {
    describe("success test cases", () => {
        test("school room registered successfully", async () => {
            const res = await request(app)
                .post("/api/school-rooms")
                .send({ title: "Science Wing", roomNumber: 101 })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("schoolRoom");

            roomId = res.body.schoolRoom._id;
        });

        test("a second school room registered successfully", async () => {
            const res = await request(app)
                .post("/api/school-rooms")
                .send({ title: "Arts Wing", roomNumber: 102 })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(201);

            secondRoomId = res.body.schoolRoom._id;
        });
    });

    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app)
                .post("/api/school-rooms")
                .send({ title: "Room X", roomNumber: 201 });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .post("/api/school-rooms")
                .send({ title: "Room X", roomNumber: 201 })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("missing request body", async () => {
            const res = await request(app)
                .post("/api/school-rooms")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("missing title in request body", async () => {
            const res = await request(app)
                .post("/api/school-rooms")
                .send({ roomNumber: 201 })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("missing roomNumber in request body", async () => {
            const res = await request(app)
                .post("/api/school-rooms")
                .send({ title: "Room X" })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("duplicate room number", async () => {
            const res = await request(app)
                .post("/api/school-rooms")
                .send({ title: "Another Room", roomNumber: 101 })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get all school rooms", () => {
    describe("success test cases", () => {
        test("get all school rooms successfully as admin", async () => {
            const res = await request(app)
                .get("/api/school-rooms")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("rooms");
            expect(res.body).toHaveProperty("totalRooms");
        });

        test("get all school rooms successfully as teacher", async () => {
            const res = await request(app)
                .get("/api/school-rooms")
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("rooms");
        });

        test("search rooms by numeric room number", async () => {
            const res = await request(app)
                .get("/api/school-rooms?search=101")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body.rooms.some((room) => room.roomNumber === 101)).toBe(
                true
            );
        });

        test("search rooms by title", async () => {
            const res = await request(app)
                .get("/api/school-rooms?search=Science")
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(
                res.body.rooms.some((room) => room.title === "Science Wing")
            ).toBe(true);
        });
    });

    describe("failure test cases", () => {
        test("missing token", async () => {
            const res = await request(app).get("/api/school-rooms");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("get single school room", () => {
    describe("success test cases", () => {
        test("get single school room successfully as a non-admin role", async () => {
            const res = await request(app)
                .get(`/api/school-rooms/${roomId}`)
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("schoolRoom");
        });
    });

    describe("failure test cases", () => {
        test("invalid school room ID", async () => {
            const res = await request(app)
                .get(`/api/school-rooms/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("school room not found", async () => {
            const res = await request(app)
                .get(`/api/school-rooms/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("update school room", () => {
    describe("success test cases", () => {
        test("update school room successfully", async () => {
            const res = await request(app)
                .put(`/api/school-rooms/${roomId}`)
                .send({ title: "Science Wing Renovated", roomNumber: 101 })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("schoolRoom");
            expect(res.body.schoolRoom.title).toBe("Science Wing Renovated");
        });
    });

    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app)
                .put(`/api/school-rooms/${roomId}`)
                .send({ title: "X", roomNumber: 101 });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .put(`/api/school-rooms/${roomId}`)
                .send({ title: "X", roomNumber: 101 })
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid school room ID", async () => {
            const res = await request(app)
                .put(`/api/school-rooms/1111`)
                .send({ title: "X", roomNumber: 101 })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("school room not found", async () => {
            const res = await request(app)
                .put(`/api/school-rooms/111111111111111111111111`)
                .send({ title: "X", roomNumber: 101 })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("missing request body", async () => {
            const res = await request(app)
                .put(`/api/school-rooms/${roomId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        test("room number conflicts with another existing room", async () => {
            const res = await request(app)
                .put(`/api/school-rooms/${roomId}`)
                .send({ title: "Science Wing Renovated", roomNumber: 102 })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("message");
        });

        test("keeping the room's own number on update is allowed", async () => {
            const res = await request(app)
                .put(`/api/school-rooms/${roomId}`)
                .send({
                    title: "Science Wing Renovated Again",
                    roomNumber: 101,
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
        });
    });
});

describe("delete school room", () => {
    describe("failure test cases", () => {
        test("missing admin token", async () => {
            const res = await request(app).delete(
                `/api/school-rooms/${roomId}`
            );
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid admin token", async () => {
            const res = await request(app)
                .delete(`/api/school-rooms/${roomId}`)
                .set("Authorization", `Bearer ${teacherTestingToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("message");
        });

        test("invalid school room ID", async () => {
            const res = await request(app)
                .delete(`/api/school-rooms/1111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("school room not found", async () => {
            const res = await request(app)
                .delete(`/api/school-rooms/111111111111111111111111`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message");
        });

        test("cannot delete a school room with associated classes", async () => {
            const subject = await Subject.create({ title: "biology" });

            const room = await SchoolRoom.create({
                title: "Occupied Room",
                roomNumber: 9101,
            });
            roomWithClassId = room._id;

            const newClass = await ClassModel.create({
                level: "primary",
                levelYear: 3,
                group: 1,
                schoolRoomId: roomWithClassId,
                subjectId: subject._id,
            });

            room.classes.push(newClass._id);
            await room.save();

            const res = await request(app)
                .delete(`/api/school-rooms/${roomWithClassId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("success test cases", () => {
        test("delete school room successfully", async () => {
            const res = await request(app)
                .delete(`/api/school-rooms/${roomId}`)
                .set("Authorization", `Bearer ${adminTestingToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");
        });
    });
});
