import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API_BASE from "../utils/api";

import "./JPCaseQueue.css";
import "./JPWorkspace.css";


const CLOSED_STATUSES =
    new Set([
        "APPROVED",
        "REJECTED",
        "EXPIRED",
        "WITHDRAWN",
        "CLOSED",
        "COMPLETED",
        "ARCHIVED"
    ]);


function JPWorkspaces() {
    const navigate =
        useNavigate();

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        workspaces,
        setWorkspaces
    ] =
        useState([]);

    const [
        filter,
        setFilter
    ] =
        useState("ACTIVE");

    const [
        committeeFilter,
        setCommitteeFilter
    ] =
        useState("ALL");

    const [
        search,
        setSearch
    ] =
        useState("");


    const load =
        useCallback(
            async () => {
                setError("");

                try {
                    const response =
                        await fetch(
                            `${API_BASE}/api/jp/workspaces`,
                            {
                                credentials:
                                    "include"
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Unable to load committee cases."
                        );
                    }

                    setWorkspaces(
                        data.workspaces ||
                        []
                    );
                } catch (loadError) {
                    setError(
                        loadError.message
                    );
                } finally {
                    setLoading(false);
                }
            },
            []
        );


    useEffect(
        () => {
            load();
        },
        [
            load
        ]
    );


    const visible =
        useMemo(
            () =>
                workspaces.filter(
                    item => {
                        const status =
                            String(
                                item.status ||
                                ""
                            )
                                .toUpperCase();

                        const active =
                            !CLOSED_STATUSES.has(
                                status
                            );

                        if (
                            filter ===
                                "ACTIVE" &&
                            !active
                        ) {
                            return false;
                        }

                        if (
                            filter ===
                                "CLOSED" &&
                            active
                        ) {
                            return false;
                        }

                        const committee =
                            item.committee ===
                            "degen"
                                ? "DGN"
                                : "XPLT";

                        if (
                            committeeFilter !==
                                "ALL" &&
                            committee !==
                            committeeFilter
                        ) {
                            return false;
                        }

                        const haystack = [
                            item.id,
                            item.title,
                            item.usernames,
                            item.user_ids,
                            item.committee,
                            item.status
                        ]
                            .filter(
                                Boolean
                            )
                            .join(" ")
                            .toLowerCase();

                        return haystack.includes(
                            search
                                .trim()
                                .toLowerCase()
                        );
                    }
                ),
            [
                workspaces,
                filter,
                committeeFilter,
                search
            ]
        );


    if (loading) {
        return (
            <main className="jp-queue-page">
                <section className="jp-queue-shell">
                    <div className="jp-queue-empty">
                        LOADING COMMITTEE CASES...
                    </div>
                </section>
            </main>
        );
    }


    return (
        <main className="jp-queue-page">
            <section className="jp-queue-shell">
                <header className="jp-queue-header">
                    <div>
                        <span className="jp-queue-label">
                            KEYSTONE // JP // COMMITTEE
                        </span>

                        <h1>
                            CASE WORKSPACES
                        </h1>

                        <p>
                            Open investigations, designated discussion rooms,
                            evidence, deadlines, and anonymous voting.
                        </p>
                    </div>

                    <div className="jp-queue-header-actions">
                        <button
                            className="jp-queue-button"
                            onClick={
                                load
                            }
                        >
                            REFRESH
                        </button>

                        <button
                            className="jp-queue-button"
                            onClick={() =>
                                navigate(
                                    "/jp/dashboard"
                                )
                            }
                        >
                            DASHBOARD
                        </button>
                    </div>
                </header>

                <div className="jp-queue-divider" />

                <div className="jp-queue-toolbar">
                    <input
                        className="jp-queue-search"
                        value={
                            search
                        }
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Search committee cases..."
                    />

                    <select
                        className="jp-queue-filter"
                        value={
                            committeeFilter
                        }
                        onChange={
                            event =>
                                setCommitteeFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            ALL COMMITTEES
                        </option>

                        <option value="DGN">
                            DGN
                        </option>

                        <option value="XPLT">
                            XPLT
                        </option>
                    </select>

                    <select
                        className="jp-queue-filter"
                        value={
                            filter
                        }
                        onChange={
                            event =>
                                setFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ACTIVE">
                            ACTIVE
                        </option>

                        <option value="CLOSED">
                            CLOSED
                        </option>

                        <option value="ALL">
                            ALL
                        </option>
                    </select>
                </div>

                {
                    error && (
                        <div className="jp-case-action-error">
                            {error}
                        </div>
                    )
                }

                <div className="jp-case-list">
                    {
                        visible.map(
                            item => (
                                <button
                                    type="button"
                                    className="jp-case-card jp-workspace-card"
                                    key={
                                        item.id
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/jp/workspaces/${item.id}`
                                        )
                                    }
                                >
                                    <div className="jp-case-card-header">
                                        <div>
                                            <span className="jp-case-type">
                                                {
                                                    item.committee ===
                                                    "degen"
                                                        ? "DGN"
                                                        : "XPLT"
                                                }
                                            </span>

                                            <h2>
                                                CASE #{item.id}
                                            </h2>
                                        </div>

                                        <span className="jp-case-status">
                                            {
                                                item.status
                                            }
                                        </span>
                                    </div>

                                    <div className="jp-case-field">
                                        <span>
                                            TITLE
                                        </span>

                                        <p>
                                            {
                                                item.title ||
                                                "Untitled investigation"
                                            }
                                        </p>
                                    </div>

                                    <div className="jp-case-grid">
                                        <div className="jp-case-field">
                                            <span>
                                                TARGET
                                            </span>

                                            <p>
                                                {
                                                    item.usernames ||
                                                    item.user_ids ||
                                                    "—"
                                                }
                                            </p>
                                        </div>

                                        <div className="jp-case-field">
                                            <span>
                                                DEADLINE
                                            </span>

                                            <p>
                                                {
                                                    item.deadline_at
                                                        ? new Date(
                                                            item.deadline_at
                                                        ).toLocaleString()
                                                        : "—"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )
                        )
                    }
                </div>
            </section>
        </main>
    );
}


export default JPWorkspaces;
