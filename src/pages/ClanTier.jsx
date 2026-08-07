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

import "./ClanTier.css";


function splitEvidence(value) {
    return String(
        value ||
        ""
    )
        .split(
            /[|;\n\r]+/
        )
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);
}


function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(
            value
        );
    }

    return date.toLocaleDateString(
        [],
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"
        }
    );
}


function ClanTier() {
    const navigate =
        useNavigate();

    const [
        records,
        setRecords
    ] =
        useState([]);

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
        search,
        setSearch
    ] =
        useState("");

    const [
        tierFilter,
        setTierFilter
    ] =
        useState("ALL");

    const [
        expanded,
        setExpanded
    ] =
        useState(null);


    const load =
        useCallback(
            async () => {
                setLoading(
                    true
                );

                setError("");

                try {
                    const response =
                        await fetch(
                            `${API_BASE}/api/clan-tiers`,
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
                            "Unable to load clan tiers."
                        );
                    }

                    setRecords(
                        data.clans ||
                        []
                    );
                } catch (loadError) {
                    setError(
                        loadError.message
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            []
        );


    useEffect(
        () => {
            load();
        },
        [load]
    );


    const visible =
        useMemo(
            () => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                return records.filter(
                    clan => {
                        if (
                            tierFilter !==
                                "ALL" &&
                            String(
                                clan.tier ||
                                ""
                            )
                                .toUpperCase() !==
                            tierFilter
                        ) {
                            return false;
                        }

                        if (!query) {
                            return true;
                        }

                        return [
                            clan.clan_name,
                            clan.group_id,
                            clan.group_url,
                            clan.tier,
                            clan.justification,
                            clan.notes
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                query
                            );
                    }
                );
            },
            [
                records,
                search,
                tierFilter
            ]
        );


    const tiers =
        useMemo(
            () =>
                [
                    ...new Set(
                        records
                            .map(
                                clan =>
                                    String(
                                        clan.tier ||
                                        ""
                                    )
                                        .trim()
                                        .toUpperCase()
                            )
                            .filter(Boolean)
                    )
                ].sort(),
            [records]
        );


    if (loading) {
        return (
            <main className="clan-tier-page">
                <section className="clan-tier-shell">
                    <div className="clan-tier-empty">
                        LOADING CLAN TIERS...
                    </div>
                </section>
            </main>
        );
    }


    return (
        <main className="clan-tier-page">
            <section className="clan-tier-shell">
                <header className="clan-tier-header">
                    <div>
                        <span>
                            KEYSTONE // CLAN INTELLIGENCE
                        </span>

                        <h1>
                            CLAN TIER
                        </h1>

                        <p>
                            Browse clan ratings, tier justification, review history,
                            and supporting evidence.
                        </p>
                    </div>

                    <div className="clan-tier-actions">
                        <button
                            type="button"
                            onClick={
                                load
                            }
                        >
                            REFRESH
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/clan-tier/submit"
                                )
                            }
                        >
                            SUBMIT TIER REVIEW
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/home"
                                )
                            }
                        >
                            HOME
                        </button>
                    </div>
                </header>

                <div className="clan-tier-divider" />

                <div className="clan-tier-stats">
                    <div>
                        <span>
                            CLANS TRACKED
                        </span>

                        <strong>
                            {records.length}
                        </strong>
                    </div>

                    <div>
                        <span>
                            TIERS IN USE
                        </span>

                        <strong>
                            {tiers.length}
                        </strong>
                    </div>

                    <div>
                        <span>
                            EVIDENCE RECORDS
                        </span>

                        <strong>
                            {
                                records.filter(
                                    clan =>
                                        splitEvidence(
                                            clan.evidence
                                        ).length >
                                        0
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className="clan-tier-toolbar">
                    <input
                        value={
                            search
                        }
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Search clan name, group ID, tier..."
                    />

                    <select
                        value={
                            tierFilter
                        }
                        onChange={
                            event =>
                                setTierFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            ALL TIERS
                        </option>

                        {
                            tiers.map(
                                tier => (
                                    <option
                                        key={
                                            tier
                                        }
                                        value={
                                            tier
                                        }
                                    >
                                        TIER {tier}
                                    </option>
                                )
                            )
                        }
                    </select>
                </div>

                {
                    error && (
                        <div className="clan-tier-error">
                            {error}
                        </div>
                    )
                }

                {
                    visible.length ===
                        0
                        ? (
                            <div className="clan-tier-empty">
                                No clan tier records match the current filters.
                            </div>
                        )
                        : (
                            <div className="clan-tier-list">
                                {
                                    visible.map(
                                        clan => {
                                            const evidence =
                                                splitEvidence(
                                                    clan.evidence
                                                );

                                            const isOpen =
                                                expanded ===
                                                clan.id;

                                            return (
                                                <article
                                                    className="clan-tier-card"
                                                    key={
                                                        clan.id
                                                    }
                                                >
                                                    <div className="clan-tier-card-header">
                                                        <div>
                                                            <span className="clan-tier-id">
                                                                GROUP {
                                                                    clan.group_id ||
                                                                    "—"
                                                                }
                                                            </span>

                                                            <h2>
                                                                {
                                                                    clan.clan_name
                                                                }
                                                            </h2>
                                                        </div>

                                                        <div className="clan-tier-rank">
                                                            <span>
                                                                TIER
                                                            </span>

                                                            <strong>
                                                                {
                                                                    clan.tier
                                                                }
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div className="clan-tier-grid">
                                                        <div>
                                                            <span>
                                                                LAST REVIEW
                                                            </span>

                                                            <p>
                                                                {
                                                                    formatDate(
                                                                        clan.updated_at ||
                                                                        clan.reviewed_at
                                                                    )
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                STATUS
                                                            </span>

                                                            <p>
                                                                {
                                                                    clan.status ||
                                                                    "Active"
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="clan-tier-wide">
                                                            <span>
                                                                GROUP
                                                            </span>

                                                            <p>
                                                                {
                                                                    clan.group_url
                                                                        ? (
                                                                            <a
                                                                                href={
                                                                                    clan.group_url
                                                                                }
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                OPEN ROBLOX GROUP
                                                                            </a>
                                                                        )
                                                                        : "—"
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <section className="clan-tier-justification">
                                                        <span>
                                                            TIER JUSTIFICATION
                                                        </span>

                                                        <p>
                                                            {
                                                                clan.justification ||
                                                                "No public justification has been added."
                                                            }
                                                        </p>
                                                    </section>

                                                    <div className="clan-tier-evidence-header">
                                                        <span>
                                                            EVIDENCE // {
                                                                evidence.length
                                                            }
                                                        </span>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                evidence.length ===
                                                                0
                                                            }
                                                            onClick={() =>
                                                                setExpanded(
                                                                    isOpen
                                                                        ? null
                                                                        : clan.id
                                                                )
                                                            }
                                                        >
                                                            {
                                                                evidence.length ===
                                                                    0
                                                                    ? "NO EVIDENCE"
                                                                    : isOpen
                                                                        ? "HIDE EVIDENCE"
                                                                        : "VIEW EVIDENCE"
                                                            }
                                                        </button>
                                                    </div>

                                                    {
                                                        isOpen && (
                                                            <div className="clan-tier-evidence-list">
                                                                {
                                                                    evidence.map(
                                                                        (
                                                                            item,
                                                                            index
                                                                        ) => {
                                                                            const isUrl =
                                                                                /^https?:\/\//i.test(
                                                                                    item
                                                                                );

                                                                            return (
                                                                                <div
                                                                                    key={`${item}-${index}`}
                                                                                >
                                                                                    <span>
                                                                                        EVIDENCE {
                                                                                            index +
                                                                                            1
                                                                                        }
                                                                                    </span>

                                                                                    {
                                                                                        isUrl
                                                                                            ? (
                                                                                                <a
                                                                                                    href={
                                                                                                        item
                                                                                                    }
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                >
                                                                                                    OPEN LINK
                                                                                                </a>
                                                                                            )
                                                                                            : (
                                                                                                <code>
                                                                                                    {
                                                                                                        item
                                                                                                    }
                                                                                                </code>
                                                                                            )
                                                                                    }
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )
                                                                }
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


export default ClanTier;
