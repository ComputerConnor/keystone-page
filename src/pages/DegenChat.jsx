import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

function DegenChat() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
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

                setUser(
                    data.user
                );

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

    }, []);


    if (loading) {

        return (

            <main className="jp-dashboard-page">

                <div className="jp-dashboard-shell">

                    AUTHENTICATING ROOM ACCESS...

                </div>

            </main>
        );
    }


    if (error) {

        return (

            <main className="jp-dashboard-page">

                <div className="jp-dashboard-shell">

                    <h1>
                        ACCESS DENIED
                    </h1>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/jp/dashboard")
                        }
                    >

                        RETURN TO DASHBOARD

                    </button>

                </div>

            </main>
        );
    }


    return (

        <main className="jp-dashboard-page">

            <div className="jp-dashboard-shell">

                <header className="jp-dashboard-header">

                    <div>

                        <span className="jp-login-label">

                            KEYSTONE // JP // PRIVATE

                        </span>

                        <h1>

                            DEGEN WORKROOM

                        </h1>

                        <p>

                            Restricted communications channel.

                        </p>

                    </div>

                </header>


                <section className="jp-chat-window">

                    <div className="jp-chat-messages">

                        <p>
                            The degen workroom is online.
                        </p>

                    </div>


                    <div className="jp-chat-input">

                        <input
                            type="text"
                            placeholder="Enter message..."
                        />

                        <button>

                            SEND

                        </button>

                    </div>

                </section>


                <button
                    onClick={() =>
                        navigate("/jp/dashboard")
                    }
                >

                    RETURN TO DASHBOARD

                </button>

            </div>

        </main>

    );
}

export default DegenChat;