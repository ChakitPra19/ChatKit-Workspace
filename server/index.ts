import express from "express"; // Framework ช่วยให้สร้าง api ง่ายขึ้น
import cors from "cors"; // ใช้เพื่อให้ Frontend เข้าถึง Backend ได้
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server Available!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});