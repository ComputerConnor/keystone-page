import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JP_JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JP_JWT_SECRET is missing from environment variables");
}

export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export function createJpToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
            category: user.category
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

export function verifyJpToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}