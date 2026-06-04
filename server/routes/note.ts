import express from "express";
import Note from "../models/Note";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:roomId", protect, async (req, res: express.Response): Promise<any> => {
    try {
        const { roomId } = req.params;

        let note = await Note.findOne({ room: roomId });

        if (!note) {
            note = await Note.create({
                room: roomId as string,
                content: "",
            });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch Note." });
    }
});

router.put("/:roomId", protect, async (req, res): Promise<any> => {
    try {
        const { roomId } = req.params;
        const { content } = req.body;

        const updatedNote = await Note.findOneAndUpdate( // ส่งไป 3 ก้อน 1.หาใคร 2.แก้อะไร 3.ส่งอะไรกลับมา
            {
                room: roomId,
            },
            {
                content: content,
            },
            {
                returnDocument: "after", // ส่ง Version ที่แก้แล้วกลับมา ถ้าไม่ใส่ จะส่ง Version เก่ามา
            }
        );
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: "Failed to save note." });
    }
});

export default router;