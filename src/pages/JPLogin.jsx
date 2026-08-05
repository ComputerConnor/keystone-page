import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";
import "./JPSettings.css";

function JPLogin() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        code: ""
    });

    const [step, setStep] = useState("password");
    const [error, setError] = useState("");
    const [working, setWorking] = useState(false);

    function update(event) {
        setForm(current => ({
            ...current,
            [event.target.name]: event.target.value
        }));
    }

    function restartLogin() {
        setStep("password");
        setError("");
        setForm(current => ({
            ...current,
            password: "",
            code: ""
        }));
    }

    async function submit(event) {
        event.preventDefault();
        setWorking(true);
        setError("");

        try {
            const response = await fetch(
                step === "twoFactor"
                    ? `${API_BASE}/api/jp/2fa/challenge`
                    : `${API_BASE}/api/jp/login`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        step === "twoFactor"
                            ? {
                                code:
                                    form.code
                                        .replace(/\D/g, "")
                            }
                            : {
                                username: form.username,
                                password: form.password
                            }
                    )
                }
            );

            const data = await response.json();

            if (
                response.status === 202 &&
                data.requiresTwoFactor
            ) {
                setForm(current => ({
                    ...current,
                    code: ""
                }));

                setStep("twoFactor");
                return;
            }

            if (!response.ok) {
                const message =
                    data.error ||
                    "Unable to sign in.";

                if (
                    step === "twoFactor" &&
                    message
                        .toLowerCase()
                        .includes("challenge expired")
                ) {
                    setStep("password");

                    setForm(current => ({
                        ...current,
                        password: "",
                        code: ""
                    }));

                    throw new Error(
                        "The two-factor challenge expired. Enter your password to begin again."
                    );
                }

                throw new Error(
                    message
                );
            }

            if (data.requiresTwoFactorSetup) {
                navigate(
                    "/jp/settings?setup2fa=1"
                );
            } else {
                navigate(
                    "/jp/dashboard"
                );
            }
        } catch (loginError) {
            setError(
                loginError.message
            );
        } finally {
            setWorking(false);
        }
    }

    return (
        <main className="jp-login-page">
            <section className="jp-login-card">
                <span className="jp-login-label">
                    KEYSTONE // JUDICIAL PANEL
                </span>

                <h1>
                    {
                        step === "twoFactor"
                            ? "TWO-FACTOR VERIFICATION"
                            : "SECURE LOGIN"
                    }
                </h1>

                <p>
                    {
                        step === "twoFactor"
                            ? "Enter the six-digit code from your authenticator. This challenge remains valid for ten minutes."
                            : "Authenticate to access internal panel systems."
                    }
                </p>

                <form onSubmit={submit}>
                    {
                        step === "password"
                            ? (
                                <>
                                    <label>
                                        <span>
                                            USERNAME
                                        </span>

                                        <input
                                            name="username"
                                            value={form.username}
                                            onChange={update}
                                            autoComplete="username"
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>
                                            PASSWORD
                                        </span>

                                        <input
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={update}
                                            autoComplete="current-password"
                                            required
                                        />
                                    </label>
                                </>
                            )
                            : (
                                <label>
                                    <span>
                                        AUTHENTICATOR CODE
                                    </span>

                                    <input
                                        name="code"
                                        value={form.code}
                                        onChange={event =>
                                            setForm(current => ({
                                                ...current,
                                                code:
                                                    event.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 6)
                                            }))
                                        }
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                        autoFocus
                                        required
                                    />
                                </label>
                            )
                    }

                    {
                        error && (
                            <div className="jp-login-error">
                                {error}
                            </div>
                        )
                    }

                    <button disabled={working}>
                        {
                            working
                                ? "VERIFYING..."
                                : step === "twoFactor"
                                    ? "VERIFY CODE"
                                    : "SIGN IN"
                        }
                    </button>

                    {
                        step === "twoFactor" && (
                            <button
                                type="button"
                                disabled={working}
                                onClick={restartLogin}
                            >
                                START OVER
                            </button>
                        )
                    }
                </form>
            </section>
        </main>
    );
}

export default JPLogin;
