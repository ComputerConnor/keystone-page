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

import "./Cases.css";


const SOURCE_LABELS = {
    KEYSTONE: "Keystone",
    CJA: "CJA",
    CW: "CW",
    SCC: "SCC"
};


function firstValue(
    record,
    keys,
    fallback = null
) {
    for (const key of keys) {
        if (
            record[key] !== undefined &&
            record[key] !== null &&
            record[key] !== ""
        ) {
            return record[key];
        }
    }

    return fallback;
}


function formatDelimitedList(value) {
    const values =
        String(value || "")
            .split(/[|,;\n\r]+/)
            .map(item => item.trim())
            .filter(Boolean);

    return values.length > 0
        ? values.join(", ")
        : "—";
}


function normalizeSource(value) {
    const normalized =
        String(value || "")
            .trim()
            .toUpperCase();

    if (normalized.includes("KEYSTONE")) {
        return "KEYSTONE";
    }

    if (normalized.includes("CJA")) {
        return "CJA";
    }

    if (normalized.includes("CW")) {
        return "CW";
    }

    if (normalized.includes("SCC")) {
        return "SCC";
    }

    return normalized || "UNKNOWN";
}


function normalizeCategory(value) {
    const normalized =
        String(value || "")
            .trim()
            .toUpperCase();

    if (
        normalized === "E" ||
        normalized === "EXPLOITER" ||
        normalized === "EXPLOITERS" ||
        normalized === "XPLT"
    ) {
        return "XPLT";
    }

    if (
        normalized === "D" ||
        normalized === "DEGENERATE" ||
        normalized === "DEGENERATES" ||
        normalized === "DGN"
    ) {
        return "DGN";
    }

    return normalized || "UNKNOWN";
}



function normalizeStrike(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? Math.max(
                0,
                Math.min(
                    4,
                    Math.trunc(value)
                )
            )
            : 0;
    }

    const text =
        String(value)
            .trim()
            .toLowerCase();

    const tierMatch =
        text.match(
            /(?:tier|strike)\s*[:#-]?\s*([1-4])/i
        );

    if (tierMatch) {
        return Number(
            tierMatch[1]
        );
    }

    const numberMatch =
        text.match(
            /\b([1-4])\b/
        );

    if (numberMatch) {
        return Number(
            numberMatch[1]
        );
    }

    const parsed =
        Number.parseInt(
            text,
            10
        );

    if (
        Number.isFinite(parsed)
    ) {
        return Math.max(
            0,
            Math.min(
                4,
                parsed
            )
        );
    }

    return 0;
}


function normalizeStatus(value) {
    const original =
        String(value || "")
            .trim();

    const normalized =
        original
            .toLowerCase()
            .replace(
                /:[a-z0-9_-]+:/gi,
                " "
            )
            .replace(
                /[🟢🟠🔴🟡⚪⚫]/g,
                " "
            )
            .replace(
                /[_-]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    const activeTerms = [
        "active",
        "current",
        "open",
        "enabled",
        "ongoing",
        "live"
    ];

    const archivedTerms = [
        "archived",
        "archive",
        "inactive",
        "closed",
        "expired",
        "ended",
        "disabled",
        "removed"
    ];

    if (
        archivedTerms.some(
            term =>
                normalized.includes(
                    term
                )
        )
    ) {
        return {
            key:
                "ARCHIVED",
            label:
                "Archived"
        };
    }

    if (
        activeTerms.some(
            term =>
                normalized.includes(
                    term
                )
        )
    ) {
        return {
            key:
                "ACTIVE",
            label:
                "Active"
        };
    }

    if (!normalized) {
        return {
            key:
                "UNKNOWN",
            label:
                "Unknown"
        };
    }

    return {
        key:
            "UNKNOWN",
        label:
            original
                .replace(
                    /:[a-z0-9_-]+:/gi,
                    ""
                )
                .replace(
                    /[🟢🟠🔴🟡⚪⚫]/g,
                    ""
                )
                .trim() ||
                "Unknown"
    };
}


function formatStrikeLabel(strike) {
    if (
        Number(strike) >= 1 &&
        Number(strike) <= 4
    ) {
        return `Tier ${strike}`;
    }

    return "Unranked";
}


function normalizeCase(
    record,
    index
) {
    const source =
        normalizeSource(
            firstValue(
                record,
                [
                    "source",
                    "database",
                    "database_name",
                    "table",
                    "table_name"
                ],
                ""
            )
        );

    const category =
        normalizeCategory(
            firstValue(
                record,
                [
                    "category",
                    "case_category",
                    "case_type",
                    "panel",
                    "database_type"
                ],
                ""
            )
        );

    const caseId =
        firstValue(
            record,
            [
                "case_id",
                "CaseID",
                "id"
            ],
            "—"
        );

    return {
        key:
            `${source}-${category}-${caseId}-${index}`,

        source,
        category,
        caseId,

        userIds:
            formatDelimitedList(
                firstValue(
                    record,
                    [
                        "user_ids",
                        "UserIds",
                        "user_id"
                    ],
                    ""
                )
            ),

        usernames:
            formatDelimitedList(
                firstValue(
                    record,
                    [
                        "usernames",
                        "Usernames",
                        "username"
                    ],
                    ""
                )
            ),

        type:
            firstValue(
                record,
                [
                    "type",
                    "Type"
                ],
                "—"
            ),

        strike:
            normalizeStrike(
                firstValue(
                    record,
                    [
                        "strike",
                        "Strike",
                        "strikes",
                        "tier",
                        "Tier"
                    ],
                    0
                )
            ),

        status:
            normalizeStatus(
                firstValue(
                    record,
                    [
                        "status",
                        "Status",
                        "case_status",
                        "CaseStatus",
                        "caseStatus",
                        "state",
                        "State"
                    ],
                    ""
                )
            ),

        startDate:
            firstValue(
                record,
                [
                    "start_date",
                    "StartDate"
                ],
                null
            ),

        endDate:
            firstValue(
                record,
                [
                    "end_date",
                    "EndDate"
                ],
                null
            ),

        notes:
            firstValue(
                record,
                [
                    "notes",
                    "Notes"
                ],
                ""
            ),

        hasEvidence:
            Boolean(
                firstValue(
                    record,
                    [
                        "has_evidence",
                        "hasEvidence"
                    ],
                    false
                )
            ),

        updated:
            firstValue(
                record,
                [
                    "updated_at",
                    "updated",
                    "Updated"
                ],
                null
            )
    };
}


function formatDate(value) {
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
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function Cases() {
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
        cases,
        setCases
    ] =
        useState([]);

    const [
        search,
        setSearch
    ] =
        useState("");

    const [
        categoryFilter,
        setCategoryFilter
    ] =
        useState("ALL");

    const [
        sourceFilter,
        setSourceFilter
    ] =
        useState("ALL");

    const [
        strikeFilter,
        setStrikeFilter
    ] =
        useState("ALL");

    const [
        statusFilter,
        setStatusFilter
    ] =
        useState("ALL");

    const [
        evidenceLoadingKey,
        setEvidenceLoadingKey
    ] =
        useState(null);


    const loadCases =
        useCallback(
            async () => {
                setLoading(true);
                setError("");

                try {
                    const response =
                        await fetch(
                            `${API_BASE}/api/cases`,
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
                            "Unable to load public cases."
                        );
                    }

                    const rows =
                        Array.isArray(data)
                            ? data
                            : (
                                data.cases ||
                                data.records ||
                                []
                            );

                    setCases(
                        rows.map(
                            normalizeCase
                        )
                    );
                } catch (loadError) {
                    console.error(
                        "PUBLIC CASES LOAD ERROR:",
                        loadError
                    );

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
            loadCases();
        },
        [loadCases]
    );


    async function openEvidence(
        currentCase
    ) {
        /*
         * Open the tab immediately during the click event
         * so popup blockers allow it.
         */
        const evidenceWindow =
            window.open(
                "about:blank",
                "_blank"
            );

        if (evidenceWindow) {
            /*
             * Prevent the new page from controlling
             * the original website tab.
             */
            evidenceWindow.opener =
                null;

            evidenceWindow.document.title =
                "Loading Evidence...";

            evidenceWindow.document.body.innerHTML = `
            <div style="
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0;
                background: #09090f;
                color: #c084fc;
                font-family: Arial, sans-serif;
                letter-spacing: 2px;
            ">
                GENERATING EVIDENCE LINK...
            </div>
        `;
    }

    setEvidenceLoadingKey(
        currentCase.key
    );

    setError("");

    try {
        const response =
            await fetch(
                `${API_BASE}/api/cases/${
                    encodeURIComponent(
                        currentCase.source
                    )
                }/${
                    encodeURIComponent(
                        currentCase.category
                    )
                }/${
                    encodeURIComponent(
                        currentCase.caseId
                    )
                }/evidence`,
                {
                    method:
                        "POST",

                    credentials:
                        "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to create the evidence link."
                );
            }

            if (!data.url) {
                throw new Error(
                    "The server did not return an evidence link."
                );
            }

            if (evidenceWindow) {
                evidenceWindow.location.replace(
                    data.url
                );
            } else {
                /*
                 * Only use the current tab when the browser
                 * genuinely blocked the popup.
                 */
                window.location.assign(
                    data.url
                );
            }

        } catch (evidenceError) {
            if (
                evidenceWindow &&
                !evidenceWindow.closed
            ) {
                evidenceWindow.document.title =
                    "Evidence Error";

                evidenceWindow.document.body.innerHTML = `
                    <div style="
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        gap: 16px;
                        margin: 0;
                        padding: 30px;
                        background: #09090f;
                        color: #ffffff;
                        font-family: Arial, sans-serif;
                        text-align: center;
                    ">
                        <strong style="
                            color: #c084fc;
                            letter-spacing: 2px;
                        ">
                            EVIDENCE ERROR
                        </strong>

                        <span>
                            ${
                                evidenceError.message
                            }
                        </span>
                    </div>
                `;
            }

            console.error(
                "PUBLIC EVIDENCE LINK ERROR:",
                evidenceError
            );

            setError(
                evidenceError.message
            );

        } finally {
            setEvidenceLoadingKey(
                null
            );
        }
    }


    const filteredCases =
        useMemo(
            () => {
                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase();

                return cases.filter(
                    currentCase => {
                        if (
                            categoryFilter !== "ALL" &&
                            currentCase.category !==
                                categoryFilter
                        ) {
                            return false;
                        }

                        if (
                            sourceFilter !== "ALL" &&
                            currentCase.source !==
                                sourceFilter
                        ) {
                            return false;
                        }

                        if (
                            strikeFilter !== "ALL" &&
                            currentCase.strike !==
                                Number(strikeFilter)
                        ) {
                            return false;
                        }

                        if (
                            statusFilter !== "ALL" &&
                            currentCase.status.key !==
                                statusFilter
                        ) {
                            return false;
                        }

                        if (!normalizedSearch) {
                            return true;
                        }

                        const searchableText =
                            [
                                currentCase.caseId,
                                currentCase.userIds,
                                currentCase.usernames,
                                currentCase.type,
                                currentCase.strike,
                                currentCase.status.label,
                                currentCase.notes,
                                currentCase.source,
                                currentCase.category
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
                categoryFilter,
                sourceFilter,
                strikeFilter,
                statusFilter
            ]
        );


    const totals =
        useMemo(
            () => {
                return cases.reduce(
                    (summary, currentCase) => {
                        summary.total += 1;

                        if (
                            currentCase.category ===
                            "XPLT"
                        ) {
                            summary.xplt += 1;
                        }

                        if (
                            currentCase.category ===
                            "DGN"
                        ) {
                            summary.dgn += 1;
                        }

                        return summary;
                    },
                    {
                        total: 0,
                        xplt: 0,
                        dgn: 0
                    }
                );
            },
            [cases]
        );


    if (loading) {
        return (
            <main className="cases-page">
                <section className="cases-shell">
                    <div className="cases-empty">
                        LOADING CASE DATABASES...
                    </div>
                </section>
            </main>
        );
    }


    return (
        <main className="cases-page">

            <section className="cases-shell">

                <header className="cases-header">

                    <div>

                        <span className="cases-label">
                            KEYSTONE // PUBLIC RECORDS
                        </span>

                        <h1>
                            CASE DATABASE
                        </h1>

                        <p>
                            Search public case records from Keystone, CJA, CW, and SCC.
                        </p>

                    </div>

                    <div className="cases-header-actions">

                        <button
                            type="button"
                            className="cases-button"
                            onClick={loadCases}
                        >
                            REFRESH
                        </button>

                        <button
                            type="button"
                            className="cases-button"
                            onClick={() =>
                                navigate("/")
                            }
                        >
                            HOME
                        </button>

                    </div>

                </header>


                <div className="cases-divider" />


                <div className="cases-stats">

                    <div>
                        <span>TOTAL RECORDS</span>
                        <strong>
                            {totals.total}
                        </strong>
                    </div>

                    <div>
                        <span>XPLT CASES</span>
                        <strong>
                            {totals.xplt}
                        </strong>
                    </div>

                    <div>
                        <span>DGN CASES</span>
                        <strong>
                            {totals.dgn}
                        </strong>
                    </div>

                </div>


                <div className="cases-toolbar">

                    <input
                        className="cases-search"
                        type="search"
                        value={search}
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Search case ID, username, user ID, type, status..."
                        autoComplete="off"
                    />

                    <select
                        className="cases-filter"
                        value={categoryFilter}
                        onChange={
                            event =>
                                setCategoryFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            ALL CASE TYPES
                        </option>

                        <option value="XPLT">
                            XPLT
                        </option>

                        <option value="DGN">
                            DGN
                        </option>
                    </select>

                    <select
                        className="cases-filter"
                        value={sourceFilter}
                        onChange={
                            event =>
                                setSourceFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            ALL DATABASES
                        </option>

                        <option value="KEYSTONE">
                            KEYSTONE
                        </option>

                        <option value="CJA">
                            CJA
                        </option>

                        <option value="CW">
                            CW
                        </option>

                        <option value="SCC">
                            SCC
                        </option>
                    </select>

                    <select
                        className="cases-filter"
                        value={strikeFilter}
                        onChange={
                            event =>
                                setStrikeFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            ALL TIERS
                        </option>

                        <option value="1">
                            TIER 1
                        </option>

                        <option value="2">
                            TIER 2
                        </option>

                        <option value="3">
                            TIER 3
                        </option>

                        <option value="4">
                            TIER 4
                        </option>
                    </select>

                    <select
                        className="cases-filter"
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

                        <option value="ACTIVE">
                            ACTIVE
                        </option>

                        <option value="ARCHIVED">
                            ARCHIVED
                        </option>
                    </select>

                </div>


                {
                    error && (
                        <div className="cases-error">
                            {error}
                        </div>
                    )
                }


                <div className="cases-summary">

                    <span>
                        {
                            filteredCases.length
                        } RECORD{
                            filteredCases.length === 1
                                ? ""
                                : "S"
                        }
                    </span>

                    <span>
                        PUBLIC DATABASE VIEW
                    </span>

                </div>


                {
                    filteredCases.length === 0
                        ? (
                            <div className="cases-empty">

                                <h2>
                                    No Matching Cases
                                </h2>

                                <p>
                                    Try changing the current search or filters.
                                </p>

                            </div>
                        )
                        : (
                            <div className="cases-list">

                                {
                                    filteredCases.map(
                                        currentCase => (
                                            <article
                                                className="cases-card"
                                                key={
                                                    currentCase.key
                                                }
                                            >

                                                <div className="cases-card-header">

                                                    <div>

                                                        <div className="cases-source-row">

                                                            <span className="cases-source">
                                                                {
                                                                    SOURCE_LABELS[
                                                                        currentCase.source
                                                                    ] ||
                                                                    currentCase.source
                                                                }
                                                            </span>

                                                            <span className={`cases-category cases-category-${currentCase.category.toLowerCase()}`}>
                                                                {
                                                                    currentCase.category
                                                                }
                                                            </span>

                                                        </div>

                                                        <h2>
                                                            CASE #{
                                                                currentCase.caseId
                                                            }
                                                        </h2>

                                                    </div>

                                                    <span
                                                        className={`cases-status cases-status-${currentCase.status.key.toLowerCase()}`}
                                                    >
                                                        {
                                                            currentCase.status.label
                                                        }
                                                    </span>

                                                </div>


                                                <div className="cases-grid">

                                                    <div className="cases-field">

                                                        <span>
                                                            USERNAMES
                                                        </span>

                                                        <p>
                                                            {
                                                                currentCase.usernames
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="cases-field">

                                                        <span>
                                                            USER IDS
                                                        </span>

                                                        <p>
                                                            {
                                                                currentCase.userIds
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="cases-field">

                                                        <span>
                                                            TYPE
                                                        </span>

                                                        <p>
                                                            {
                                                                currentCase.type
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="cases-field">

                                                        <span>
                                                            STRIKE
                                                        </span>

                                                        <p>
                                                            {
                                                                formatStrikeLabel(
                                                                    currentCase.strike
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="cases-field">

                                                        <span>
                                                            START DATE
                                                        </span>

                                                        <p>
                                                            {
                                                                formatDate(
                                                                    currentCase.startDate
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="cases-field">

                                                        <span>
                                                            END DATE
                                                        </span>

                                                        <p>
                                                            {
                                                                formatDate(
                                                                    currentCase.endDate
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="cases-field cases-field-wide">

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
                                                        <section className="cases-block">

                                                            <span>
                                                                NOTES
                                                            </span>

                                                            <p>
                                                                {
                                                                    currentCase.notes
                                                                }
                                                            </p>

                                                        </section>
                                                    )
                                                }


                                                <section className="cases-evidence">

                                                    <span>
                                                        EVIDENCE
                                                    </span>

                                                    {
                                                        currentCase.hasEvidence
                                                            ? (
                                                                <button
                                                                    type="button"
                                                                    className="cases-evidence-button"
                                                                    disabled={
                                                                        evidenceLoadingKey ===
                                                                        currentCase.key
                                                                    }
                                                                    onClick={() =>
                                                                        openEvidence(
                                                                            currentCase
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        evidenceLoadingKey ===
                                                                        currentCase.key
                                                                            ? "CREATING LINK..."
                                                                            : "GET EVIDENCE"
                                                                    }
                                                                </button>
                                                            )
                                                            : (
                                                                <p className="cases-no-evidence">
                                                                    No evidence available
                                                                </p>
                                                            )
                                                    }

                                                </section>

                                            </article>
                                        )
                                    )
                                }

                            </div>
                        )
                }

            </section>

        </main>
    );
}


export default Cases;
