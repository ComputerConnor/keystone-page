import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";
import "./JPSettings.css";

function JPPanelAdmin() {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [panelType, setPanelType] = useState("DGN");
    const [error, setError] = useState("");

    async function request(path, options = {}) {
        const response = await fetch(
            `${API_BASE}/api/jp/panel${path}`,
            {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
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
            const [memberData, userData] = await Promise.all([
                request("/members"),
                request("/users")
            ]);

            setMembers(memberData.members || []);
            setUsers(userData.users || []);
        } catch (loadError) {
            setError(loadError.message);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function addMember(event) {
        event.preventDefault();

        await request("/members", {
            method: "POST",
            body: JSON.stringify({
                userId: Number(userId),
                panelType
            })
        });

        setUserId("");
        await load();
    }

    async function toggle(member, field) {
        const apiNames = {
            is_active: "isActive",
            notify_case_opened: "notifyCaseOpened",
            notify_batch_opened: "notifyBatchOpened",
            notify_voting_opened: "notifyVotingOpened",
            notify_revote_opened: "notifyRevoteOpened",
            notify_case_closed: "notifyCaseClosed"
        };

        await request(`/members/${member.id}`, {
            method: "PATCH",
            body: JSON.stringify({
                [apiNames[field]]: !member[field]
            })
        });

        await load();
    }

    async function remove(member) {
        if (!window.confirm(
            `Remove ${member.username} from ${member.panel_type}?`
        )) return;

        await request(`/members/${member.id}`, {
            method: "DELETE"
        });

        await load();
    }

    return (
        <main className="jp-settings-page">
            <section className="jp-settings-shell">
                <header>
                    <div>
                        <span>KEYSTONE // JP // ADMIN</span>
                        <h1>PANEL MEMBERS</h1>
                    </div>
                    <button onClick={() => navigate("/jp/dashboard")}>
                        DASHBOARD
                    </button>
                </header>

                {error && <div className="jp-settings-error">{error}</div>}

                <article className="jp-settings-card">
                    <form onSubmit={addMember}>
                        <label>
                            <span>JP USER</span>
                            <select
                                value={userId}
                                onChange={event => setUserId(event.target.value)}
                                required
                            >
                                <option value="">Select account</option>
                                {users.map(user => (
                                    <option value={user.id} key={user.id}>
                                        {user.username} ({user.category})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>PANEL</span>
                            <select
                                value={panelType}
                                onChange={event => setPanelType(event.target.value)}
                            >
                                <option value="DGN">DGN</option>
                                <option value="XPLT">XPLT</option>
                            </select>
                        </label>

                        <button type="submit">ADD MEMBER</button>
                    </form>
                </article>

                <div className="jp-admin-member-list">
                    {members.map(member => (
                        <article className="jp-settings-card" key={member.id}>
                            <h2>
                                {member.username} // {member.panel_type}
                            </h2>

                            <p>
                                Discord: {
                                    member.discord_username ||
                                    member.discord_id ||
                                    "Not linked"
                                }
                            </p>

                            {[
                                ["is_active", "Active"],
                                ["notify_case_opened", "Case opened"],
                                ["notify_batch_opened", "Batch opened"],
                                ["notify_voting_opened", "Voting"],
                                ["notify_revote_opened", "Revotes"],
                                ["notify_case_closed", "Case closed"]
                            ].map(([field, label]) => (
                                <label className="jp-toggle" key={field}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(member[field])}
                                        onChange={() => toggle(member, field)}
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}

                            <button onClick={() => remove(member)}>
                                REMOVE FROM PANEL
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default JPPanelAdmin;