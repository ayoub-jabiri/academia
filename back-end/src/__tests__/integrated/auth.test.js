import request from "supertest";
import app from "../../app.js";
import { adminTestingToken, teacherTestingToken } from "../setup.js";
import User from "../../modules/users/user.model.js";

let loggedInUserToken;

describe("user register", () => {
    describe("success test cases", () => {
        test("user registered successfully", async () => {
            const res = await request(app)
                .post("/api/users/auth/register")
                .send({
                    fullName: "John Doe 1",
                    phoneNumber: "0612345678",
                    email: "johndoe1@gmail.com",
                    gender: "male",
                    role: "teacher",
                    password: "12345678",
                    passwordConfirm: "12345678",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("accessToken");
            expect(res.body).toHaveProperty("user");
        });

        test("user added successfully to the database", async () => {
            const user = await User.findOne({ email: "johndoe1@gmail.com" });
            expect(user).not.toBeNull();
            expect(user).toHaveProperty("fullName", "John Doe 1");
            expect(user).toHaveProperty("gender", "male");
        });
    });

    describe("failure test cases", () => {
        test("user registration fails due to missing admin token", async () => {
            const res = await request(app).post("/api/users/auth/register");

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty("message");
        });

        test("user registration fails due to not being an admin", async () => {
            const res = await request(app)
                .post("/api/users/auth/register")
                .set("Authorization", `Bearer ${teacherTestingToken}`);

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty("message");
        });

        test("user registration fails due to missing request body", async () => {
            const res = await request(app)
                .post("/api/users/auth/register")
                .set("Authorization", `Bearer ${adminTestingToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message");
        });

        test("user registration fails due to missing required data", async () => {
            const res = await request(app)
                .post("/api/users/auth/register")
                .send({
                    fullName: "",
                    phoneNumber: "",
                    email: "",
                    gender: "",
                    role: "",
                    password: "",
                    passwordConfirm: "",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message");
        });

        test("user registration fails due to missing gender", async () => {
            const res = await request(app)
                .post("/api/users/auth/register")
                .send({
                    fullName: "Gender Less",
                    phoneNumber: "0612345679",
                    email: "genderless@gmail.com",
                    role: "teacher",
                    password: "12345678",
                    passwordConfirm: "12345678",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message");
        });

        test("user registration fails due to invalid gender value", async () => {
            const res = await request(app)
                .post("/api/users/auth/register")
                .send({
                    fullName: "Invalid Gender",
                    phoneNumber: "0612345679",
                    email: "invalidgender@gmail.com",
                    gender: "other",
                    role: "teacher",
                    password: "12345678",
                    passwordConfirm: "12345678",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message");
        });

        test("user registration fails due to already existing email", async () => {
            const res = await request(app)
                .post("/api/users/auth/register")
                .send({
                    fullName: "John Doe 2",
                    phoneNumber: "0612345678",
                    email: "johndoe1@gmail.com",
                    gender: "male",
                    role: "teacher",
                    password: "12345678",
                    passwordConfirm: "12345678",
                })
                .set("Authorization", `Bearer ${adminTestingToken}`);

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("user login", () => {
    describe("success test cases", () => {
        test("user logged in successfully", async () => {
            const res = await request(app).post("/api/users/auth/login").send({
                email: "johndoe1@gmail.com",
                password: "12345678",
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("accessToken");

            loggedInUserToken = res.body.accessToken;
        });
    });

    describe("failure test cases", () => {
        test("user login fails due to missing request body", async () => {
            const res = await request(app).post("/api/users/auth/login");

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message");
        });

        test("user login fails due to missing required data", async () => {
            const res = await request(app).post("/api/users/auth/login").send({
                email: "",
                password: "",
            });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message");
        });

        test("user login fails due to incorrect email", async () => {
            const res = await request(app).post("/api/users/auth/login").send({
                email: "incorrect@gmail.com",
                password: "12345678",
            });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message");
        });

        test("user login fails due to incorrect password", async () => {
            const res = await request(app).post("/api/users/auth/login").send({
                email: "johndoe1@gmail.com",
                password: "wrongpassword",
            });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message");
        });
    });
});

describe("user profile", () => {
    describe("success test cases", () => {
        test("get the logged-in user's profile successfully", async () => {
            const res = await request(app)
                .get("/api/users/auth/profile")
                .set("Authorization", `Bearer ${loggedInUserToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("email", "johndoe1@gmail.com");
            expect(res.body.user).not.toHaveProperty("password");
        });
    });

    describe("failure test cases", () => {
        test("get profile fails due to missing token", async () => {
            const res = await request(app).get("/api/users/auth/profile");

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty("message");
        });
    });
});
