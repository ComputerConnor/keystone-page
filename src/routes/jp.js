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

        const {
            username,
            password
        } = req.body;

        if (
            !username ||
            !password
        ) {

            return res.status(400).json({

                error:
                    "Username and password are required."

            });
        }

        const result =
            await query(

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

        if (
            result.rows.length === 0
        ) {

            return res.status(401).json({

                error:
                    "Invalid credentials."

            });
        }

        const user =
            result.rows[0];

        if (
            !user.is_active
        ) {

            return res.status(403).json({

                error:
                    "This account has been disabled."

            });
        }

        const validPassword =
            await verifyPassword(

                password,
                user.password_hash
            );

        if (
            !validPassword
        ) {

            return res.status(401).json({

                error:
                    "Invalid credentials."

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

        const token =
            createJpToken({

                id:
                    user.id,

                username:
                    user.username,

                category:
                    user.category
            });

        res.cookie(

            COOKIE_NAME,

            token,

            {

                httpOnly:
                    true,

                secure:
                    true,

                sameSite:
                    "none",

                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000,

                path:
                    "/"
            }
        );

        return res.json({

            success:
                true,

            user: {

                id:
                    user.id,

                username:
                    user.username,

                category:
                    user.category
            }
        });

    } catch (error) {

        console.error(
            "JP LOGIN ERROR:",
            error
        );

        return res.status(500).json({

            error:
                "Internal server error."
        });
    }
});


// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

export function requireJpAuth(
    req,
    res,
    next
) {

    const token =
        req.cookies?.[
            COOKIE_NAME
        ];

    if (
        !token
    ) {

        return res.status(401).json({

            error:
                "Not authenticated."
        });
    }

    const user =
        verifyJpToken(
            token
        );

    if (
        !user
    ) {

        return res.status(401).json({

            error:
                "Invalid or expired session."
        });
    }

    req.jpUser =
        user;

    next();
}


// ============================================================
// CURRENT USER
// ============================================================

router.get(

    "/me",

    requireJpAuth,

    async (

        req,
        res
    ) => {

        try {

            const result =
                await query(

                    `
                    SELECT
                        id,
                        username,
                        category,
                        is_active
                    FROM jp_users
                    WHERE id = $1
                    `,

                    [
                        req.jpUser.userId
                    ]
                );

            if (
                result.rows.length === 0
            ) {

                return res.status(401).json({

                    error:
                        "User no longer exists."
                });
            }

            const user =
                result.rows[0];

            if (
                !user.is_active
            ) {

                return res.status(403).json({

                    error:
                        "Account disabled."
                });
            }

            return res.json({

                user: {

                    id:
                        user.id,

                    username:
                        user.username,

                    category:
                        user.category
                }
            });

        } catch (error) {

            console.error(
                "JP ME ERROR:",
                error
            );

            return res.status(500).json({

                error:
                    "Internal server error."
            });
        }
    }
);


// ============================================================
// JP CHAT ROOM ACCESS
// ============================================================

function canAccessRoom(
    category,
    room
) {

    if (
        category ===
        "admin"
    ) {

        return true;
    }

    if (
        room ===
        "degen"
    ) {

        return category ===
            "degen";
    }

    if (
        room ===
        "exploit"
    ) {

        return category ===
            "exploiter";
    }

    return false;
}


// ============================================================
// RANDOMIZED EXPLOIT IDENTITIES
// ============================================================
//
// The same user gets the same alias within the room.
// This means their identity is hidden, but their messages
// can still be recognized as coming from the same person.
//
// Admins bypass this and see the real username.
//

function generateChatAlias(
    userId,
    room
) {

    const adjectives = [

        "Silent",
        "Broken",
        "Hidden",
        "Unknown",
        "Null",
        "Ghost",
        "Redacted",
        "Static",
        "Obscured",
        "Ciphered"

    ];

    const nouns = [

        "Node",
        "Signal",
        "Process",
        "Vector",
        "Thread",
        "Entity",
        "Operator",
        "Instance",
        "Channel",
        "Fragment"

    ];

    const numericId =
        Number(userId);

    let seed =
        numericId;

    // Make the same user have a different
    // identity in each private room.
    if (
        room === "degen"
    ) {

        seed += 7919;

    } else {

        seed += 15485863;
    }

    const adjective =
        adjectives[
            seed %
            adjectives.length
        ];

    const noun =
        nouns[
            Math.floor(
                seed /
                adjectives.length
            ) %
            nouns.length
        ];

    const number =
        (
            seed %
            9000
        ) +
        1000;

    return `${adjective} ${noun} ${number}`;
}


// ============================================================
// GET CHAT MESSAGES
// ============================================================

router.get(

    "/chat/:room/messages",

    requireJpAuth,

    async (

        req,
        res
    ) => {

        try {

            const room =
                String(
                    req.params.room
                ).toLowerCase();

            const user =
                req.jpUser;

            if (
                !canAccessRoom(
                    user.category,
                    room
                )
            ) {

                return res.status(403).json({

                    error:
                        "You do not have access to this room."
                });
            }

            const result =
                await query(

                    `
                    SELECT
                        m.id,
                        m.user_id,
                        m.message,
                        m.created_at,
                        u.username,
                        u.category
                    FROM jp_chat_messages m
                    JOIN jp_users u
                        ON u.id = m.user_id
                    WHERE m.room = $1
                    ORDER BY m.created_at ASC
                    LIMIT 200
                    `,

                    [
                        room
                    ]
                );

            const isAdmin =
                user.category ===
                "admin";

            const messages =
                result.rows.map(

                    message => {

                        let displayName;

                        if (
                            isAdmin
                        ) {

                            displayName =
                                message.username;

                        } else {

                            displayName =
                                generateChatAlias(
                                    message.user_id,
                                    room
                                );
                        }

                        return {

                            id:
                                message.id,

                            username:
                                displayName,

                            message:
                                message.message,

                            createdAt:
                                message.created_at,

                            // Only admins get the actual identity.
                            realUsername:
                                isAdmin
                                    ? message.username
                                    : undefined,

                            userId:
                                isAdmin
                                    ? message.user_id
                                    : undefined
                        };
                    }
                );

            return res.json({

                room,

                messages
            });

        } catch (error) {

            console.error(

                "JP CHAT FETCH ERROR:",

                error
            );

            return res.status(500).json({

                error:
                    "Unable to load chat messages."
            });
        }
    }
);


// ============================================================
// SEND CHAT MESSAGE
// ============================================================

router.post(

    "/chat/:room/messages",

    requireJpAuth,

    async (

        req,
        res
    ) => {

        try {

            const room =
                String(
                    req.params.room
                ).toLowerCase();

            const user =
                req.jpUser;

            if (
                !canAccessRoom(
                    user.category,
                    room
                )
            ) {

                return res.status(403).json({

                    error:
                        "You do not have access to this room."
                });
            }

            const message =
                String(
                    req.body?.message ||
                    ""
                ).trim();

            if (
                !message
            ) {

                return res.status(400).json({

                    error:
                        "Message cannot be empty."
                });
            }

            if (
                message.length >
                2000
            ) {

                return res.status(400).json({

                    error:
                        "Message is too long."
                });
            }

            const result =
                await query(

                    `
                    INSERT INTO jp_chat_messages
                        (
                            room,
                            user_id,
                            message
                        )
                    VALUES
                        (
                            $1,
                            $2,
                            $3
                        )
                    RETURNING
                        id,
                        user_id,
                        message,
                        created_at
                    `,

                    [

                        room,

                        user.userId,

                        message
                    ]
                );

            const created =
                result.rows[0];

            const isAdmin =
                user.category ===
                "admin";

            let displayName;

            if (
                isAdmin
            ) {

                displayName =
                    user.username;

            } else {

                displayName =
                    generateChatAlias(
                        user.userId,
                        room
                    );
            }

            return res.status(201).json({

                message: {

                    id:
                        created.id,

                    username:
                        displayName,

                    message:
                        created.message,

                    createdAt:
                        created.created_at,

                    realUsername:
                        isAdmin
                            ? user.username
                            : undefined,

                    userId:
                        isAdmin
                            ? user.userId
                            : undefined
                }
            });

        } catch (error) {

            console.error(

                "JP CHAT SEND ERROR:",

                error
            );

            return res.status(500).json({

                error:
                    "Unable to send message."
            });
        }
    }
);


// ============================================================
// LOGOUT
// ============================================================

router.post(

    "/logout",

    (

        req,
        res
    ) => {

        res.clearCookie(

            COOKIE_NAME,

            {

                httpOnly:
                    true,

                secure:
                    true,

                sameSite:
                    "none",

                path:
                    "/"
            }
        );

        return res.json({

            success:
                true
        });
    }
);


export default router;