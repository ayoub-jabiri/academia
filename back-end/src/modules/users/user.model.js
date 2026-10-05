import { Schema, model } from "mongoose";

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "teacher", "student", "parent"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default model("User", userSchema);
