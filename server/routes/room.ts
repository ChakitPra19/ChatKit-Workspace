import express from "express";
import Room from "../models/Room";
import { protect, type AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, async (req: AuthRequest, res: express.Response): Promise<any> => {
    try {
        const { name, description } = req.body;

        const newRoom = await Room.create({
            name,
            description,
            owner: req.user.id,
        });

        res.status(201).json(newRoom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Fail to create a room." })
    }
});

router.get("/", protect, async (req: AuthRequest, res: express.Response): Promise<any> => {
    try {
        const rooms = await Room.find().populate("owner", "username email");
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: "Fail to fetch rooms." });
    }
})

export default router;