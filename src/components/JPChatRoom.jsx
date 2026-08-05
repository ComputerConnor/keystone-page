import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";
import "../pages/JPChat.css";

const ROOM_ORDER = {
    general: 0,
    off_topic: 1,
    announcements: 2,
    case: 3
};

function dateLabel(value) {
    const date = new Date(value);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === now.toDateString()) return "TODAY";
    if (date.toDateString() === yesterday.toDateString()) return "YESTERDAY";

    return date.toLocaleDateString([], {
        month: "long",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    }).toUpperCase();
}

function grouped(previous, current) {
    if (!previous || previous.username !== current.username) return false;

    const delta =
        new Date(current.createdAt).getTime() -
        new Date(previous.createdAt).getTime();

    return delta >= 0 && delta < 5 * 60 * 1000;
}

function roomTitle(room) {
    return room?.name || (room?.caseId ? `Case #${room.caseId}` : "Room");
}

function JPChatRoom({
    room,
    title,
    description,
    allowedCategories
}) {
    const navigate = useNavigate();
    const bottomRef = useRef(null);

    const committee = room === "exploit" ? "exploit" : "degen";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [roomLoading, setRoomLoading] = useState(false);
    const [restriction, setRestriction] = useState("");

    const selectedRoom = useMemo(
        () => rooms.find(item => String(item.id) === String(selectedRoomId)) || null,
        [rooms, selectedRoomId]
    );

    const permanentRooms = useMemo(
        () => rooms
            .filter(item => item.roomType !== "case")
            .sort((a, b) => (ROOM_ORDER[a.roomType] ?? 99) - (ROOM_ORDER[b.roomType] ?? 99)),
        [rooms]
    );

    const activeCases = useMemo(
        () => rooms
            .filter(item => item.roomType === "case" && !item.isArchived)
            .sort((a, b) => Number(b.caseId || 0) - Number(a.caseId || 0)),
        [rooms]
    );

    const archivedCases = useMemo(
        () => rooms
            .filter(item => item.roomType === "case" && item.isArchived)
            .sort((a, b) => Number(b.caseId || 0) - Number(a.caseId || 0)),
        [rooms]
    );

    const loadRooms = useCallback(async ({ reset = false } = {}) => {
        const response = await fetch(
            `${API_BASE}/api/jp/chat/rooms?committee=${committee}`,
            { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load chat rooms.");
        }

        const nextRooms = data.rooms || [];
        setRooms(nextRooms);

        setSelectedRoomId(current => {
            if (!reset && current && nextRooms.some(item => String(item.id) === String(current))) {
                return current;
            }

            return nextRooms.find(item => item.roomType === "general")?.id || nextRooms[0]?.id || null;
        });
    }, [committee]);

    const loadMessages = useCallback(async (roomId, quiet = false) => {
        if (!roomId) {
            setMessages([]);
            return;
        }

        if (!quiet) setRoomLoading(true);

        try {
            const response = await fetch(
                `${API_BASE}/api/jp/chat/rooms/${roomId}/messages`,
                { credentials: "include" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to load messages.");
            }

            setMessages(data.messages || []);
            setRestriction("");
        } catch (loadError) {
            console.error("JP CHAT FETCH ERROR:", loadError);
            setRestriction(loadError.message);
        } finally {
            if (!quiet) setRoomLoading(false);
        }
    }, []);

    useEffect(() => {
        let roomsTimer = null;

        async function initialize() {
            try {
                const response = await fetch(`${API_BASE}/api/jp/me`, {
                    credentials: "include"
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Access denied.");
                }

                const category = String(data.user.category || "").trim().toLowerCase();

                if (!allowedCategories.includes(category) && category !== "admin") {
                    throw new Error("You do not have access to this committee workspace.");
                }

                setUser(data.user);
                await loadRooms({ reset: true });

                roomsTimer = setInterval(() => {
                    loadRooms().catch(refreshError => {
                        console.error("JP CHAT ROOM REFRESH ERROR:", refreshError);
                    });
                }, 10000);
            } catch (initializeError) {
                console.error("JP CHAT INITIALIZE ERROR:", initializeError);
                setError(initializeError.message);
            } finally {
                setLoading(false);
            }
        }

        initialize();

        return () => {
            if (roomsTimer) clearInterval(roomsTimer);
        };
    }, [allowedCategories, loadRooms]);

    useEffect(() => {
        if (!selectedRoomId) return undefined;

        loadMessages(selectedRoomId);

        const timer = setInterval(() => {
            loadMessages(selectedRoomId, true);
        }, 3000);

        return () => clearInterval(timer);
    }, [loadMessages, selectedRoomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    async function sendMessage(event) {
        event.preventDefault();

        const trimmed = message.trim();

        if (!trimmed || sending || !selectedRoomId || selectedRoom?.isReadOnly) return;

        setSending(true);
        setRestriction("");

        try {
            const response = await fetch(
                `${API_BASE}/api/jp/chat/rooms/${selectedRoomId}/messages`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: trimmed })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to send message.");
            }

            setMessages(current => {
                if (current.some(item => String(item.id) === String(data.message.id))) return current;
                return [...current, data.message];
            });

            setMessage("");
        } catch (sendError) {
            console.error("JP CHAT SEND ERROR:", sendError);
            setRestriction(sendError.message);
        } finally {
            setSending(false);
        }
    }

    function roomButton(item) {
        const active = String(item.id) === String(selectedRoomId);

        return (
            <button
                type="button"
                className={active ? "jp-chat-room-button is-active" : "jp-chat-room-button"}
                key={item.id}
                onClick={() => setSelectedRoomId(item.id)}
            >
                <span className="jp-chat-room-symbol">{item.isReadOnly ? "⌁" : "#"}</span>

                <span className="jp-chat-room-copy">
                    <strong>{roomTitle(item)}</strong>
                    {item.description && <small>{item.description}</small>}
                </span>
            </button>
        );
    }

    if (loading) {
        return (
            <main className="jp-chat-page">
                <div className="jp-chat-loading">AUTHENTICATING WORKSPACE ACCESS...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="jp-chat-page">
                <div className="jp-chat-loading">
                    <h1 className="jp-chat-title">ACCESS DENIED</h1>
                    <p className="jp-chat-description">{error}</p>
                    <button className="jp-chat-button" onClick={() => navigate("/jp/dashboard")}>RETURN TO DASHBOARD</button>
                </div>
            </main>
        );
    }

    return (
        <main className="jp-chat-page">
            <header className="jp-chat-header">
                <div className="jp-chat-header-left">
                    <span className="jp-chat-label">KEYSTONE // JP // PRIVATE</span>
                    <h1 className="jp-chat-title">{title}</h1>
                    <p className="jp-chat-description">{description}</p>
                </div>

                <div className="jp-chat-actions">
                    <button className="jp-chat-button" onClick={() => navigate("/jp/dashboard")}>DASHBOARD</button>
                </div>
            </header>

            <section className="jp-chat-workspace">
                <aside className="jp-chat-sidebar">
                    <div className="jp-chat-sidebar-header">
                        <span>{committee === "degen" ? "DGN COMMITTEE" : "XPLT COMMITTEE"}</span>
                        <small>{user?.category === "admin" ? "ADMIN ACCESS" : "MASKED ACCESS"}</small>
                    </div>

                    <div className="jp-chat-room-section">
                        <span className="jp-chat-room-section-title">COMMITTEE ROOMS</span>
                        {permanentRooms.map(roomButton)}
                    </div>

                    <div className="jp-chat-room-section">
                        <span className="jp-chat-room-section-title">ACTIVE CASES</span>
                        {activeCases.length ? activeCases.map(roomButton) : <div className="jp-chat-room-empty">No open case rooms.</div>}
                    </div>

                    {archivedCases.length > 0 && (
                        <div className="jp-chat-room-section">
                            <span className="jp-chat-room-section-title">ARCHIVED</span>
                            {archivedCases.map(roomButton)}
                        </div>
                    )}
                </aside>

                <section className="jp-chat-panel">
                    <div className="jp-chat-channel-header">
                        <div>
                            <span>{selectedRoom?.roomType === "case" ? `CASE #${selectedRoom.caseId}` : "COMMITTEE CHANNEL"}</span>
                            <h2>{selectedRoom ? roomTitle(selectedRoom) : "SELECT A ROOM"}</h2>
                        </div>

                        {selectedRoom?.isReadOnly && <strong>READ ONLY</strong>}
                    </div>

                    <div className="jp-chat-privacy-notice">
                        Identity masking is active. Do not share names, contact details, locations, account handles, or other identifying information.
                    </div>

                    <div className="jp-chat-messages">
                        {roomLoading && <div className="jp-chat-room-loading">LOADING CONVERSATION...</div>}
                        {!roomLoading && messages.length === 0 && <article className="jp-chat-empty-message">This room is online. Start the conversation.</article>}

                        {messages.map((current, index) => {
                            const previous = messages[index - 1];
                            const isGrouped = grouped(previous, current);
                            const currentLabel = dateLabel(current.createdAt);
                            const previousLabel = previous ? dateLabel(previous.createdAt) : null;

                            return (
                                <div key={current.id}>
                                    {(!previous || currentLabel !== previousLabel) && (
                                        <div className="jp-chat-date-divider"><span>{currentLabel}</span></div>
                                    )}

                                    <article className={isGrouped ? "jp-chat-message is-grouped" : "jp-chat-message"}>
                                        {!isGrouped && (
                                            <div className="jp-chat-message-meta">
                                                <strong>{current.username}</strong>
                                                <time dateTime={current.createdAt}>
                                                    {new Date(current.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </time>
                                            </div>
                                        )}

                                        {current.realUsername && (
                                            <div className="jp-chat-admin-identity">ADMIN VIEW // REAL IDENTITY: {current.realUsername}</div>
                                        )}

                                        <div className="jp-chat-message-text">{current.message}</div>
                                    </article>
                                </div>
                            );
                        })}

                        <div ref={bottomRef} />
                    </div>

                    {restriction && <div className="jp-chat-restriction">{restriction}</div>}

                    <form className="jp-chat-composer" onSubmit={sendMessage}>
                        <div className="jp-chat-emoji-row">
                            {["👍", "✅", "⚠️", "👀", "📌", "🗳️"].map(emoji => (
                                <button
                                    type="button"
                                    key={emoji}
                                    disabled={selectedRoom?.isReadOnly}
                                    onClick={() => setMessage(value => `${value}${emoji}`)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <div className="jp-chat-composer-row">
                            <textarea
                                className="jp-chat-input"
                                value={message}
                                onChange={event => {
                                    setMessage(event.target.value);
                                    setRestriction("");
                                }}
                                onKeyDown={event => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                }}
                                placeholder={selectedRoom?.isReadOnly ? "This room has been archived." : "Message anonymously..."}
                                maxLength={2000}
                                disabled={sending || !selectedRoom || selectedRoom.isReadOnly}
                            />

                            <button
                                className="jp-chat-send"
                                type="submit"
                                disabled={sending || !message.trim() || !selectedRoom || selectedRoom.isReadOnly}
                            >
                                {sending ? "SENDING..." : "SEND"}
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="jp-chat-details">
                    <span className="jp-chat-details-label">ROOM DETAILS</span>
                    <h2>{selectedRoom ? roomTitle(selectedRoom) : "No room selected"}</h2>
                    <p>{selectedRoom?.description || "Choose a room from the channel list."}</p>

                    {selectedRoom?.roomType === "case" && (
                        <div className="jp-chat-case-details">
                            <div><span>CASE</span><strong>#{selectedRoom.caseId}</strong></div>
                            <div><span>STATUS</span><strong>{selectedRoom.isArchived ? "ARCHIVED" : "OPEN"}</strong></div>
                            <div><span>CHAT</span><strong>{selectedRoom.isReadOnly ? "READ ONLY" : "ACTIVE"}</strong></div>
                        </div>
                    )}

                    <div className="jp-chat-details-notice">
                        Case-room transcripts remain available after a case closes. Archived rooms cannot receive new messages.
                    </div>
                </aside>
            </section>
        </main>
    );
}

export default JPChatRoom;
