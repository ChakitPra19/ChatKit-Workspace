import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): any => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

            req.user = decoded;

            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Not authorized Token!" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, No Token!" });
    };
}