import express from "express";
import {
    verifyPassword,
    createJpToken,
    verifyJpToken
} from "../utils/jpAuth.js";
import { query } from "../utils/db.js";

const router = express.Router();

const COOKIE_NAME = "jp_session";

// ============================================================
// LOGIN
// ============================================================

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: "Username and password are required."
            });
        }

        const result = await query(
            `
            SELECT
                id,
                username,
                password_hash,
                category,
                is_active
            FROM jp_users
            WHERE username = $1
            LIMIT 1
            `,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid credentials."
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                error: "This account has been disabled."
            });
        }

        const validPassword = await verifyPassword(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid credentials."
            });
        }

        await query(
            `
            UPDATE jp_users
            SET last_login_at = NOW()
            WHERE id = $1
            `,
            [user.id]
        );

        const token = createJpToken({
            id: user.id,
            username: user.username,
            category: user.category
        });

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,

            // Cross-site frontend and API require HTTPS
            secure: true,

            // Required because keystone-swords.com and Railway
            // are different sites
            sameSite: "none",

            maxAge: 7 * 24 * 60 * 60 * 1000,

            path: "/"
        });

        return res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                category: user.category
            }
        });

    } catch (error) {
        console.error("JP LOGIN ERROR:", error);

        return res.status(500).json({
            error: "Internal server error."
        });
    }
});

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

export function requireJpAuth(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({
            error: "Not authenticated."
        });
    }

    const user = verifyJpToken(token);

    if (!user) {
        return res.status(401).json({
            error: "Invalid or expired session."
        });
    }

    req.jpUser = user;

    next();
}

// ============================================================
// CURRENT USER
// ============================================================

router.get("/me", requireJpAuth, async (req, res) => {
    try {
        const result = await query(
            `
            SELECT
                id,
                username,
                category,
                is_active
            FROM jp_users
            WHERE id = $1
            `,
            [req.jpUser.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "User no longer exists."
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                error: "Account disabled."
            });
        }

        return res.json({
            user: {
                id: user.id,
                username: user.username,
                category: user.category
            }
        });

    } catch (error) {
        console.error("JP ME ERROR:", error);

        return res.status(500).json({
            error: "Internal server error."
        });
    }
});

// ============================================================
// LOGOUT
// ============================================================

router.post("/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/"
    });

    return res.json({
        success: true
    });
});

export default router;