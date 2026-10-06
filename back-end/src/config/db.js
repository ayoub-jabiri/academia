import mongoose from "mongoose";

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
    throw new Error(
        "Please define the DB_URL environment variable inside Vercel"
    );
}

let cached = global.mongoose || { conn: null, promise: null };

export const connectDb = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        };

        cached.promise = mongoose.connect(DB_URL, opts).then((mongoose) => {
            console.log("Database connected successfully!");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }

    return cached.conn;
};

// export const connectDb = async () => {
//     try {
//         await mongoose.connect(process.env.DB_URL);
//         console.log("Database connected successfully!");
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     }
// };
