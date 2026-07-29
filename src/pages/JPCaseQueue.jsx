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


function JPCaseQueue() {

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
        actionError,
        setActionError
    ] =
        useState("");

    const [
        cases,
        setCases
    ] =
        useState([]);

    const [
        isAdmin,
        setIsAdmin
    ] =
        useState(false);

    const [
        deletingCase,
        setDeletingCase
    ] =
        useState(null);

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


    const loadCases =
        useCallback(
            async () => {

                try {

                    setError("");

                    const response =
                        await fetch(
                            `${API_BASE}/api/jp/cases`,
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
                            "Unable to load cases."
                        );
                    }

                    setCases(
                        Array.isArray(data)
                            ? data
                            : data.cases || []
                    );

                    setIsAdmin(
                        Boolean(
                            !Array.isArray(data) &&
                            data.isAdmin
                        )
                    );

                } catch (error) {

                    console.error(
                        "JP CASE QUEUE LOAD ERROR:",
                        error
                    );

                    setError(
                        error.message
                    );

                } finally {

                    setLoading(false);
                }
            },
            []
        );


    useEffect(
        () => {

            loadCases();

        },
        [loadCases]
    );


    const filteredCases =
        useMemo(
            () => {

                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase();

                return cases.filter(
                    currentCase => {

                        const caseType =
                            String(
                                currentCase.case_type ||
                                ""
                            )
                                .trim()
                                .toUpperCase();

                        if (
                            typeFilter !== "ALL" &&
                            caseType !== typeFilter
                        ) {
                            return false;
                        }

                        if (!normalizedSearch) {
                            return true;
                        }

                        const searchableText =
                            [
                                currentCase.case_id,
                                currentCase.case_type,
                                currentCase.user_ids,
                                currentCase.usernames,
                                currentCase.type,
                                currentCase.status,
                                currentCase.notes,
                                currentCase.evidence
                            ]
                                .filter(
                                    value =>
                                        value !== null &&
                                        value !== undefined
                                )
                                .join(" ")
                                .toLowerCase();

                        return searchableText.includes(
                            normalizedSearch
                        );
                    }
                );
            },
            [
                cases,
                search,
                typeFilter
            ]
        );


    function formatDate(
        value
    ) {

        if (!value) {
            return "—";
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
                year:
                    "numeric",
                month:
                    "short",
                day:
                    "numeric",
                hour:
                    "2-digit",
                minute:
                    "2-digit"
            }
        );
    }


    function buildCaseKey(
        currentCase
    ) {

        return `${
            String(
                currentCase.case_type ||
                ""
            )
                .trim()
                .toUpperCase()
        }-${
            currentCase.case_id
        }`;
    }


    async function deleteCase(
        currentCase
    ) {

        if (!isAdmin) {
            return;
        }

        const caseType =
            String(
                currentCase.case_type ||
                ""
            )
                .trim()
                .toUpperCase();

        const caseId =
            currentCase.case_id;

        const caseLabel =
            `${caseType} case #${caseId}`;

        const confirmed =
            window.confirm(
                `Permanently delete ${caseLabel}?\n\n` +
                "This removes the case from the permanent queue. " +
                "A complete copy of the deleted record and the admin identity " +
                "will be retained in the audit log."
            );

        if (!confirmed) {
            return;
        }

        const deletionKey =
            buildCaseKey(
                currentCase
            );

        setDeletingCase(
            deletionKey
        );

        setActionError("");

        try {

            const response =
                await fetch(
                    `${API_BASE}/api/jp/cases/${
                        encodeURIComponent(
                            caseType
                        )
                    }/${
                        encodeURIComponent(
                            caseId
                        )
                    }`,
                    {
                        method:
                            "DELETE",
                        credentials:
                            "include"
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to delete case."
                );
            }

            setCases(
                previousCases =>
                    previousCases.filter(
                        caseItem =>
                            buildCaseKey(
                                caseItem
                            ) !== deletionKey
                    )
            );

        } catch (error) {

            console.error(
                "JP CASE DELETE ERROR:",
                error
            );

            setActionError(
                error.message
            );

        } finally {

            setDeletingCase(
                null
            );
        }
    }


    if (loading) {

        return (
            <main className="jp-queue-page">

                <section className="jp-queue-shell">

                    <div className="jp-queue-empty">
                        LOADING CASE QUEUE...
                    </div>

                </section>

            </main>
        );
    }


    if (
        error &&
        cases.length === 0
    ) {

        return (
            <main className="jp-queue-page">

                <section className="jp-queue-shell">

                    <div className="jp-queue-empty">

                        <h1>
                            CASE QUEUE UNAVAILABLE
                        </h1>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            className="jp-queue-button"
                            onClick={() =>
                                navigate(
                                    "/jp/dashboard"
                                )
                            }
                        >
                            RETURN TO DASHBOARD
                        </button>

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
                            KEYSTONE // JP // RECORDS
                        </span>

                        <h1>
                            CASE QUEUE
                        </h1>

                        <p>
                            Permanent DGN and XPLT case records.
                        </p>

                    </div>

                    <div className="jp-queue-header-actions">

                        <button
                            type="button"
                            className="jp-queue-button"
                            onClick={
                                loadCases
                            }
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


                <div className="jp-queue-toolbar">

                    <input
                        className="jp-queue-search"
                        type="search"
                        value={
                            search
                        }
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Search cases..."
                        autoComplete="off"
                    />

                    <select
                        className="jp-queue-filter"
                        value={
                            typeFilter
                        }
                        onChange={
                            event =>
                                setTypeFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            ALL PANELS
                        </option>

                        <option value="DGN">
                            DGN
                        </option>

                        <option value="XPLT">
                            XPLT
                        </option>
                    </select>

                </div>


                {
                    actionError && (
                        <div className="jp-case-action-error">
                            {actionError}
                        </div>
                    )
                }


                {
                    error && (
                        <div className="jp-case-action-error">
                            {error}
                        </div>
                    )
                }


                <div className="jp-queue-summary">

                    <span>
                        {
                            filteredCases.length
                        } CASE{
                            filteredCases.length === 1
                                ? ""
                                : "S"
                        }
                    </span>

                    {
                        isAdmin && (
                            <span>
                                ADMIN CONTROLS ACTIVE
                            </span>
                        )
                    }

                </div>


                {
                    filteredCases.length === 0
                        ? (
                            <div className="jp-queue-empty">
                                No matching cases were found.
                            </div>
                        )
                        : (
                            <div className="jp-case-list">

                                {
                                    filteredCases.map(
                                        currentCase => {

                                            const caseKey =
                                                buildCaseKey(
                                                    currentCase
                                                );

                                            const isDeleting =
                                                deletingCase ===
                                                caseKey;

                                            return (
                                                <article
                                                    className="jp-case-card"
                                                    key={
                                                        caseKey
                                                    }
                                                >

                                                    <div className="jp-case-card-header">

                                                        <div>

                                                            <span className="jp-case-type">
                                                                {
                                                                    currentCase.case_type
                                                                }
                                                            </span>

                                                            <h2>
                                                                CASE #{
                                                                    currentCase.case_id
                                                                }
                                                            </h2>

                                                        </div>

                                                        <span className="jp-case-status">
                                                            {
                                                                currentCase.status ||
                                                                "UNKNOWN"
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="jp-case-grid">

                                                        <div className="jp-case-field">

                                                            <span>
                                                                USERNAMES
                                                            </span>

                                                            <p>
                                                                {
                                                                    currentCase.usernames ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </div>

                                                        <div className="jp-case-field">

                                                            <span>
                                                                USER IDS
                                                            </span>

                                                            <p>
                                                                {
                                                                    currentCase.user_ids ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </div>

                                                        <div className="jp-case-field">

                                                            <span>
                                                                TYPE
                                                            </span>

                                                            <p>
                                                                {
                                                                    currentCase.type ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </div>

                                                        <div className="jp-case-field">

                                                            <span>
                                                                STRIKE
                                                            </span>

                                                            <p>
                                                                {
                                                                    currentCase.strike ??
                                                                    0
                                                                }
                                                            </p>

                                                        </div>

                                                        <div className="jp-case-field">

                                                            <span>
                                                                START DATE
                                                            </span>

                                                            <p>
                                                                {
                                                                    formatDate(
                                                                        currentCase.start_date
                                                                    )
                                                                }
                                                            </p>

                                                        </div>

                                                        <div className="jp-case-field">

                                                            <span>
                                                                END DATE
                                                            </span>

                                                            <p>
                                                                {
                                                                    formatDate(
                                                                        currentCase.end_date
                                                                    )
                                                                }
                                                            </p>

                                                        </div>

                                                        <div className="jp-case-field">

                                                            <span>
                                                                LAST UPDATED
                                                            </span>

                                                            <p>
                                                                {
                                                                    formatDate(
                                                                        currentCase.updated
                                                                    )
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>


                                                    {
                                                        currentCase.notes && (
                                                            <div className="jp-case-block">

                                                                <span>
                                                                    NOTES
                                                                </span>

                                                                <p>
                                                                    {
                                                                        currentCase.notes
                                                                    }
                                                                </p>

                                                            </div>
                                                        )
                                                    }


                                                    {
                                                        currentCase.evidence && (
                                                            <div className="jp-case-block">

                                                                <span>
                                                                    EVIDENCE
                                                                </span>

                                                                <p>
                                                                    {
                                                                        currentCase.evidence
                                                                    }
                                                                </p>

                                                            </div>
                                                        )
                                                    }


                                                    {
                                                        isAdmin && (
                                                            <div className="jp-case-actions">

                                                                <button
                                                                    type="button"
                                                                    className="jp-case-remove"
                                                                    disabled={
                                                                        isDeleting
                                                                    }
                                                                    onClick={() =>
                                                                        deleteCase(
                                                                            currentCase
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        isDeleting
                                                                            ? "REMOVING..."
                                                                            : "REMOVE CASE"
                                                                    }
                                                                </button>

                                                            </div>
                                                        )
                                                    }

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


export default JPCaseQueue;
