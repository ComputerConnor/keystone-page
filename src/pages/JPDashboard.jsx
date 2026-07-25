import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

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

            <main className="jp-login-page">

                <div className="jp-login-card">

                    AUTHENTICATING SESSION...

                </div>

            </main>
        );
    }


    if (!user) {

        return null;
    }


    const isAdmin =
        user.category === "admin";


    const isDegen =
        user.category === "degen";


    const isExploiter =
        user.category === "exploiter";


    return (

        <main className="jp-dashboard-page">

            <div className="jp-dashboard-shell">

                <header className="jp-dashboard-header">

                    <div>

                        <span className="jp-login-label">

                            KEYSTONE // JP

                        </span>

                        <h1>

                            JP Dashboard

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

                            {user.category}

                        </small>

                    </div>

                </header>


                <section className="jp-room-grid">


                    {isDegen && (

                        <button
                            className="jp-room-card jp-room-degen"
                            onClick={() =>
                                openRoom("degen")
                            }
                        >

                            <span className="jp-room-index">

                                01

                            </span>

                            <div className="jp-room-icon">

                                ◈

                            </div>

                            <h2>

                                DEGEN WORKROOM

                            </h2>

                            <p>

                                Private communications between
                                verified degen workers.

                            </p>

                            <span className="jp-room-access">

                                ACCESS GRANTED

                            </span>

                        </button>

                    )}


                    {isExploiter && (

                        <button
                            className="jp-room-card jp-room-exploit"
                            onClick={() =>
                                openRoom("exploiter")
                            }
                        >

                            <span className="jp-room-index">

                                02

                            </span>

                            <div className="jp-room-icon">

                                ◇

                            </div>

                            <h2>

                                EXPLOIT WORKROOM

                            </h2>

                            <p>

                                Private communications between
                                verified exploit workers.

                            </p>

                            <span className="jp-room-access">

                                IDENTITY MASKING ACTIVE

                            </span>

                        </button>

                    )}


                    {isAdmin && (

                        <>

                            <button
                                className="jp-room-card jp-room-admin"
                                onClick={() =>
                                    openRoom("degen")
                                }
                            >

                                <span className="jp-room-index">

                                    01

                                </span>

                                <div className="jp-room-icon">

                                    ◈

                                </div>

                                <h2>

                                    DEGEN WORKROOM

                                </h2>

                                <p>

                                    Administrative access.
                                    Worker identities visible.

                                </p>

                                <span className="jp-room-access">

                                    ADMIN OVERRIDE

                                </span>

                            </button>


                            <button
                                className="jp-room-card jp-room-admin"
                                onClick={() =>
                                    openRoom("exploiter")
                                }
                            >

                                <span className="jp-room-index">

                                    02

                                </span>

                                <div className="jp-room-icon">

                                    ◇

                                </div>

                                <h2>

                                    EXPLOIT WORKROOM

                                </h2>

                                <p>

                                    Administrative access.
                                    Identity masking bypassed.

                                </p>

                                <span className="jp-room-access">

                                    ADMIN OVERRIDE

                                </span>

                            </button>

                        </>

                    )}

                </section>


                <footer className="jp-dashboard-footer">

                    <span>

                        SESSION: ACTIVE

                    </span>


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