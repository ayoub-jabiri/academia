// External Modules
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

// Internal Modules
import dns from "node:dns";
import userRouter from "./modules/users/user.router.js";
import subjectRouter from "./modules/subject/subject.router.js";
import schoolRoomRouter from "./modules/school-room/room.router.js";
import classRouter from "./modules/class/class.router.js";
import announcementRouter from "./modules/announcement/announcement.router.js";
import gradeRouter from "./modules/grade/grade.router.js";
import homeworkRouter from "./modules/homework/homework.router.js";
import guardianRouter from "./modules/guardian/guardian.router.js";
import dashboardRouter from "./modules/dashboard/dashboard.router.js";
import { clientErrorResponse } from "./utils/client.responses.js";
import { authenticationCheck } from "./middlewares/global.middlewares.js";
import setupSwagger from "./swagger.js";

// Main Settings

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// App Settings

const app = express();

setupSwagger(app);

app.use(cors());

app.use(helmet());

if (process.env?.ENV !== "testing") {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).

        handler: (req, res) => {
            res.status(429).json({
                message:
                    "You have exceeded the rate limit. Please try again later.",
            });
        },
    });

    app.use(limiter);
}

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/school-rooms", schoolRoomRouter);
app.use("/api/classes", classRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/grades", gradeRouter);
app.use("/api/homeworks", homeworkRouter);
app.use("/api/guardians", guardianRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(authenticationCheck, (req, res) => {
    return clientErrorResponse(
        res,
        404,
        `Cannot find ${req.originalUrl} on this server`
    );
});
export default app;
