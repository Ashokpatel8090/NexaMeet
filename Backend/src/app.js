import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoutes.js";
import path from 'path'

dotenv.config();

const app = express();
const server = createServer(app);

const _dirname = path.resolve();



// Correcting Socket.io Connection
const io = connectToSocket(server); // Ensure this function is correctly implemented

app.set("port", process.env.PORT || 8000);

// Apply CORS middleware
app.use(cors());

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.use(express.static(path.join(_dirname, '/frontend/dist')));
app.get('*', (_, res) => {
    res.sendFile(path.resolve(_dirname, 'frontend', 'dist', 'index.html'))
})

// MongoDB Connection
const start = async () => {
    try {
        const connectionDb = await mongoose.connect(
            process.env.MONGO_URL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );

        console.log(`MongoDB Connected: ${connectionDb.connection.host}`);

        server.listen(app.get("port"), () => {
            console.log(`App Listening on port ${app.get("port")}`);
        });

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

start();
