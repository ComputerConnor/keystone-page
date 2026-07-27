import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

import "./JPDashboard.css";

function JPDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
                        "Unable to authenticate session."
                    );
                }

                setUser(
                    data.user
                );

            } catch (error) {

                console.error(
                    "JP SESSION ERROR:",
                    error
                );

                navigate(
                    "/jp"
                );

            } finally {

                setLoading(
                    false
                );
            }
        }

        loadUser();

    }, [navigate]);


    async function handleLogout() {

        try {

            await fetch(
                `${API_BASE}/api/jp/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        } finally {

            navigate(
                "/jp"
            );
        }
    }


    function openRoom(room) {

        navigate(
            `/jp/chat/${room}`
        );
    }


    if (loading) {

        return (

            <main className="jp-dashboard-page">

                <div className="jp-dashboard-shell">

                    <span className="jp-login-label">

                        KEYSTONE // JP

                    </span>

                    <h1>

                        AUTHENTICATING SESSION...

                    </h1>

                </div>

            </main>
        );
    }


    if (!user) {

        return null;
    }


    const role = (user.category || "").toUpperCase();

    const isAdmin =
        role === "ADMIN";

    const isDegen =
        role === "DGN_PANEL";

    const isExploit =
        role === "XPLT_PANEL";


    return (

        <main className="jp-dashboard-page">

            <div className="jp-dashboard-shell">

                <header className="jp-dashboard-header">

                    <div>

                        <span className="jp-login-label">

                            KEYSTONE // JP // INTERNAL

                        </span>

                        <h1>

                            JP DASHBOARD

                        </h1>

                        <p>

                            Secure internal communication channels.

                        </p>

                    </div>


                    <div className="jp-user-status">

                        <span>

                            AUTHENTICATED USER

                        </span>

                        <strong>

                            {user.username}

                        </strong>

                        <small>

                            {user.category.toUpperCase()}

                        </small>

                    </div>

                </header>


                <div className="jp-dashboard-divider" />


                <section className="jp-room-section">

                    <div className="jp-room-grid">

    {(isAdmin || isDegen || isExploit) && (

        <button
            className="jp-room-card"
            onClick={() => navigate("/jp/cases")}
        >

            <span className="jp-room-index">
                01
            </span>

            <h2>
                CASE QUEUE
            </h2>

            <p>
                Review assigned investigations and complete reports.
            </p>

        </button>

    )}

    {isAdmin && (

        <button
            className="jp-room-card"
            onClick={() => navigate("/jp/submissions")}
        >

            <span className="jp-room-index">
                02
            </span>

            <h2>
                SUBMISSION QUEUE
            </h2>

            <p>
                Approve, reject or return submitted investigations.
            </p>

        </button>

    )}

    {(isAdmin || isDegen) && (

        <button
            className="jp-room-card jp-room-degen"
            onClick={() => openRoom("degen")}
        >

            <span className="jp-room-index">
                03
            </span>

            <h2>
                DEGEN CHAT
            </h2>

            <p>
                Internal communications for DGN Panel members.
            </p>

        </button>

    )}

    {(isAdmin || isExploit) && (

        <button
            className="jp-room-card jp-room-exploit"
            onClick={() => openRoom("exploit")}
        >

            <span className="jp-room-index">
                04
            </span>

            <h2>
                EXPLOIT CHAT
            </h2>

            <p>
                Internal communications for XPLT Panel members.
            </p>

        </button>

    )}

</div>

                </section>


                <div className="jp-dashboard-divider" />


                <footer className="jp-dashboard-footer">

                    <button
                        className="jp-logout-button"
                        onClick={handleLogout}
                    >

                        LOG OUT

                    </button>

                </footer>

            </div>

        </main>

    );

}

export default JPDashboard;