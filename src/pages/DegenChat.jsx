import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

import "./JPChat.css";

function DegenChat() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

            } catch (error) {

                console.error(
                    "DEGEN ROOM ERROR:",
                    error
                );

                setError(
                    error.message
                );

            } finally {

                setLoading(false);

            }
        }

        loadUser();

    }, []);


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


    if (error) {

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
                                navigate("/jp/dashboard")
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
                            navigate("/jp/dashboard")
                        }
                    >

                        DASHBOARD

                    </button>

                </div>

            </header>


            <section className="jp-chat-panel">

                <div className="jp-chat-messages">

                    <article className="jp-chat-message">

                        <div className="jp-chat-message-text">

                            The degen workroom is online.

                        </div>

                    </article>

                </div>


                <form
                    className="jp-chat-composer"
                    onSubmit={event => {
                        event.preventDefault();
                    }}
                >

                    <input
                        className="jp-chat-input"
                        type="text"
                        placeholder="Transmit message..."
                    />

                    <button
                        className="jp-chat-send"
                        type="submit"
                    >

                        SEND

                    </button>

                </form>

            </section>

        </main>

    );
}

export default DegenChat;