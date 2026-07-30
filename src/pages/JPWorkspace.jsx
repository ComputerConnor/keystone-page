import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE from "../utils/api";
import "./JPCaseQueue.css";
import "./JPChat.css";
import "./JPWorkspace.css";

function JPWorkspace() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [voting, setVoting] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [voteWorking, setVoteWorking] = useState(false);

    const load = useCallback(async () => {
        try {
            const [caseResponse, messageResponse, votingResponse] = await Promise.all([
                fetch(`${API_BASE}/api/jp/workspaces/${workspaceId}`, { credentials: "include" }),
                fetch(`${API_BASE}/api/jp/workspaces/${workspaceId}/messages`, { credentials: "include" }),
                fetch(`${API_BASE}/api/jp/workspaces/${workspaceId}/voting`, { credentials: "include" })
            ]);
            const caseData = await caseResponse.json();
            const messageData = await messageResponse.json();
            const votingData = await votingResponse.json();
            if (!caseResponse.ok) throw new Error(caseData.error || "Unable to load case.");
            if (!messageResponse.ok) throw new Error(messageData.error || "Unable to load discussion.");
            if (!votingResponse.ok) throw new Error(votingData.error || "Unable to load voting.");
            setData(caseData.workspace);
            setMessages(messageData.messages || []);
            setVoting(votingData.round || null);
            setIsAdmin(Boolean(votingData.isAdmin));
        } catch (loadError) { setError(loadError.message); }
    }, [workspaceId]);

    useEffect(() => { load(); const id = setInterval(load, 3000); return () => clearInterval(id); }, [load]);

    async function send(event) {
        event.preventDefault();
        if (!message.trim() || sending) return;
        setSending(true);
        try {
            const response = await fetch(`${API_BASE}/api/jp/workspaces/${workspaceId}/messages`, {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: message.trim() })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to send message.");
            setMessage("");
            await load();
        } catch (sendError) { setError(sendError.message); } finally { setSending(false); }
    }


    async function votingAction(path, body) {
        setVoteWorking(true);
        setError("");
        try {
            const response = await fetch(`${API_BASE}/api/jp/workspaces/${workspaceId}/voting/${path}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body || {})
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to update voting.");
            await load();
        } catch (voteError) {
            setError(voteError.message);
        } finally {
            setVoteWorking(false);
        }
    }

    if (!data && !error) return <main className="jp-queue-page"><section className="jp-queue-shell"><div className="jp-queue-empty">LOADING CASE WORKSPACE...</div></section></main>;
    if (!data) return <main className="jp-queue-page"><section className="jp-queue-shell"><div className="jp-case-action-error">{error}</div></section></main>;

    return <main className="jp-workspace-page"><header className="jp-chat-header"><div><span className="jp-chat-label">KEYSTONE // JP // {data.committee === "degen" ? "DGN" : "XPLT"}</span><h1 className="jp-chat-title">CASE #{data.id}</h1><p className="jp-chat-description">{data.title || "Committee investigation"}</p></div><div className="jp-chat-actions"><button className="jp-chat-button" onClick={() => navigate("/jp/workspaces")}>CASE LIST</button></div></header>
        {error && <div className="jp-case-action-error">{error}</div>}
        <section className="jp-workspace-layout"><aside className="jp-workspace-sidebar"><span className="jp-case-status">{data.status}</span><h2>OVERVIEW</h2><dl><dt>TARGET</dt><dd>{data.usernames || data.user_ids || "—"}</dd><dt>OPENED</dt><dd>{new Date(data.opened_at).toLocaleString()}</dd><dt>DEADLINE</dt><dd>{new Date(data.deadline_at).toLocaleString()}</dd><dt>ROUND</dt><dd>{data.current_vote_round || 0} / 3</dd></dl><h2>DESCRIPTION</h2><p>{data.description || "No description."}</p><h2>EVIDENCE</h2><p className="jp-break-text">{data.evidence || "No evidence listed."}</p>
        <h2>VOTING</h2>
        {!voting && <p>No voting round is open.</p>}
        {voting && <div className="jp-voting-box"><strong>ROUND {voting.round_number} // {voting.status}</strong><span>{voting.votes_cast || 0} VOTES CAST</span>{voting.my_vote && <span>YOUR VOTE: {String(voting.my_vote).toUpperCase()}</span>}
        {voting.status === "open" && <div className="jp-vote-actions"><button disabled={voteWorking} onClick={() => votingAction("vote", { choice: "approve" })}>APPROVE</button><button disabled={voteWorking} onClick={() => votingAction("vote", { choice: "reject" })}>REJECT</button><button disabled={voteWorking} onClick={() => votingAction("vote", { choice: "abstain" })}>ABSTAIN</button></div>}
        {voting.status === "closed" && <span>RESULT: {String(voting.result || "pending").toUpperCase()}</span>}</div>}
        {isAdmin && !voting?.status?.includes("open") && !["approved","rejected","expired","withdrawn"].includes(data.status) && <button className="jp-workspace-admin-button" disabled={voteWorking} onClick={() => votingAction("start")}>START VOTING</button>}
        {isAdmin && voting?.status === "open" && <button className="jp-workspace-admin-button" disabled={voteWorking} onClick={() => votingAction("close")}>CLOSE ROUND</button>}
        </aside>
        <section className="jp-chat-panel"><div className="jp-chat-privacy-notice">Case-specific identity masking is active. Aliases change between cases.</div><div className="jp-chat-messages">{messages.map(item => <article className="jp-chat-message" key={item.id}><div className="jp-chat-message-meta"><strong>{item.username}</strong><time>{new Date(item.createdAt).toLocaleString()}</time></div>{item.realUsername && <div className="jp-chat-admin-identity">ADMIN VIEW // REAL IDENTITY: {item.realUsername}</div>}<div className="jp-chat-message-text">{item.message}</div></article>)}</div><form className="jp-chat-composer" onSubmit={send}><input className="jp-chat-input" value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} placeholder="Message this case anonymously..." /><button className="jp-chat-send" disabled={sending || !message.trim()}>{sending ? "SENDING..." : "SEND"}</button></form></section></section>
    </main>;
}
export default JPWorkspace;
