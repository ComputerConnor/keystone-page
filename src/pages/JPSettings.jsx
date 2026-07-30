import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";
import "./JPSettings.css";

function JPSettings() {
    const navigate = useNavigate();

    const [settings, setSettings] = useState(null);
    const [qr, setQr] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [linkCode, setLinkCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function request(path, options = {}) {
        const response = await fetch(
            `${API_BASE}/api/jp${path}`,
            {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed.");
        }

        return data;
    }

    async function load() {
        try {
            const data = await request("/panel/settings");
            setSettings(data.settings);
        } catch (loadError) {
            setError(loadError.message);
            if (loadError.message.toLowerCase().includes("authenticated")) {
                navigate("/jp");
            }
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function start2fa() {
        setError("");
        const data = await request("/2fa/setup/start", {
            method: "POST"
        });
        setQr(data.qrCodeDataUrl);
        setSecret(data.secret);
    }

    async function confirm2fa() {
        await request("/2fa/setup/confirm", {
            method: "POST",
            body: JSON.stringify({ code })
        });
        setQr("");
        setSecret("");
        setCode("");
        setMessage("Two-factor authentication enabled.");
        await load();
    }

    async function skip2fa() {
        await request("/2fa/setup/skip", {
            method: "POST"
        });
        setMessage("Two-factor setup skipped.");
        navigate("/jp/dashboard");
    }

    async function createLinkCode() {
        const data = await request("/panel/discord/link-code", {
            method: "POST"
        });
        setLinkCode(data.code);
    }

    async function unlinkDiscord() {
        await request("/panel/discord/link", {
            method: "DELETE"
        });
        setLinkCode("");
        await load();
    }

    async function saveNotifications(event) {
        event.preventDefault();

        await request("/panel/settings", {
            method: "PATCH",
            body: JSON.stringify({
                notificationPreference:
                    settings.notification_preference,
                notificationChannelId:
                    settings.notification_channel_id || null
            })
        });

        setMessage("Notification settings saved.");
    }

    if (!settings) {
        return (
            <main className="jp-settings-page">
                <section className="jp-settings-shell">
                    LOADING SETTINGS...
                </section>
            </main>
        );
    }

    return (
        <main className="jp-settings-page">
            <section className="jp-settings-shell">
                <header>
                    <div>
                        <span>KEYSTONE // JP // ACCOUNT</span>
                        <h1>ACCOUNT SETTINGS</h1>
                    </div>

                    <button onClick={() => navigate("/jp/dashboard")}>
                        DASHBOARD
                    </button>
                </header>

                {error && <div className="jp-settings-error">{error}</div>}
                {message && <div className="jp-settings-success">{message}</div>}

                <article className="jp-settings-card">
                    <h2>TWO-FACTOR AUTHENTICATION</h2>

                    {settings.two_factor_enabled ? (
                        <p>Authenticator-based 2FA is enabled.</p>
                    ) : (
                        <>
                            <p>
                                Protect this account using Google Authenticator,
                                Microsoft Authenticator, Authy, Bitwarden, or 1Password.
                            </p>

                            {!qr && (
                                <div className="jp-settings-actions">
                                    <button onClick={start2fa}>
                                        SET UP 2FA
                                    </button>
                                    <button onClick={skip2fa}>
                                        SKIP FOR NOW
                                    </button>
                                </div>
                            )}

                            {qr && (
                                <div className="jp-2fa-setup">
                                    <img src={qr} alt="Authenticator QR code" />
                                    <code>{secret}</code>
                                    <input
                                        value={code}
                                        onChange={event => setCode(event.target.value)}
                                        placeholder="Six-digit code"
                                        inputMode="numeric"
                                    />
                                    <button onClick={confirm2fa}>
                                        CONFIRM AND ENABLE
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </article>

                <article className="jp-settings-card">
                    <h2>DISCORD ACCOUNT</h2>

                    {settings.discord_id ? (
                        <>
                            <p>
                                Linked as <strong>
                                    {settings.discord_username ||
                                    settings.discord_id}
                                </strong>
                            </p>
                            <button onClick={unlinkDiscord}>
                                UNLINK DISCORD
                            </button>
                        </>
                    ) : (
                        <>
                            <p>
                                Generate a code, then run
                                <code> /linkpanel code:CODE </code>
                                in the Discord server.
                            </p>

                            <button onClick={createLinkCode}>
                                GENERATE LINK CODE
                            </button>

                            {linkCode && (
                                <div className="jp-link-code">
                                    {linkCode}
                                </div>
                            )}
                        </>
                    )}
                </article>

                <article className="jp-settings-card">
                    <h2>NOTIFICATIONS</h2>

                    <form onSubmit={saveNotifications}>
                        <label>
                            <span>DELIVERY METHOD</span>
                            <select
                                value={settings.notification_preference}
                                onChange={event =>
                                    setSettings(current => ({
                                        ...current,
                                        notification_preference:
                                            event.target.value
                                    }))
                                }
                            >
                                <option value="dm">Discord DM</option>
                                <option value="channel">Designated channel</option>
                                <option value="both">DM and channel</option>
                                <option value="none">Disabled</option>
                            </select>
                        </label>

                        <label>
                            <span>FALLBACK CHANNEL ID</span>
                            <input
                                value={settings.notification_channel_id || ""}
                                onChange={event =>
                                    setSettings(current => ({
                                        ...current,
                                        notification_channel_id:
                                            event.target.value
                                    }))
                                }
                                placeholder="Discord channel ID"
                            />
                        </label>

                        <button type="submit">
                            SAVE NOTIFICATIONS
                        </button>
                    </form>
                </article>
            </section>
        </main>
    );
}

export default JPSettings;