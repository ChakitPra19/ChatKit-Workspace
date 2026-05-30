import Express from "express";
import Message from "../models/Message";
import { protect, type AuthRequest } from "../middleware/authMiddleware";

const router = Express.Router();

router.post("/", protect, async (req: AuthRequest, res: Express.Response): Promise<any> => {
    try {
        const { roomId, content } = req.body;

        const newMessage = await Message.create({
            sender: req.user.id,
            room: roomId,
            content: content,
        });

        const fullMessage = await Message.findById(newMessage).populate("sender", "username avatar");
        res.status(201).json(fullMessage);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to send message." });
    }
});

router.get("/:roomId", protect, async (req: AuthRequest, res: Express.Response): Promise<any> => {
    try {
        const messages = await Message.find({ room: req.params.roomId }).populate("sender", "username avater").sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch messages." })
    }
});

export default router;