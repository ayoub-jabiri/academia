import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const componentsData = {
    securitySchemes: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
        },
    },

    schemas: {
        User: {
            type: "object",
            properties: {
                _id: {
                    type: "string",
                    example: "665f1a2b3c4d5e6f78901234",
                },
                fullName: {
                    type: "string",
                    example: "John Doe",
                },
                phoneNumber: {
                    type: "string",
                    example: "0612345678",
                },
                email: {
                    type: "string",
                    format: "email",
                    example: "john.doe@example.com",
                },
                gender: {
                    type: "string",
                    enum: ["male", "female"],
                    example: "male",
                },
                role: {
                    type: "string",
                    enum: ["admin", "teacher", "student", "parent"],
                    example: "student",
                },
                createdAt: {
                    type: "string",
                    format: "date-time",
                },
            },
        },

        UserInput: {
            type: "object",
            required: [
                "fullName",
                "phoneNumber",
                "email",
                "gender",
                "role",
                "password",
                "passwordConfirm",
            ],
            properties: {
                fullName: {
                    type: "string",
                    minLength: 3,
                    example: "John Doe",
                },
                phoneNumber: {
                    type: "string",
                    minLength: 10,
                    example: "0612345678",
                },
                email: {
                    type: "string",
                    format: "email",
                    example: "john.doe@example.com",
                },
                gender: {
                    type: "string",
                    enum: ["male", "female"],
                    example: "male",
                },
                role: {
                    type: "string",
                    enum: ["admin", "teacher", "student", "parent"],
                    example: "student",
                },
                password: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    example: "password123",
                },
                passwordConfirm: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    example: "password123",
                },
            },
        },

        UserUpdateInput: {
            type: "object",
            required: ["fullName", "phoneNumber", "email", "gender"],
            properties: {
                fullName: {
                    type: "string",
                    minLength: 3,
                    example: "John Doe",
                },
                phoneNumber: {
                    type: "string",
                    minLength: 10,
                    example: "0612345678",
                },
                email: {
                    type: "string",
                    format: "email",
                    example: "john.doe@example.com",
                },
                gender: {
                    type: "string",
                    enum: ["male", "female"],
                    example: "male",
                },
                password: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    example: "newpassword123",
                },
                passwordConfirm: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    example: "newpassword123",
                },
            },
        },

        Class: {
            type: "object",
            properties: {
                _id: {
                    type: "string",
                    example: "665f1a2b3c4d5e6f78901234",
                },
                level: {
                    type: "string",
                    enum: ["primary", "middle", "high"],
                    example: "primary",
                },
                levelYear: {
                    type: "integer",
                    example: 4,
                },
                group: {
                    type: "integer",
                    minimum: 1,
                    example: 2,
                },
                teacherId: {
                    type: "string",
                    nullable: true,
                    example: "665f1a2b3c4d5e6f78901234",
                },
                students: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                schoolRoomId: {
                    type: "string",
                    example: "665f1a2b3c4d5e6f78901234",
                },
                subjectId: {
                    type: "string",
                    example: "665f1a2b3c4d5e6f78901234",
                },
                createdAt: {
                    type: "string",
                    format: "date-time",
                },
                updatedAt: {
                    type: "string",
                    format: "date-time",
                },
            },
        },

        ClassInput: {
            type: "object",
            required: [
                "level",
                "levelYear",
                "group",
                "schoolRoomId",
                "subjectId",
            ],
            properties: {
                level: {
                    type: "string",
                    enum: ["primary", "middle", "high"],
                    example: "primary",
                },
                levelYear: {
                    type: "integer",
                    example: 4,
                },
                group: {
                    type: "integer",
                    minimum: 1,
                    example: 2,
                },
                teacherId: {
                    type: "string",
                    nullable: true,
                    example: "665f1a2b3c4d5e6f78901234",
                },
                students: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                schoolRoomId: {
                    type: "string",
                    example: "665f1a2b3c4d5e6f78901234",
                },
                subjectId: {
                    type: "string",
                    example: "665f1a2b3c4d5e6f78901234",
                },
            },
        },

        SchoolRoom: {
            type: "object",
            properties: {
                _id: {
                    type: "string",
                    example: "665f1a2b3c4d5e6f78901234",
                },
                title: {
                    type: "string",
                    example: "Room A",
                },
                roomNumber: {
                    type: "string",
                    example: "101",
                },
            },
        },
    },
};

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Express API Documentation",
            version: "1.0.0",
            description: "API documentation for Express application",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development Server",
            },
        ],
        components: componentsData,
    },
    apis: ["./src/modules/**/*.router.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
}
