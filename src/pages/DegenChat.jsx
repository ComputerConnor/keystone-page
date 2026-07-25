import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

import "./JPChat.css";

function DegenChat() {


const navigate = useNavigate();

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [messages, setMessages] = useState([]);
const [message, setMessage] = useState("");
const [sending, setSending] = useState(false);


async function loadMessages() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/jp/chat/degen/messages`,
                {
                    credentials: "include"
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
            data.messages
        );


    } catch (error) {

        console.error(
            "DEGEN MESSAGE LOAD ERROR:",
            error
        );

        setError(
            error.message
        );
    }
}


useEffect(() => {

    async function loadUser() {

        try {

            const response =
                await fetch(
                    `${API_BASE}/api/jp/me`,
                    {
                        credentials: "include"
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


            if (
                data.user.category !== "degen" &&
                data.user.category !== "admin"
            ) {

                throw new Error(
                    "You do not have access to this room."
                );
            }


            await loadMessages();


        } catch (error) {

            console.error(
                "DEGEN ROOM ERROR:",
                error
            );

            setError(
                error.message
            );


        } finally {

            setLoading(
                false
            );
        }
    }


    loadUser();


    const interval =
        setInterval(
            loadMessages,
            3000
        );


    return () =>
        clearInterval(
            interval
        );

}, []);


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


    setSending(
        true
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/api/jp/chat/degen/messages`,
                {
                    method: "POST",

                    credentials: "include",

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
            previous =>
                [
                    ...previous,
                    data.message
                ]
        );


        setMessage("");


    } catch (error) {

        setError(
            error.message
        );


    } finally {

        setSending(
            false
        );
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

                    DEGEN WORKROOM

                </h1>


                <p className="jp-chat-description">

                    Restricted communications channel.

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

            <div className="jp-chat-messages">

                {messages.map(
                    currentMessage => (

                        <article
                            className="jp-chat-message"
                            key={
                                currentMessage.id
                            }
                        >

                            <div
                                className="jp-chat-message-user"
                            >

                                {currentMessage.username}

                                {
                                    currentMessage.realUsername &&
                                    ` (${currentMessage.realUsername})`
                                }

                            </div>


                            <div
                                className="jp-chat-message-text"
                            >

                                {
                                    currentMessage.message
                                }

                            </div>

                        </article>

                    )
                )}

            </div>


            {error && (

                <div className="jp-chat-error">

                    {error}

                </div>

            )}


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
                        event =>
                            setMessage(
                                event.target.value
                            )
                    }
                    placeholder="Send message..."
                    maxLength={2000}
                />


                <button
                    className="jp-chat-send"
                    type="submit"
                    disabled={
                        sending
                    }
                >

                    {sending
                        ? "..."
                        : "SEND"
                    }

                </button>

            </form>

        </section>

    </main>

);

}

export default DegenChat;
