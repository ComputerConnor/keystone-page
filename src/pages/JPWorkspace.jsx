import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import API_BASE from "../utils/api";

import "./JPCaseQueue.css";
import "./JPChat.css";
import "./JPWorkspace.css";


const CLOSED_STATUSES =
    new Set([
        "approved",
        "rejected",
        "expired",
        "withdrawn",
        "closed",
        "completed",
        "archived"
    ]);


function formatDateLabel(value) {
    const date =
        new Date(value);

    const now =
        new Date();

    if (
        date.toDateString() ===
        now.toDateString()
    ) {
        return "TODAY";
    }

    const yesterday =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
        );

    if (
        date.toDateString() ===
        yesterday.toDateString()
    ) {
        return "YESTERDAY";
    }

    return date
        .toLocaleDateString(
            [],
            {
                month:
                    "long",

                day:
                    "numeric",

                year:
                    date.getFullYear() !==
                    now.getFullYear()
                        ? "numeric"
                        : undefined
            }
        )
        .toUpperCase();
}


function formatRemainingTime(value) {
    if (!value) {
        return "NO DEADLINE";
    }

    const remaining =
        new Date(value).getTime() -
        Date.now();

    if (remaining <= 0) {
        return "DEADLINE PASSED";
    }

    const totalHours =
        Math.floor(
            remaining /
            (1000 * 60 * 60)
        );

    const days =
        Math.floor(
            totalHours /
            24
        );

    const hours =
        totalHours %
        24;

    if (days > 0) {
        return `${days}D ${hours}H REMAINING`;
    }

    return `${hours}H REMAINING`;
}


function areGrouped(
    previous,
    current
) {
    if (
        !previous ||
        previous.username !==
        current.username
    ) {
        return false;
    }

    const difference =
        new Date(
            current.createdAt
        ).getTime() -
        new Date(
            previous.createdAt
        ).getTime();

    return (
        difference >= 0 &&
        difference <
        5 * 60 * 1000
    );
}


function JPWorkspace() {
    const {
        workspaceId
    } =
        useParams();

    const navigate =
        useNavigate();

    const messagesEndRef =
        useRef(null);

    const [
        data,
        setData
    ] =
        useState(null);

    const [
        room,
        setRoom
    ] =
        useState(null);

    const [
        messages,
        setMessages
    ] =
        useState([]);

    const [
        message,
        setMessage
    ] =
        useState("");

    const [
        error,
        setError
    ] =
        useState("");

    const [
        sending,
        setSending
    ] =
        useState(false);

    const [
        voting,
        setVoting
    ] =
        useState(null);

    const [
        isAdmin,
        setIsAdmin
    ] =
        useState(false);

    const [
        voteWorking,
        setVoteWorking
    ] =
        useState(false);

    const [
        loading,
        setLoading
    ] =
        useState(true);


    const committee =
        data?.committee ===
        "degen"
            ? "degen"
            : "exploit";


    const closed =
        CLOSED_STATUSES.has(
            String(
                data?.status ||
                ""
            )
                .trim()
                .toLowerCase()
        );


    const deadlineText =
        useMemo(
            () =>
                formatRemainingTime(
                    data?.deadline_at
                ),
            [
                data?.deadline_at
            ]
        );


    const loadWorkspace =
        useCallback(
            async () => {
                const [
                    caseResponse,
                    votingResponse
                ] =
                    await Promise.all([
                        fetch(
                            `${API_BASE}/api/jp/workspaces/${workspaceId}`,
                            {
                                credentials:
                                    "include"
                            }
                        ),

                        fetch(
                            `${API_BASE}/api/jp/workspaces/${workspaceId}/voting`,
                            {
                                credentials:
                                    "include"
                            }
                        )
                    ]);

                const caseData =
                    await caseResponse.json();

                const votingData =
                    await votingResponse.json();

                if (!caseResponse.ok) {
                    throw new Error(
                        caseData.error ||
                        "Unable to load case."
                    );
                }

                if (!votingResponse.ok) {
                    throw new Error(
                        votingData.error ||
                        "Unable to load voting."
                    );
                }

                setData(
                    caseData.workspace
                );

                setVoting(
                    votingData.round ||
                    null
                );

                setIsAdmin(
                    Boolean(
                        votingData.isAdmin
                    )
                );

                return caseData.workspace;
            },
            [
                workspaceId
            ]
        );


    const loadRoom =
        useCallback(
            async (
                workspace
            ) => {
                const targetCommittee =
                    workspace.committee ===
                    "degen"
                        ? "degen"
                        : "exploit";

                const roomResponse =
                    await fetch(
                        `${API_BASE}/api/jp/chat/rooms?committee=${targetCommittee}`,
                        {
                            credentials:
                                "include"
                        }
                    );

                const roomData =
                    await roomResponse.json();

                if (!roomResponse.ok) {
                    throw new Error(
                        roomData.error ||
                        "Unable to load the case chat room."
                    );
                }

                const caseRoom =
                    (
                        roomData.rooms ||
                        []
                    )
                        .find(
                            currentRoom =>
                                currentRoom.roomType ===
                                    "case" &&
                                String(
                                    currentRoom.caseId
                                ) ===
                                String(
                                    workspaceId
                                )
                        );

                if (!caseRoom) {
                    throw new Error(
                        "The designated case chat room could not be found."
                    );
                }

                setRoom(
                    caseRoom
                );

                return caseRoom;
            },
            [
                workspaceId
            ]
        );


    const loadMessages =
        useCallback(
            async (
                targetRoom
            ) => {
                if (!targetRoom?.id) {
                    return;
                }

                const messageResponse =
                    await fetch(
                        `${API_BASE}/api/jp/chat/rooms/${targetRoom.id}/messages`,
                        {
                            credentials:
                                "include"
                        }
                    );

                const messageData =
                    await messageResponse.json();

                if (!messageResponse.ok) {
                    throw new Error(
                        messageData.error ||
                        "Unable to load discussion."
                    );
                }

                setMessages(
                    messageData.messages ||
                    []
                );
            },
            []
        );


    const load =
        useCallback(
            async ({
                quiet = false
            } = {}) => {
                if (!quiet) {
                    setError("");
                }

                try {
                    const workspace =
                        await loadWorkspace();

                    const targetRoom =
                        await loadRoom(
                            workspace
                        );

                    await loadMessages(
                        targetRoom
                    );
                } catch (loadError) {
                    setError(
                        loadError.message
                    );
                } finally {
                    if (!quiet) {
                        setLoading(false);
                    }
                }
            },
            [
                loadMessages,
                loadRoom,
                loadWorkspace
            ]
        );


    useEffect(
        () => {
            load();

            const intervalId =
                setInterval(
                    () =>
                        load({
                            quiet: true
                        }),
                    3000
                );

            return () =>
                clearInterval(
                    intervalId
                );
        },
        [
            load
        ]
    );


    useEffect(
        () => {
            messagesEndRef.current
                ?.scrollIntoView({
                    behavior:
                        "smooth"
                });
        },
        [
            messages.length
        ]
    );


    function insertEmoji(emoji) {
        setMessage(
            current =>
                `${current}${emoji}`
        );
    }


    async function send(event) {
        event.preventDefault();

        const trimmed =
            message.trim();

        if (
            !trimmed ||
            sending ||
            !room?.id ||
            room.isReadOnly
        ) {
            return;
        }

        setSending(true);
        setError("");

        try {
            const response =
                await fetch(
                    `${API_BASE}/api/jp/chat/rooms/${room.id}/messages`,
                    {
                        method:
                            "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                message:
                                    trimmed
                            })
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Unable to send message."
                );
            }

            setMessages(
                currentMessages => [
                    ...currentMessages,
                    result.message
                ]
            );

            setMessage("");
        } catch (sendError) {
            setError(
                sendError.message
            );
        } finally {
            setSending(false);
        }
    }


    async function votingAction(
        path,
        body
    ) {
        setVoteWorking(true);
        setError("");

        try {
            const response =
                await fetch(
                    `${API_BASE}/api/jp/workspaces/${workspaceId}/voting/${path}`,
                    {
                        method:
                            "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                body ||
                                {}
                            )
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Unable to update voting."
                );
            }

            await load();
        } catch (voteError) {
            setError(
                voteError.message
            );
        } finally {
            setVoteWorking(false);
        }
    }


    if (loading) {
        return (
            <main className="jp-queue-page">
                <section className="jp-queue-shell">
                    <div className="jp-queue-empty">
                        LOADING CASE WORKSPACE...
                    </div>
                </section>
            </main>
        );
    }


    if (!data) {
        return (
            <main className="jp-queue-page">
                <section className="jp-queue-shell">
                    <div className="jp-case-action-error">
                        {
                            error ||
                            "Unable to load this workspace."
                        }
                    </div>
                </section>
            </main>
        );
    }


    return (
        <main className="jp-workspace-page">
            <header className="jp-chat-header">
                <div>
                    <span className="jp-chat-label">
                        KEYSTONE // JP // {
                            committee ===
                            "degen"
                                ? "DGN"
                                : "XPLT"
                        }
                    </span>

                    <h1 className="jp-chat-title">
                        CASE #{data.id}
                    </h1>

                    <p className="jp-chat-description">
                        {
                            data.title ||
                            "Committee investigation"
                        }
                    </p>
                </div>

                <div className="jp-chat-actions">
                    <button
                        className="jp-chat-button"
                        onClick={() =>
                            navigate(
                                committee ===
                                "degen"
                                    ? "/jp/chat/degen"
                                    : "/jp/chat/exploit"
                            )
                        }
                    >
                        COMMITTEE CHAT
                    </button>

                    <button
                        className="jp-chat-button"
                        onClick={() =>
                            navigate(
                                "/jp/workspaces"
                            )
                        }
                    >
                        CASE LIST
                    </button>
                </div>
            </header>

            {
                error && (
                    <div className="jp-case-action-error">
                        {error}
                    </div>
                )
            }

            <section className="jp-workspace-layout">
                <aside className="jp-workspace-sidebar">
                    <div className="jp-workspace-status-row">
                        <span className="jp-case-status">
                            {
                                data.status
                            }
                        </span>

                        <span
                            className={
                                closed
                                    ? "jp-workspace-deadline is-closed"
                                    : "jp-workspace-deadline"
                            }
                        >
                            {
                                closed
                                    ? "CASE CLOSED"
                                    : deadlineText
                            }
                        </span>
                    </div>

                    <section className="jp-workspace-section">
                        <h2>
                            OVERVIEW
                        </h2>

                        <dl>
                            <div>
                                <dt>
                                    TARGET
                                </dt>

                                <dd>
                                    {
                                        data.usernames ||
                                        data.user_ids ||
                                        "—"
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    OPENED
                                </dt>

                                <dd>
                                    {
                                        data.opened_at
                                            ? new Date(
                                                data.opened_at
                                            ).toLocaleString()
                                            : "—"
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    DEADLINE
                                </dt>

                                <dd>
                                    {
                                        data.deadline_at
                                            ? new Date(
                                                data.deadline_at
                                            ).toLocaleString()
                                            : "—"
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    ROUND
                                </dt>

                                <dd>
                                    {
                                        data.current_vote_round ||
                                        0
                                    } / 3
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="jp-workspace-section">
                        <h2>
                            DESCRIPTION
                        </h2>

                        <p>
                            {
                                data.description ||
                                "No description."
                            }
                        </p>
                    </section>

                    <section className="jp-workspace-section">
                        <h2>
                            EVIDENCE
                        </h2>

                        <p className="jp-break-text">
                            {
                                data.evidence ||
                                "No evidence listed."
                            }
                        </p>
                    </section>

                    <section className="jp-workspace-section">
                        <h2>
                            VOTING
                        </h2>

                        {
                            !voting && (
                                <p>
                                    No voting round is open.
                                </p>
                            )
                        }

                        {
                            voting && (
                                <div className="jp-voting-box">
                                    <div className="jp-voting-heading">
                                        <strong>
                                            ROUND {
                                                voting.round_number
                                            }
                                        </strong>

                                        <span>
                                            {
                                                String(
                                                    voting.status
                                                ).toUpperCase()
                                            }
                                        </span>
                                    </div>

                                    <span>
                                        {
                                            voting.votes_cast ||
                                            0
                                        } VOTES CAST
                                    </span>

                                    {
                                        voting.my_vote && (
                                            <span>
                                                YOUR VOTE: {
                                                    String(
                                                        voting.my_vote
                                                    ).toUpperCase()
                                                }
                                            </span>
                                        )
                                    }

                                    {
                                        voting.status ===
                                        "open" && (
                                            <div className="jp-vote-actions">
                                                <button
                                                    disabled={
                                                        voteWorking
                                                    }
                                                    onClick={() =>
                                                        votingAction(
                                                            "vote",
                                                            {
                                                                choice:
                                                                    "approve"
                                                            }
                                                        )
                                                    }
                                                >
                                                    APPROVE
                                                </button>

                                                <button
                                                    disabled={
                                                        voteWorking
                                                    }
                                                    onClick={() =>
                                                        votingAction(
                                                            "vote",
                                                            {
                                                                choice:
                                                                    "reject"
                                                            }
                                                        )
                                                    }
                                                >
                                                    REJECT
                                                </button>

                                                <button
                                                    disabled={
                                                        voteWorking
                                                    }
                                                    onClick={() =>
                                                        votingAction(
                                                            "vote",
                                                            {
                                                                choice:
                                                                    "abstain"
                                                            }
                                                        )
                                                    }
                                                >
                                                    ABSTAIN
                                                </button>
                                            </div>
                                        )
                                    }

                                    {
                                        voting.status ===
                                        "closed" && (
                                            <span>
                                                RESULT: {
                                                    String(
                                                        voting.result ||
                                                        "pending"
                                                    ).toUpperCase()
                                                }
                                            </span>
                                        )
                                    }
                                </div>
                            )
                        }

                        {
                            isAdmin &&
                            voting?.status !==
                                "open" &&
                            !closed && (
                                <button
                                    className="jp-workspace-admin-button"
                                    disabled={
                                        voteWorking
                                    }
                                    onClick={() =>
                                        votingAction(
                                            "start"
                                        )
                                    }
                                >
                                    {
                                        Number(
                                            data.current_vote_round ||
                                            0
                                        ) > 0
                                            ? "START REVOTE"
                                            : "START VOTING"
                                    }
                                </button>
                            )
                        }

                        {
                            isAdmin &&
                            voting?.status ===
                                "open" && (
                                <button
                                    className="jp-workspace-admin-button"
                                    disabled={
                                        voteWorking
                                    }
                                    onClick={() =>
                                        votingAction(
                                            "close"
                                        )
                                    }
                                >
                                    CLOSE ROUND
                                </button>
                            )
                        }
                    </section>
                </aside>

                <section className="jp-chat-panel jp-workspace-chat-panel">
                    <div className="jp-chat-channel-header">
                        <div>
                            <span>
                                DESIGNATED CASE ROOM
                            </span>

                            <h2>
                                {
                                    room?.name ||
                                    `Case #${data.id}`
                                }
                            </h2>
                        </div>

                        {
                            room?.isReadOnly && (
                                <strong>
                                    READ ONLY
                                </strong>
                            )
                        }
                    </div>

                    <div className="jp-chat-privacy-notice">
                        This is the same room shown in the {
                            committee ===
                            "degen"
                                ? "DGN"
                                : "XPLT"
                        } committee chat. Case-specific aliases remain
                        consistent in both views.
                    </div>

                    <div className="jp-chat-messages">
                        {
                            messages.length ===
                            0 && (
                                <div className="jp-chat-empty-message">
                                    No discussion has been posted yet.
                                </div>
                            )
                        }

                        {
                            messages.map(
                                (
                                    item,
                                    index
                                ) => {
                                    const previous =
                                        messages[
                                            index - 1
                                        ];

                                    const grouped =
                                        areGrouped(
                                            previous,
                                            item
                                        );

                                    const dateLabel =
                                        formatDateLabel(
                                            item.createdAt
                                        );

                                    const previousDateLabel =
                                        previous
                                            ? formatDateLabel(
                                                previous.createdAt
                                            )
                                            : null;

                                    return (
                                        <div
                                            key={
                                                item.id
                                            }
                                        >
                                            {
                                                (
                                                    !previous ||
                                                    dateLabel !==
                                                    previousDateLabel
                                                ) && (
                                                    <div className="jp-chat-date-divider">
                                                        <span>
                                                            {
                                                                dateLabel
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            }

                                            <article
                                                className={
                                                    grouped
                                                        ? "jp-chat-message is-grouped"
                                                        : "jp-chat-message"
                                                }
                                            >
                                                {
                                                    !grouped && (
                                                        <div className="jp-chat-message-meta">
                                                            <strong>
                                                                {
                                                                    item.username
                                                                }
                                                            </strong>

                                                            <time>
                                                                {
                                                                    new Date(
                                                                        item.createdAt
                                                                    )
                                                                        .toLocaleTimeString(
                                                                            [],
                                                                            {
                                                                                hour:
                                                                                    "2-digit",
                                                                                minute:
                                                                                    "2-digit"
                                                                            }
                                                                        )
                                                                }
                                                            </time>
                                                        </div>
                                                    )
                                                }

                                                {
                                                    item.realUsername && (
                                                        <div className="jp-chat-admin-identity">
                                                            ADMIN VIEW // REAL IDENTITY: {
                                                                item.realUsername
                                                            }
                                                        </div>
                                                    )
                                                }

                                                <div className="jp-chat-message-text">
                                                    {
                                                        item.message
                                                    }
                                                </div>
                                            </article>
                                        </div>
                                    );
                                }
                            )
                        }

                        <div
                            ref={
                                messagesEndRef
                            }
                        />
                    </div>

                    <form
                        className="jp-chat-composer"
                        onSubmit={
                            send
                        }
                    >
                        <div className="jp-chat-emoji-row">
                            {
                                [
                                    "👍",
                                    "✅",
                                    "⚠️",
                                    "👀",
                                    "📌",
                                    "🗳️"
                                ].map(
                                    emoji => (
                                        <button
                                            type="button"
                                            key={
                                                emoji
                                            }
                                            onClick={() =>
                                                insertEmoji(
                                                    emoji
                                                )
                                            }
                                            disabled={
                                                room?.isReadOnly
                                            }
                                        >
                                            {emoji}
                                        </button>
                                    )
                                )
                            }
                        </div>

                        <div className="jp-chat-composer-row">
                            <textarea
                                className="jp-chat-input"
                                value={
                                    message
                                }
                                onChange={
                                    event =>
                                        setMessage(
                                            event.target.value
                                        )
                                }
                                onKeyDown={
                                    event => {
                                        if (
                                            event.key ===
                                                "Enter" &&
                                            !event.shiftKey
                                        ) {
                                            event.preventDefault();

                                            event.currentTarget
                                                .form
                                                ?.requestSubmit();
                                        }
                                    }
                                }
                                maxLength={
                                    2000
                                }
                                placeholder={
                                    room?.isReadOnly
                                        ? "This case room is archived."
                                        : "Message this case anonymously..."
                                }
                                disabled={
                                    sending ||
                                    !room ||
                                    room.isReadOnly
                                }
                            />

                            <button
                                className="jp-chat-send"
                                disabled={
                                    sending ||
                                    !message.trim() ||
                                    !room ||
                                    room.isReadOnly
                                }
                            >
                                {
                                    sending
                                        ? "SENDING..."
                                        : "SEND"
                                }
                            </button>
                        </div>
                    </form>
                </section>
            </section>
        </main>
    );
}


export default JPWorkspace;
