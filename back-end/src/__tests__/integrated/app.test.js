import request from "supertest";
import app from "../../app.js";
import { adminTestingToken } from "../setup.js";

describe("unmatched routes", () => {
    test("an unknown route returns a structured 404, even when authenticated", async () => {
        const res = await request(app)
            .get("/api/this-route-does-not-exist")
            .set("Authorization", `Bearer ${adminTestingToken}`);
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toContain("/api/this-route-does-not-exist");
    });
});
