import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
});

const upload = multer({ storage: storage });

router.post("/", protect, upload.single("file"), (req, res): any => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file attached!" });
        };
        const fileUrl = `http://localhost:5001/uploads/${req.file.filename}`;
        res.status(201).json({ url: fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload unsuccessful." });
    }
});

export default router;