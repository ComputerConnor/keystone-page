import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

function JPDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await fetch(
                    `${API_BASE}/api/jp/me`,
                    {
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Unable to authenticate session."
                    );
                }

                setUser(data.user);

            } catch (error) {
                console.error(
                    "JP SESSION ERROR:",
                    error
                );

                navigate("/jp");

            } finally {
                setLoading(false);
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
            navigate("/jp");
        }
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

    return (
        <main className="jp-dashboard-page">

            <div className="jp-dashboard-card">

                <span className="jp-login-label">
                    KEYSTONE // JP
                </span>

                <h1>
                    JP Dashboard
                </h1>

                <p>
                    Welcome, {user.username}.
                </p>

                <p>
                    Clearance category:{" "}
                    <strong>
                        {user.category}
                    </strong>
                </p>

                <button
                    onClick={handleLogout}
                >
                    LOG OUT
                </button>

            </div>

        </main>
    );
}

export default JPDashboard;