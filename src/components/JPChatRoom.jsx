import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API_BASE from "../utils/api";

import "../pages/JPChat.css";


function JPChatRoom({
    room,
    title,
    description,
    allowedCategories
}) {

    const navigate =
        useNavigate();

    const messagesEndRef =
        useRef(null);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        messages,
        setMessages
    ] =
        useState([]);

    const [
        message,
        setMessage
    ] =
        useState("");

    const [
        sending,
        setSending
    ] =
        useState(false);

    const [
        restrictionMessage,
        setRestrictionMessage
    ] =
        useState("");


    const loadMessages =
        useCallback(
            async () => {

                try {

                    const response =
                        await fetch(
                            `${API_BASE}/api/jp/chat/${room}/messages`,
                            {
                                credentials:
                                    "include"
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Unable to load messages."
                        );
                    }

                    setMessages(
                        data.messages || []
                    );

                } catch (error) {

                    console.error(
                        `${room.toUpperCase()} CHAT FETCH ERROR:`,
                        error
                    );

                    setError(
                        error.message
                    );
                }
            },
            [room]
        );


    useEffect(
        () => {

            let intervalId =
                null;

            async function initializeRoom() {

                try {

                    const response =
                        await fetch(
                            `${API_BASE}/api/jp/me`,
                            {
                                credentials:
                                    "include"
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Access denied."
                        );
                    }

                    const category =
                        String(
                            data.user.category ||
                            ""
                        )
                            .trim()
                            .toLowerCase();

                    if (
                        !allowedCategories.includes(
                            category
                        ) &&
                        category !== "admin"
                    ) {
                        throw new Error(
                            "You do not have access to this room."
                        );
                    }

                    await loadMessages();

                    intervalId =
                        setInterval(
                            loadMessages,
                            3000
                        );

                } catch (error) {

                    console.error(
                        `${room.toUpperCase()} ROOM ERROR:`,
                        error
                    );

                    setError(
                        error.message
                    );

                } finally {

                    setLoading(false);
                }
            }

            initializeRoom();

            return () => {

                if (intervalId) {
                    clearInterval(
                        intervalId
                    );
                }
            };
        },
        [
            allowedCategories,
            loadMessages,
            room
        ]
    );


    useEffect(
        () => {

            messagesEndRef.current
                ?.scrollIntoView({
                    behavior:
                        "smooth"
                });

        },
        [messages.length]
    );


    async function sendMessage(
        event
    ) {

        event.preventDefault();

        const trimmedMessage =
            message.trim();

        if (
            !trimmedMessage ||
            sending
        ) {
            return;
        }

        setSending(true);
        setRestrictionMessage("");

        try {

            const response =
                await fetch(
                    `${API_BASE}/api/jp/chat/${room}/messages`,
                    {
                        method:
                            "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                message:
                                    trimmedMessage
                            })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to send message."
                );
            }

            setMessages(
                previousMessages => {

                    const alreadyExists =
                        previousMessages.some(
                            existingMessage =>
                                existingMessage.id ===
                                data.message.id
                        );

                    if (alreadyExists) {
                        return previousMessages;
                    }

                    return [
                        ...previousMessages,
                        data.message
                    ];
                }
            );

            setMessage("");

        } catch (error) {

            console.error(
                `${room.toUpperCase()} CHAT SEND ERROR:`,
                error
            );

            setRestrictionMessage(
                error.message
            );

        } finally {

            setSending(false);
        }
    }


    if (loading) {
        return (
            <main className="jp-chat-page">
                <div className="jp-chat-panel">
                    <div className="jp-chat-messages">
                        AUTHENTICATING ROOM ACCESS...
                    </div>
                </div>
            </main>
        );
    }


    if (error && !messages.length) {
        return (
            <main className="jp-chat-page">
                <div className="jp-chat-panel">
                    <div className="jp-chat-messages">
                        <h1 className="jp-chat-title">
                            ACCESS DENIED
                        </h1>

                        <p className="jp-chat-description">
                            {error}
                        </p>

                        <button
                            className="jp-chat-button"
                            onClick={() =>
                                navigate(
                                    "/jp/dashboard"
                                )
                            }
                        >
                            RETURN TO DASHBOARD
                        </button>
                    </div>
                </div>
            </main>
        );
    }


    return (
        <main className="jp-chat-page">

            <header className="jp-chat-header">

                <div className="jp-chat-header-left">

                    <span className="jp-chat-label">
                        KEYSTONE // JP // PRIVATE
                    </span>

                    <h1 className="jp-chat-title">
                        {title}
                    </h1>

                    <p className="jp-chat-description">
                        {description}
                    </p>

                </div>

                <div className="jp-chat-actions">

                    <button
                        className="jp-chat-button"
                        onClick={() =>
                            navigate(
                                "/jp/dashboard"
                            )
                        }
                    >
                        DASHBOARD
                    </button>

                </div>

            </header>

            <section className="jp-chat-panel">

                <div className="jp-chat-privacy-notice">
                    Identity masking is active. Do not share names,
                    usernames, contact information, locations, account
                    handles, or other identifying information.
                </div>

                <div className="jp-chat-messages">

                    {
                        messages.length === 0 && (
                            <article className="jp-chat-message">
                                <div className="jp-chat-message-text">
                                    This private workroom is online.
                                </div>
                            </article>
                        )
                    }

                    {
                        messages.map(
                            currentMessage => (
                                <article
                                    className="jp-chat-message"
                                    key={
                                        currentMessage.id
                                    }
                                >

                                    <div className="jp-chat-message-meta">

                                        <strong>
                                            {
                                                currentMessage.username
                                            }
                                        </strong>

                                        <time
                                            dateTime={
                                                currentMessage.createdAt
                                            }
                                        >
                                            {
                                                new Date(
                                                    currentMessage.createdAt
                                                )
                                                    .toLocaleString(
                                                        [],
                                                        {
                                                            month:
                                                                "short",
                                                            day:
                                                                "numeric",
                                                            hour:
                                                                "2-digit",
                                                            minute:
                                                                "2-digit"
                                                        }
                                                    )
                                            }
                                        </time>

                                    </div>

                                    {
                                        currentMessage.realUsername && (
                                            <div
                                                className="jp-chat-admin-identity"
                                            >
                                                ADMIN VIEW // REAL IDENTITY: {
                                                    currentMessage.realUsername
                                                }
                                            </div>
                                        )
                                    }

                                    <div className="jp-chat-message-text">
                                        {
                                            currentMessage.message
                                        }
                                    </div>

                                </article>
                            )
                        )
                    }

                    <div
                        ref={
                            messagesEndRef
                        }
                    />

                </div>

                {
                    restrictionMessage && (
                        <div className="jp-chat-restriction">
                            {
                                restrictionMessage
                            }
                        </div>
                    )
                }

                <form
                    className="jp-chat-composer"
                    onSubmit={
                        sendMessage
                    }
                >

                    <input
                        className="jp-chat-input"
                        type="text"
                        value={
                            message
                        }
                        onChange={
                            event => {
                                setMessage(
                                    event.target.value
                                );

                                setRestrictionMessage(
                                    ""
                                );
                            }
                        }
                        placeholder="Message anonymously..."
                        maxLength={2000}
                        disabled={
                            sending
                        }
                        autoComplete="off"
                    />

                    <button
                        className="jp-chat-send"
                        type="submit"
                        disabled={
                            sending ||
                            !message.trim()
                        }
                    >
                        {
                            sending
                                ? "SENDING..."
                                : "SEND"
                        }
                    </button>

                </form>

            </section>

        </main>
    );
}


export default JPChatRoom;
