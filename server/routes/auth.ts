import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res): Promise<any> => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "This Email already existed." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            avatar: newUser.avatar,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error!"
        })
    }
}
)

router.post("/login", async (req, res): Promise<any> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid User" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong Password!" })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "7d" }
        );

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error!" });
    }
});

export default router;