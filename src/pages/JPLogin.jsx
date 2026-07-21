import { useState } from "react";
import API_BASE from "../utils/api";

function JPLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE}/api/jp/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Login failed"
                );
            }

            console.log(
                "JP LOGIN SUCCESS:",
                data
            );

            // Temporary success behavior.
            // We can redirect to the JP dashboard next.

        } catch (error) {
            setError(
                error.message ||
                "Unable to connect to the authentication server."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="jp-login-page">

            <div className="jp-login-card">

                <div className="jp-login-header">

                    <span className="jp-login-label">
                        KEYSTONE // JP
                    </span>

                    <h1>
                        Restricted Access
                    </h1>

                    <p>
                        Authorized personnel only.
                    </p>

                </div>

                <form
                    onSubmit={handleLogin}
                >

                    <div className="jp-input-group">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            placeholder="Enter username"
                            required
                        />

                    </div>

                    <div className="jp-input-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter password"
                            required
                        />

                    </div>

                    {error && (

                        <div className="jp-login-error">

                            {error}

                        </div>

                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "AUTHENTICATING..."
                            : "AUTHENTICATE"
                        }

                    </button>

                </form>

            </div>

        </main>
    );
}

export default JPLogin;