import express from "express"; // Framework ช่วยให้สร้าง api ง่ายขึ้น
import cors from "cors"; // ใช้เพื่อให้ Frontend เข้าถึง Backend ได้
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import authRouters from "./routes/auth";
import roomRouters from "./routes/room";
import messageRouters from "./routes/message";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouters);
app.use("/api/rooms", roomRouters);
app.use("/api/messages", messageRouters);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL as string)
        console.log(`Mongo Already Connected to : ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error :`, error)
        process.exit(1);
    }
};

connectDB();

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error: No token"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        socket.data.user = decoded;

        next();
    } catch (error) {
        next(new Error("Authentication error: Invalid token"));
    }
});

io.on("connection", (socket) => {
    console.log(`Connect to Socket Successfully(User ID: ${socket.data.user.id}, Socket ID: ${socket.id})`);

    socket.on("join_room", (roomId) => {
        socket.join(roomId);

        console.log(`User ${socket.data.user.id} join the room ${roomId}.`);
    })

    socket.on("send_message", (data) => {
        socket.to(data.roomId).emit("message_received", data.message);
    });

    socket.on("disconnect", () => {
        console.log(`User Disconnect(ID: ${socket.id})`);
    });
});

app.get("/", (req, res) => {
    res.send("Server Available!");
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});