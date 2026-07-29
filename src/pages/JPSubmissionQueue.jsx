import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

    return date.toLocaleString();
}


function JPSubmissionQueue() {

    const navigate =
        useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [cases, setCases] =
        useState([]);

    const [error, setError] =
        useState("");

    const [workingId, setWorkingId] =
        useState(null);

    const [returnReasons, setReturnReasons] =
        useState({});


    const load =
        useCallback(
            async () => {

                setError("");

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


    useEffect(() => {
        load();
    }, [load]);


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

        setWorkingId(submission.id);
        setError("");

        try {

            const response =
                await fetch(
                    `${API_BASE}/api/jp/submissions/${submission.id}/${action}`,
                    {
                        method: "POST",
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

                    delete next[submission.id];

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
            <main className="jp-case-page">
                <div className="jp-case-shell">
                    <h1>
                        Loading Submission Queue...
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
                            KEYSTONE // ADMIN
                        </span>

                        <h1>
                            SUBMISSION QUEUE
                        </h1>

                        <p>
                            Review investigator submissions before they enter the permanent database.
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


                {
                    error && (
                        <div className="jp-queue-error">
                            {error}
                        </div>
                    )
                }


                {
                    cases.length === 0 && (
                        <div className="jp-empty">

                            <h2>
                                No Pending Submissions
                            </h2>

                            <p>
                                Investigations awaiting approval will appear here.
                            </p>

                        </div>
                    )
                }


                <div className="jp-case-grid">

                    {
                        cases.map(
                            currentCase => {

                                const busy =
                                    workingId ===
                                    currentCase.id;

                                return (

                                    <article
                                        className="jp-case-card jp-submission-card"
                                        key={currentCase.id}
                                    >

                                        <div className="jp-submission-topline">

                                            <div
                                                className={`jp-case-status ${
                                                    String(
                                                        currentCase.status ||
                                                        ""
                                                    ).toLowerCase() ===
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
                                                #{currentCase.id}
                                            </span>

                                        </div>


                                        <h2>
                                            {currentCase.title}
                                        </h2>


                                        <div className="jp-submission-meta">

                                            <span>
                                                TYPE
                                                <strong>
                                                    {currentCase.case_type}
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

                                            <p>
                                                <strong>
                                                    Usernames:
                                                </strong>{" "}
                                                {
                                                    currentCase.usernames ||
                                                    "Not provided"
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    User IDs:
                                                </strong>{" "}
                                                {
                                                    currentCase.user_ids ||
                                                    "Not provided"
                                                }
                                            </p>

                                        </section>


                                        <section className="jp-submission-section">

                                            <h3>
                                                INVESTIGATION
                                            </h3>

                                            <p className="jp-preserve-lines">
                                                {
                                                    currentCase.description
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

                                                    <p className="jp-preserve-lines jp-break-text">
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

            </div>

        </main>

    );
}


export default JPSubmissionQueue;
