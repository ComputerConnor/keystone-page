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
    const [working, setWorking] = useState(false);
    const [credentials, setCredentials] = useState({
        username: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE}/api/jp${path}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { error: text || "The server returned an invalid response." };
        }

        if (!response.ok) {
            throw new Error(data.error || "Request failed.");
        }

        return data;
    }

    async function load() {
        try {
            const data = await request("/panel/settings");
            setSettings(data.settings);
            setCredentials(current => ({
                ...current,
                username: data.settings?.username || ""
            }));
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
        setMessage("");
        try {
            const data = await request("/2fa/setup/start", { method: "POST" });
            setQr(data.qrCodeDataUrl);
            setSecret(data.secret);
        } catch (err) {
            setError(err.message);
        }
    }

    async function confirm2fa() {
        setWorking(true);
        setError("");
        setMessage("");
        try {
            await request("/2fa/setup/confirm", {
                method: "POST",
                body: JSON.stringify({ code: code.replace(/\D/g, "") })
            });
            setQr("");
            setSecret("");
            setCode("");
            setMessage("Two-factor authentication enabled.");
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setWorking(false);
        }
    }

    async function skip2fa() {
        setWorking(true);
        setError("");
        try {
            await request("/2fa/setup/skip", { method: "POST" });
            navigate("/jp/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setWorking(false);
        }
    }

    async function createLinkCode() {
        setWorking(true);
        setError("");
        setMessage("");
        try {
            const data = await request("/panel/discord/link-code", { method: "POST" });
            setLinkCode(data.code);
        } catch (err) {
            setError(err.message);
        } finally {
            setWorking(false);
        }
    }

    async function unlinkDiscord() {
        setWorking(true);
        setError("");
        try {
            await request("/panel/discord/link", { method: "DELETE" });
            setLinkCode("");
            setMessage("Discord account unlinked.");
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setWorking(false);
        }
    }

    async function enableDmNotifications() {
        setWorking(true);
        setError("");
        setMessage("");
        try {
            await request("/panel/settings", {
                method: "PATCH",
                body: JSON.stringify({ notificationPreference: "dm" })
            });
            setMessage("Discord DM notifications enabled.");
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setWorking(false);
        }
    }

    function updateCredential(event) {
        setCredentials(current => ({
            ...current,
            [event.target.name]: event.target.value
        }));
    }

    async function saveCredentials(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!credentials.currentPassword) {
            setError("Enter your current password.");
            return;
        }

        if (credentials.newPassword !== credentials.confirmPassword) {
            setError("The new passwords do not match.");
            return;
        }

        if (credentials.newPassword && credentials.newPassword.length < 10) {
            setError("The new password must be at least 10 characters.");
            return;
        }

        setWorking(true);
        try {
            const data = await request("/panel/credentials", {
                method: "PATCH",
                body: JSON.stringify({
                    username: credentials.username.trim(),
                    currentPassword: credentials.currentPassword,
                    newPassword: credentials.newPassword || null
                })
            });

            setSettings(current => ({ ...current, username: data.user.username }));
            setCredentials({
                username: data.user.username,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setMessage(data.passwordChanged
                ? "Username and password updated. Sign out and back in to refresh your session name."
                : "Username updated. Sign out and back in to refresh your session name.");
        } catch (err) {
            setError(err.message);
        } finally {
            setWorking(false);
        }
    }

    if (!settings) {
        return <main className="jp-settings-page"><section className="jp-settings-shell">LOADING SETTINGS...</section></main>;
    }

    return (
        <main className="jp-settings-page">
            <section className="jp-settings-shell">
                <header className="jp-settings-header">
                    <div>
                        <span>KEYSTONE // JP // ACCOUNT</span>
                        <h1>ACCOUNT SETTINGS</h1>
                    </div>
                    <button type="button" onClick={() => navigate("/jp/dashboard")}>DASHBOARD</button>
                </header>

                {error && <div className="jp-settings-error">{error}</div>}
                {message && <div className="jp-settings-success">{message}</div>}

                <article className="jp-settings-card">
                    <span className="jp-settings-card-label">SECURITY</span>
                    <h2>TWO-FACTOR AUTHENTICATION</h2>
                    {settings.two_factor_enabled ? (
                        <p>Authenticator-based 2FA is enabled.</p>
                    ) : (
                        <>
                            <p>Protect this account with your preferred authenticator application.</p>
                            {!qr ? (
                                <div className="jp-settings-actions">
                                    <button type="button" disabled={working} onClick={start2fa}>SET UP 2FA</button>
                                    <button type="button" disabled={working} onClick={skip2fa}>SKIP FOR NOW</button>
                                </div>
                            ) : (
                                <div className="jp-2fa-setup">
                                    <img src={qr} alt="Authenticator QR code" />
                                    <code>{secret}</code>
                                    <input value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Six-digit code" inputMode="numeric" maxLength={6} />
                                    <button type="button" disabled={working || code.length !== 6} onClick={confirm2fa}>CONFIRM AND ENABLE</button>
                                </div>
                            )}
                        </>
                    )}
                </article>

                <article className="jp-settings-card">
                    <span className="jp-settings-card-label">LOGIN</span>
                    <h2>USERNAME AND PASSWORD</h2>
                    <p>Replace the initial credentials you were provided. Your current password is required.</p>
                    <form onSubmit={saveCredentials}>
                        <label>
                            <span>NEW USERNAME</span>
                            <input name="username" value={credentials.username} onChange={updateCredential} autoComplete="username" minLength={3} maxLength={40} required />
                        </label>
                        <label>
                            <span>CURRENT PASSWORD</span>
                            <input type="password" name="currentPassword" value={credentials.currentPassword} onChange={updateCredential} autoComplete="current-password" required />
                        </label>
                        <div className="jp-settings-grid">
                            <label>
                                <span>NEW PASSWORD</span>
                                <input type="password" name="newPassword" value={credentials.newPassword} onChange={updateCredential} autoComplete="new-password" placeholder="Leave blank to keep current password" minLength={10} />
                            </label>
                            <label>
                                <span>CONFIRM NEW PASSWORD</span>
                                <input type="password" name="confirmPassword" value={credentials.confirmPassword} onChange={updateCredential} autoComplete="new-password" placeholder="Repeat new password" minLength={10} />
                            </label>
                        </div>
                        <button type="submit" disabled={working}>SAVE LOGIN CREDENTIALS</button>
                    </form>
                </article>

                <article className="jp-settings-card">
                    <span className="jp-settings-card-label">DISCORD</span>
                    <h2>DISCORD ACCOUNT</h2>
                    {settings.discord_id ? (
                        <>
                            <p>Linked as <strong>{settings.discord_username || settings.discord_id}</strong></p>
                            <button type="button" disabled={working} onClick={unlinkDiscord}>UNLINK DISCORD</button>
                        </>
                    ) : (
                        <>
                            <p>Generate a code, then run <code> /linkpanel code:CODE </code> in the Discord server.</p>
                            <button type="button" disabled={working} onClick={createLinkCode}>GENERATE LINK CODE</button>
                            {linkCode && <div className="jp-link-code">{linkCode}</div>}
                        </>
                    )}
                </article>

                <article className="jp-settings-card">
                    <span className="jp-settings-card-label">ALERTS</span>
                    <h2>DISCORD DM NOTIFICATIONS</h2>
                    <p>Committee notifications are sent exclusively through Discord direct messages. Link your Discord account and allow direct messages from the server.</p>
                    <div className="jp-notification-status">
                        <div><span>DELIVERY METHOD</span><strong>DISCORD DM ONLY</strong></div>
                        <div><span>STATUS</span><strong>{settings.notification_preference === "dm" ? "ENABLED" : "NOT ENABLED"}</strong></div>
                    </div>
                    <button type="button" disabled={working || !settings.discord_id || settings.notification_preference === "dm"} onClick={enableDmNotifications}>
                        {!settings.discord_id ? "LINK DISCORD FIRST" : settings.notification_preference === "dm" ? "DM NOTIFICATIONS ENABLED" : "ENABLE DM NOTIFICATIONS"}
                    </button>
                </article>
            </section>
        </main>
    );
}

export default JPSettings;
