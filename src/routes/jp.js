import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { query } from "../utils/db.js";

const router = express.Router();

const COOKIE_NAME = "jp_session";

const JWT_SECRET = process.env.JP_JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        "JP_JWT_SECRET is missing from environment variables."
    );
}


// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

async function verifyPassword(password, passwordHash) {

    return bcrypt.compare(
        password,
        passwordHash
    );

}


function createJpToken(user) {

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


function verifyJpToken(token) {

    try {

        return jwt.verify(
            token,
            JWT_SECRET
        );

    } catch (error) {

        return null;

    }

}


// ============================================================
// IDENTITY-SHARING FILTER
// ============================================================

function containsIdentitySharing(message) {

    const text =
        String(
            message || ""
        );


    const patterns = [

        // Email addresses
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,

        // IPv4 addresses
        /\b(?:\d{1,3}\.){3}\d{1,3}\b/,

        // Phone numbers
        /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/,

        // Discord links / identity references
        /discord(?:\.gg|app\.com|\.com)/i,
        /discord\s*(?:username|tag|user|id)/i,

        // Social media URLs
        /(?:https?:\/\/)?(?:www\.)?(?:instagram|twitter|x|facebook|tiktok|snapchat|telegram)\.com/i,

        // Generic URLs
        /https?:\/\/\S+/i,

        // Street address patterns
        /\b\d{1,6}\s+[A-Z0-9][A-Z0-9\s.-]{2,}\s+(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|court|ct|way)\b/i,

        // Explicit contact-sharing language
        /\b(?:my|my personal|contact me at|reach me at|message me at)\s+(?:email|phone|number|address|discord|instagram|twitter|telegram)\b/i

    ];


    return patterns.some(

        pattern =>
            pattern.test(text)

    );

}


// ============================================================
// LOGIN
// ============================================================

router.post(

    "/login",

    async (

        req,
        res

    ) => {

        try {

            const {
                username,
                password
            } =
                req.body;


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

                    [
                        username
                    ]

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

                [
                    user.id
                ]

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

    }

);


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


    if (!token) {

        return res.status(401).json({

            error:
                "Not authenticated."

        });

    }


    const user =
        verifyJpToken(

            token

        );


    if (!user) {

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


            if (!user.is_active) {

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

function normalizeRoom(room) {

    const normalizedRoom =
        String(

            room || ""

        )
        .toLowerCase()
        .trim();


    if (

        normalizedRoom ===
        "degen"

    ) {

        return "degen";

    }


    if (

        normalizedRoom ===
        "exploit"

    ) {

        return "exploit";

    }


    return null;

}


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

        return (

            category ===
            "exploit"

        ) ||

        (

            category ===
            "exploiter"

        );

    }


    return false;

}


// ============================================================
// RANDOMIZED CHAT IDENTITIES
// ============================================================

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
        Number(

            userId

        );


    let seed =
        numericId;


    if (

        room ===
        "degen"

    ) {

        seed +=
            7919;

    } else {

        seed +=
            15485863;

    }


    const adjective =
        adjectives[

            Math.abs(

                seed

            )
            %
            adjectives.length

        ];


    const noun =
        nouns[

            Math.floor(

                Math.abs(

                    seed

                )
                /
                adjectives.length

            )
            %
            nouns.length

        ];


    const number =
        (

            Math.abs(

                seed

            )
            %
            9000

        )
        +
        1000;


    return (

        `${adjective} ${noun} ${number}`

    );

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
                normalizeRoom(

                    req.params.room

                );


            if (!room) {

                return res.status(404).json({

                    error:
                        "Chat room not found."

                });

            }


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
                    INNER JOIN jp_users u
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

                        const displayName =
                            isAdmin

                                ? message.username

                                : generateChatAlias(

                                    message.user_id,
                                    room

                                );


                        const formattedMessage = {

                            id:
                                message.id,

                            username:
                                displayName,

                            message:
                                message.message,

                            createdAt:
                                message.created_at

                        };


                        if (isAdmin) {

                            formattedMessage.realUsername =
                                message.username;

                            formattedMessage.userId =
                                message.user_id;

                        }


                        return formattedMessage;

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
                normalizeRoom(

                    req.params.room

                );


            if (!room) {

                return res.status(404).json({

                    error:
                        "Chat room not found."

                });

            }


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

                )
                .trim();


            if (!message) {

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


            if (

                user.category !==
                "admin"

                &&

                containsIdentitySharing(

                    message

                )

            ) {

                return res.status(400).json({

                    error:
                        "Message blocked. Identity-sharing content is not permitted in this room."

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


            const displayName =
                isAdmin

                    ? user.username

                    : generateChatAlias(

                        user.userId,
                        room

                    );


            const responseMessage = {

                id:
                    created.id,

                username:
                    displayName,

                message:
                    created.message,

                createdAt:
                    created.created_at

            };


            if (isAdmin) {

                responseMessage.realUsername =
                    user.username;

                responseMessage.userId =
                    user.userId;

            }


            return res.status(201).json({

                message:
                    responseMessage

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
