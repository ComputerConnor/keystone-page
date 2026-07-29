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

import "./JPSubmissionQueue.css";


function formatDate(value) {
    if (!value) {
        return "Not provided";
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

    return date.toLocaleString(
        [],
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function JPSubmissionQueue() {
    const navigate =
        useNavigate();

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        cases,
        setCases
    ] =
        useState([]);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        workingId,
        setWorkingId
    ] =
        useState(null);

    const [
        returnReasons,
        setReturnReasons
    ] =
        useState({});

    const [
        search,
        setSearch
    ] =
        useState("");

    const [
        typeFilter,
        setTypeFilter
    ] =
        useState("ALL");

    const [
        statusFilter,
        setStatusFilter
    ] =
        useState("ALL");


    const load =
        useCallback(
            async () => {
                setError("");
                setLoading(true);

                try {
                    const response =
                        await fetch(
                            `${API_BASE}/api/jp/me`,
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
                            "Unable to authenticate session."
                        );
                    }

                    if (
                        String(
                            data.user.category || ""
                        ).toUpperCase() !== "ADMIN"
                    ) {
                        navigate("/jp/dashboard");
                        return;
                    }

                    const queueResponse =
                        await fetch(
                            `${API_BASE}/api/jp/submissions`,
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
                            "Unable to load submissions."
                        );
                    }

                    setCases(
                        Array.isArray(
                            queueData.submissions
                        )
                            ? queueData.submissions
                            : []
                    );
                } catch (loadError) {
                    console.error(
                        "SUBMISSION QUEUE LOAD ERROR:",
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


    useEffect(
        () => {
            load();
        },
        [load]
    );


    const availableTypes =
        useMemo(
            () => {
                return [
                    ...new Set(
                        cases
                            .map(
                                submission =>
                                    String(
                                        submission.case_type ||
                                        ""
                                    )
                                        .trim()
                                        .toUpperCase()
                            )
                            .filter(Boolean)
                    )
                ].sort();
            },
            [cases]
        );


    const filteredCases =
        useMemo(
            () => {
                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase();

                return cases.filter(
                    submission => {
                        const caseType =
                            String(
                                submission.case_type ||
                                ""
                            )
                                .trim()
                                .toUpperCase();

                        const status =
                            String(
                                submission.status ||
                                "PENDING"
                            )
                                .trim()
                                .toUpperCase();

                        if (
                            typeFilter !== "ALL" &&
                            caseType !== typeFilter
                        ) {
                            return false;
                        }

                        if (
                            statusFilter !== "ALL" &&
                            status !== statusFilter
                        ) {
                            return false;
                        }

                        if (!normalizedSearch) {
                            return true;
                        }

                        const searchable =
                            [
                                submission.id,
                                submission.title,
                                submission.case_type,
                                submission.status,
                                submission.submitted_by,
                                submission.usernames,
                                submission.user_ids,
                                submission.description,
                                submission.notes,
                                submission.evidence,
                                submission.strike
                            ]
                                .filter(
                                    value =>
                                        value !== null &&
                                        value !== undefined
                                )
                                .join(" ")
                                .toLowerCase();

                        return searchable.includes(
                            normalizedSearch
                        );
                    }
                );
            },
            [
                cases,
                search,
                typeFilter,
                statusFilter
            ]
        );


    const queueCounts =
        useMemo(
            () => {
                return cases.reduce(
                    (counts, submission) => {
                        const status =
                            String(
                                submission.status ||
                                "PENDING"
                            )
                                .trim()
                                .toUpperCase();

                        counts.total += 1;

                        if (status === "RETURNED") {
                            counts.returned += 1;
                        } else {
                            counts.pending += 1;
                        }

                        return counts;
                    },
                    {
                        total: 0,
                        pending: 0,
                        returned: 0
                    }
                );
            },
            [cases]
        );


    async function reviewSubmission(
        submission,
        action
    ) {
        const reason =
            String(
                returnReasons[submission.id] ||
                ""
            ).trim();

        if (
            action === "return" &&
            !reason
        ) {
            setError(
                "Enter a return reason before returning the submission."
            );
            return;
        }

        if (
            action === "reject" &&
            !window.confirm(
                `Reject submission #${submission.id}?`
            )
        ) {
            return;
        }

        if (
            action === "approve" &&
            !window.confirm(
                `Approve submission #${submission.id} and add it to the permanent database?`
            )
        ) {
            return;
        }

        setWorkingId(
            submission.id
        );

        setError("");

        try {
            const response =
                await fetch(
                    `${API_BASE}/api/jp/submissions/${submission.id}/${action}`,
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
                                reason
                            })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to review submission."
                );
            }

            setCases(
                current =>
                    current.filter(
                        item =>
                            item.id !==
                            submission.id
                    )
            );

            setReturnReasons(
                current => {
                    const next = {
                        ...current
                    };

                    delete next[
                        submission.id
                    ];

                    return next;
                }
            );
        } catch (reviewError) {
            console.error(
                "SUBMISSION REVIEW ERROR:",
                reviewError
            );

            setError(
                reviewError.message
            );
        } finally {
            setWorkingId(null);
        }
    }


    if (loading) {
        return (
            <main className="jp-queue-page">
                <section className="jp-queue-shell">
                    <div className="jp-queue-empty">
                        LOADING SUBMISSION QUEUE...
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
                            KEYSTONE // JP // ADMIN REVIEW
                        </span>

                        <h1>
                            SUBMISSION QUEUE
                        </h1>

                        <p>
                            Review investigator submissions before they enter the permanent database.
                        </p>

                    </div>

                    <div className="jp-queue-header-actions">

                        <button
                            type="button"
                            className="jp-queue-button"
                            onClick={load}
                        >
                            REFRESH
                        </button>

                        <button
                            type="button"
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


                <div className="jp-submission-stats">

                    <div>
                        <span>TOTAL</span>
                        <strong>
                            {queueCounts.total}
                        </strong>
                    </div>

                    <div>
                        <span>PENDING</span>
                        <strong>
                            {queueCounts.pending}
                        </strong>
                    </div>

                    <div>
                        <span>RETURNED</span>
                        <strong>
                            {queueCounts.returned}
                        </strong>
                    </div>

                </div>


                <div className="jp-submission-toolbar">

                    <input
                        className="jp-queue-search"
                        type="search"
                        value={search}
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Search title, submitter, target, evidence..."
                        autoComplete="off"
                    />

                    <select
                        className="jp-queue-filter"
                        value={typeFilter}
                        onChange={
                            event =>
                                setTypeFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            ALL TYPES
                        </option>

                        {
                            availableTypes.map(
                                type => (
                                    <option
                                        value={type}
                                        key={type}
                                    >
                                        {type}
                                    </option>
                                )
                            )
                        }
                    </select>

                    <select
                        className="jp-queue-filter"
                        value={statusFilter}
                        onChange={
                            event =>
                                setStatusFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            ALL STATUSES
                        </option>

                        <option value="PENDING">
                            PENDING
                        </option>

                        <option value="RETURNED">
                            RETURNED
                        </option>
                    </select>

                </div>


                {
                    error && (
                        <div className="jp-queue-error">
                            {error}
                        </div>
                    )
                }


                <div className="jp-queue-summary">

                    <span>
                        {
                            filteredCases.length
                        } RESULT{
                            filteredCases.length === 1
                                ? ""
                                : "S"
                        }
                    </span>

                    <span>
                        ADMIN REVIEW MODE
                    </span>

                </div>


                {
                    filteredCases.length === 0
                        ? (
                            <div className="jp-queue-empty">

                                <h2>
                                    No Matching Submissions
                                </h2>

                                <p>
                                    Submissions matching the current filters will appear here.
                                </p>

                            </div>
                        )
                        : (
                            <div className="jp-case-list jp-submission-list">

                                {
                                    filteredCases.map(
                                        currentCase => {
                                            const busy =
                                                workingId ===
                                                currentCase.id;

                                            const normalizedStatus =
                                                String(
                                                    currentCase.status ||
                                                    "Pending"
                                                )
                                                    .trim()
                                                    .toLowerCase();

                                            return (
                                                <article
                                                    className="jp-case-card jp-submission-card"
                                                    key={
                                                        currentCase.id
                                                    }
                                                >

                                                    <div className="jp-submission-topline">

                                                        <div
                                                            className={`jp-case-status ${
                                                                normalizedStatus ===
                                                                "returned"
                                                                    ? "jp-status-returned"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {
                                                                currentCase.status ||
                                                                "Pending"
                                                            }
                                                        </div>

                                                        <span>
                                                            SUBMISSION #{
                                                                currentCase.id
                                                            }
                                                        </span>

                                                    </div>


                                                    <h2 className="jp-submission-title">
                                                        {
                                                            currentCase.title ||
                                                            "Untitled Submission"
                                                        }
                                                    </h2>


                                                    <div className="jp-submission-meta">

                                                        <span>
                                                            TYPE
                                                            <strong>
                                                                {
                                                                    currentCase.case_type ||
                                                                    "Not provided"
                                                                }
                                                            </strong>
                                                        </span>

                                                        <span>
                                                            SUBMITTED BY
                                                            <strong>
                                                                {
                                                                    currentCase.submitted_by ||
                                                                    "Unknown"
                                                                }
                                                            </strong>
                                                        </span>

                                                        <span>
                                                            SUBMITTED
                                                            <strong>
                                                                {
                                                                    formatDate(
                                                                        currentCase.created_at
                                                                    )
                                                                }
                                                            </strong>
                                                        </span>

                                                        <span>
                                                            STRIKE
                                                            <strong>
                                                                {
                                                                    currentCase.strike ??
                                                                    0
                                                                }
                                                            </strong>
                                                        </span>

                                                    </div>


                                                    <section className="jp-submission-section">

                                                        <h3>
                                                            TARGETS
                                                        </h3>

                                                        <div className="jp-submission-targets">

                                                            <div>
                                                                <span>
                                                                    USERNAMES
                                                                </span>

                                                                <p>
                                                                    {
                                                                        currentCase.usernames ||
                                                                        "Not provided"
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    USER IDS
                                                                </span>

                                                                <p>
                                                                    {
                                                                        currentCase.user_ids ||
                                                                        "Not provided"
                                                                    }
                                                                </p>
                                                            </div>

                                                        </div>

                                                    </section>


                                                    <section className="jp-submission-section">

                                                        <h3>
                                                            INVESTIGATION
                                                        </h3>

                                                        <p className="jp-preserve-lines">
                                                            {
                                                                currentCase.description ||
                                                                "No investigation summary provided."
                                                            }
                                                        </p>

                                                    </section>


                                                    {
                                                        currentCase.notes && (
                                                            <section className="jp-submission-section">

                                                                <h3>
                                                                    NOTES
                                                                </h3>

                                                                <p className="jp-preserve-lines">
                                                                    {
                                                                        currentCase.notes
                                                                    }
                                                                </p>

                                                            </section>
                                                        )
                                                    }


                                                    {
                                                        currentCase.evidence && (
                                                            <section className="jp-submission-section">

                                                                <h3>
                                                                    EVIDENCE
                                                                </h3>

                                                                <p className="jp-preserve-lines jp-break-text jp-evidence-box">
                                                                    {
                                                                        currentCase.evidence
                                                                    }
                                                                </p>

                                                            </section>
                                                        )
                                                    }


                                                    <label className="jp-return-field">

                                                        <span>
                                                            RETURN / REJECTION REASON
                                                        </span>

                                                        <textarea
                                                            value={
                                                                returnReasons[
                                                                    currentCase.id
                                                                ] || ""
                                                            }
                                                            onChange={
                                                                event =>
                                                                    setReturnReasons(
                                                                        current => ({
                                                                            ...current,
                                                                            [
                                                                                currentCase.id
                                                                            ]:
                                                                                event.target.value
                                                                        })
                                                                    )
                                                            }
                                                            placeholder="Required when returning a case for revision."
                                                        />

                                                    </label>


                                                    <div className="jp-review-actions">

                                                        <button
                                                            type="button"
                                                            className="jp-review-approve"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                reviewSubmission(
                                                                    currentCase,
                                                                    "approve"
                                                                )
                                                            }
                                                        >
                                                            {
                                                                busy
                                                                    ? "WORKING..."
                                                                    : "APPROVE"
                                                            }
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="jp-review-return"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                reviewSubmission(
                                                                    currentCase,
                                                                    "return"
                                                                )
                                                            }
                                                        >
                                                            RETURN
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="jp-review-reject"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                reviewSubmission(
                                                                    currentCase,
                                                                    "reject"
                                                                )
                                                            }
                                                        >
                                                            REJECT
                                                        </button>

                                                    </div>

                                                </article>
                                            );
                                        }
                                    )
                                }

                            </div>
                        )
                }

            </section>

        </main>
    );
}


export default JPSubmissionQueue;
