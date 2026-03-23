import User from "../models/User.js";
import jwt from "jsonwebtoken";

// middleware to protect routes

export const protectRoute = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.json({ success: false, message: "jwt must be provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) return res.json({ success: false, message: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

