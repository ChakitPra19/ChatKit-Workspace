import express from "express"; // Framework ช่วยให้สร้าง api ง่ายขึ้น
import cors from "cors"; // ใช้เพื่อให้ Frontend เข้าถึง Backend ได้
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouters from "./routes/auth";
import roomRouters from "./routes/room";
import messageRouters from "./routes/message";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

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

app.get("/", (req, res) => {
    res.send("Server Available!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});