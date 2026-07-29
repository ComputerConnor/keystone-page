import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE from "../utils/api";

import "./JPCaseQueue.css";


function formatDate(value) {

    if (!value) {
        return "Not set";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString();
}


function splitEvidence(value) {

    return String(value || "")
        .split(/[|;\n\r]+/)
        .map(item => item.trim())
        .filter(Boolean);
}


function JPCaseQueue() {

    const navigate =
        useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [cases, setCases] =
        useState([]);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState("ALL");


    const load =
        useCallback(
            async () => {

                setError("");

                try {

                    const authResponse =
                        await fetch(
                            `${API_BASE}/api/jp/me`,
                            {
                                credentials:
                                    "include"
                            }
                        );

                    const authData =
                        await authResponse.json();

                    if (!authResponse.ok) {
                        throw new Error(
                            authData.error ||
                            "Unable to authenticate session."
                        );
                    }

                    const queueResponse =
                        await fetch(
                            `${API_BASE}/api/jp/cases`,
                            {
                                credentials:
                                    "include"
                            }
                        );

                    const queueData =
                        await queueResponse.json();

                    if (!queueResponse.ok) {
                        throw new Error(
                            queueData.error ||
                            "Unable to load cases."
                        );
                    }

                    setCases(
                        Array.isArray(
                            queueData.cases
                        )
                            ? queueData.cases
                            : []
                    );

                } catch (loadError) {

                    console.error(
                        "CASE QUEUE LOAD ERROR:",
                        loadError
                    );

                    setError(
                        loadError.message
                    );

                    if (
                        loadError.message
                            .toLowerCase()
                            .includes("authenticated")
                    ) {
                        navigate("/jp");
                    }

                } finally {

                    setLoading(false);
                }
            },
            [navigate]
        );


    useEffect(() => {
        load();
    }, [load]);


    const visibleCases =
        useMemo(() => {

            const normalizedSearch =
                search.trim().toLowerCase();

            return cases.filter(
                currentCase => {

                    if (
                        typeFilter !== "ALL" &&
                        currentCase.case_type !==
                        typeFilter
                    ) {
                        return false;
                    }

                    if (!normalizedSearch) {
                        return true;
                    }

                    return [
                        currentCase.case_id,
                        currentCase.usernames,
                        currentCase.user_ids,
                        currentCase.type,
                        currentCase.status,
                        currentCase.notes
                    ]
                        .some(
                            value =>
                                String(value || "")
                                    .toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    )
                        );
                }
            );

        }, [cases, search, typeFilter]);


    if (loading) {

        return (
            <main className="jp-case-page">
                <div className="jp-case-shell">
                    <h1>
                        Loading Case Queue...
                    </h1>
                </div>
            </main>
        );
    }


    return (

        <main className="jp-case-page">

            <div className="jp-case-shell">

                <header className="jp-case-header">

                    <div>

                        <span>
                            KEYSTONE // CASE DATABASE
                        </span>

                        <h1>
                            CASE QUEUE
                        </h1>

                        <p>
                            View approved cases from the permanent Keystone databases.
                        </p>

                    </div>

                    <button
                        className="jp-back-button"
                        onClick={() =>
                            navigate("/jp/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </header>


                <div className="jp-divider" />


                <div className="jp-case-toolbar">

                    <input
                        value={search}
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Search case ID, username, user ID, status, or notes..."
                    />

                    <select
                        value={typeFilter}
                        onChange={
                            event =>
                                setTypeFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            All case types
                        </option>
                        <option value="DGN">
                            DGN cases
                        </option>
                        <option value="XPLT">
                            XPLT cases
                        </option>
                    </select>

                    <button
                        onClick={load}
                    >
                        REFRESH
                    </button>

                </div>


                {
                    error && (
                        <div className="jp-case-error">
                            {error}
                        </div>
                    )
                }


                {
                    visibleCases.length === 0 && (
                        <div className="jp-empty">

                            <h2>
                                No Cases Available
                            </h2>

                            <p>
                                Approved cases matching the current filters will appear here.
                            </p>

                        </div>
                    )
                }


                <div className="jp-case-grid">

                    {
                        visibleCases.map(
                            currentCase => {

                                const evidenceItems =
                                    splitEvidence(
                                        currentCase.evidence
                                    );

                                return (

                                    <article
                                        className="jp-case-card"
                                        key={
                                            `${currentCase.case_type}-${currentCase.case_id}`
                                        }
                                    >

                                        <div className="jp-case-card-top">

                                            <div className="jp-case-status">
                                                {
                                                    currentCase.status ||
                                                    "Unknown"
                                                }
                                            </div>

                                            <span>
                                                {
                                                    currentCase.case_type
                                                }
                                                {" // "}
                                                CASE #
                                                {
                                                    currentCase.case_id
                                                }
                                            </span>

                                        </div>


                                        <h2>
                                            {
                                                currentCase.usernames ||
                                                "Unnamed Subject"
                                            }
                                        </h2>


                                        <div className="jp-case-details">

                                            <p>
                                                <strong>
                                                    USER IDS
                                                </strong>
                                                {
                                                    currentCase.user_ids ||
                                                    "Not provided"
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    TYPE
                                                </strong>
                                                {
                                                    currentCase.type ||
                                                    currentCase.case_type
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    STRIKE
                                                </strong>
                                                {
                                                    currentCase.strike ??
                                                    0
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    START DATE
                                                </strong>
                                                {
                                                    formatDate(
                                                        currentCase.start_date
                                                    )
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    END DATE
                                                </strong>
                                                {
                                                    formatDate(
                                                        currentCase.end_date
                                                    )
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    UPDATED
                                                </strong>
                                                {
                                                    formatDate(
                                                        currentCase.updated
                                                    )
                                                }
                                            </p>

                                        </div>


                                        {
                                            currentCase.notes && (
                                                <section className="jp-case-notes">

                                                    <h3>
                                                        NOTES
                                                    </h3>

                                                    <p>
                                                        {
                                                            currentCase.notes
                                                        }
                                                    </p>

                                                </section>
                                            )
                                        }


                                        {
                                            evidenceItems.length > 0 && (
                                                <section className="jp-case-evidence">

                                                    <h3>
                                                        EVIDENCE
                                                    </h3>

                                                    <div>

                                                        {
                                                            evidenceItems.map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => {

                                                                    const isUrl =
                                                                        item.startsWith(
                                                                            "http://"
                                                                        ) ||
                                                                        item.startsWith(
                                                                            "https://"
                                                                        );

                                                                    return isUrl
                                                                        ? (
                                                                            <a
                                                                                key={`${item}-${index}`}
                                                                                href={item}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                            >
                                                                                Evidence {index + 1}
                                                                            </a>
                                                                        )
                                                                        : (
                                                                            <span
                                                                                key={`${item}-${index}`}
                                                                            >
                                                                                {item}
                                                                            </span>
                                                                        );
                                                                }
                                                            )
                                                        }

                                                    </div>

                                                </section>
                                            )
                                        }

                                    </article>

                                );
                            }
                        )
                    }

                </div>

            </div>

        </main>

    );
}


export default JPCaseQueue;
