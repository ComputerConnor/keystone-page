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


function dateLabel(value) {
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


function evidenceItems(value) {
    if (
        Array.isArray(
            value
        )
    ) {
        return value;
    }

    if (!value) {
        return [];
    }

    return String(
        value
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


function EvidenceList({
    items,
    emptyText =
        "No evidence attached."
}) {
    const evidence =
        evidenceItems(
            items
        );

    if (
        evidence.length ===
        0
    ) {
        return (
            <p className="clan-tier-muted">
                {emptyText}
            </p>
        );
    }

    return (
        <div className="clan-tier-evidence-grid">
            {
                evidence.map(
                    (
                        item,
                        index
                    ) => {
                        const value =
                            typeof item ===
                                "string"
                                ? item
                                : (
                                    item.url ||
                                    item.openUrl ||
                                    item.blobUrl ||
                                    item.name ||
                                    JSON.stringify(
                                        item
                                    )
                                );

                        const isUrl =
                            /^https?:\/\//i.test(
                                value
                            );

                        return (
                            <div
                                className="clan-tier-evidence-item"
                                key={`${value}-${index}`}
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
                                                    value
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                OPEN
                                            </a>
                                        )
                                        : (
                                            <code>
                                                {value}
                                            </code>
                                        )
                                }
                            </div>
                        );
                    }
                )
            }
        </div>
    );
}


function ClanTier() {
    const navigate =
        useNavigate();

    const [
        clans,
        setClans
    ] =
        useState([]);

    const [
        selected,
        setSelected
    ] =
        useState(null);

    const [
        profile,
        setProfile
    ] =
        useState(null);

    const [
        search,
        setSearch
    ] =
        useState("");

    const [
        error,
        setError
    ] =
        useState("");

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        profileLoading,
        setProfileLoading
    ] =
        useState(false);


    const loadClans =
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

                    setClans(
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


    const openClan =
        useCallback(
            async clan => {
                if (
                    !clan?.group_id
                ) {
                    setError(
                        "This clan does not have a Roblox group ID attached."
                    );

                    return;
                }

                setSelected(
                    clan
                );

                setProfileLoading(
                    true
                );

                setError("");

                try {
                    const response =
                        await fetch(
                            `${API_BASE}/api/clan-tiers/group/${encodeURIComponent(
                                clan.group_id
                            )}`,
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
                            "Unable to load clan profile."
                        );
                    }

                    setProfile(
                        data
                    );

                    window.scrollTo({
                        top:
                            0,

                        behavior:
                            "smooth"
                    });
                } catch (profileError) {
                    setError(
                        profileError.message
                    );
                } finally {
                    setProfileLoading(
                        false
                    );
                }
            },
            []
        );


    useEffect(
        () => {
            loadClans();
        },
        [loadClans]
    );


    const visibleClans =
        useMemo(
            () => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                if (!query) {
                    return clans;
                }

                return clans.filter(
                    clan =>
                        [
                            clan.clan_name,
                            clan.group_id,
                            clan.tier
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                query
                            )
                );
            },
            [
                clans,
                search
            ]
        );


    const clan =
        profile?.clan ||
        selected;

    const clanEvidence =
        evidenceItems(
            clan?.evidence
        );


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
                            Informational clan conduct records based on documented incidents
                            and currently listed individuals.
                        </p>
                    </div>

                    <div className="clan-tier-header-actions">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/clan-tier/submit"
                                )
                            }
                        >
                            SUBMIT REPORT
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

                {
                    error && (
                        <div className="clan-tier-error">
                            {error}
                        </div>
                    )
                }

                {
                    clan && (
                        <section className="clan-tier-profile">
                            <div className="clan-tier-profile-heading">
                                <div>
                                    <span>
                                        SELECTED CLAN
                                    </span>

                                    <h2>
                                        {
                                            clan.clan_name
                                        }
                                    </h2>

                                    <p>
                                        Roblox Group {
                                            clan.group_id ||
                                            "—"
                                        }
                                    </p>
                                </div>

                                <div className="clan-tier-grade">
                                    <span>
                                        CLAN TIER
                                    </span>

                                    <strong>
                                        {
                                            clan.tier ||
                                            "S"
                                        }
                                    </strong>
                                </div>
                            </div>

                            <section className="clan-tier-snapshot-section">
                                <div className="clan-tier-section-heading">
                                    <div>
                                        <span>
                                            LATEST GROUP CHECK
                                        </span>

                                        <h3>
                                            CHECK SNAPSHOT
                                        </h3>
                                    </div>

                                    <small>
                                        {
                                            profile
                                                ?.latestSnapshot
                                                ?.created_at
                                                ? `Scanned ${dateLabel(
                                                    profile.latestSnapshot.created_at
                                                )}`
                                                : "Run /checkgroup to create the first snapshot."
                                        }
                                    </small>
                                </div>

                                {
                                    profileLoading
                                        ? (
                                            <div className="clan-tier-snapshot-empty">
                                                LOADING CLAN PROFILE...
                                            </div>
                                        )
                                        : profile?.latestSnapshot
                                            ? (
                                                <div className="clan-tier-snapshot-frame">
                                                    <img
                                                        src={`${API_BASE}/api/clan-tiers/group/${encodeURIComponent(
                                                            clan.group_id
                                                        )}/snapshot?ts=${encodeURIComponent(
                                                            profile.latestSnapshot.created_at
                                                        )}`}
                                                        alt={`${clan.clan_name} group check snapshot`}
                                                    />
                                                </div>
                                            )
                                            : (
                                                <div className="clan-tier-snapshot-empty">
                                                    NO SAVED GROUP CHECK SNAPSHOT
                                                </div>
                                            )
                                }
                            </section>

                            {
                                profile && (
                                    <>
                                        <section className="clan-tier-score-grid">
                                            <div>
                                                <span>
                                                    TOTAL DEGENERATE POINTS
                                                </span>

                                                <strong>
                                                    {
                                                        Number(
                                                            clan.total_points ||
                                                            0
                                                        )
                                                            .toFixed(
                                                                1
                                                            )
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    INCIDENT POINTS
                                                </span>

                                                <strong>
                                                    {
                                                        Number(
                                                            clan.incident_points ||
                                                            0
                                                        )
                                                            .toFixed(
                                                                1
                                                            )
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    LISTED INDIVIDUAL POINTS
                                                </span>

                                                <strong>
                                                    {
                                                        Number(
                                                            clan.listed_points ||
                                                            0
                                                        )
                                                            .toFixed(
                                                                1
                                                            )
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    NEXT INCIDENT EXPIRATION
                                                </span>

                                                <strong className="clan-tier-date-value">
                                                    {
                                                        dateLabel(
                                                            clan.next_expiration
                                                        )
                                                    }
                                                </strong>
                                            </div>
                                        </section>

                                        <section className="clan-tier-record-section">
                                            <div className="clan-tier-section-heading">
                                                <div>
                                                    <span>
                                                        CLAN-SPECIFIC MATERIAL
                                                    </span>

                                                    <h3>
                                                        CLAN TIER EVIDENCE
                                                    </h3>
                                                </div>

                                                <strong>
                                                    {
                                                        clanEvidence.length
                                                    }
                                                </strong>
                                            </div>

                                            <EvidenceList
                                                items={
                                                    clan.evidence
                                                }
                                                emptyText="No general Clan Tier evidence has been attached to this clan."
                                            />
                                        </section>

                                        <section className="clan-tier-record-section">
                                            <div className="clan-tier-section-heading">
                                                <div>
                                                    <span>
                                                        90-DAY POINT RECORDS
                                                    </span>

                                                    <h3>
                                                        CONFIRMED INCIDENTS
                                                    </h3>
                                                </div>

                                                <strong>
                                                    {
                                                        profile.incidents
                                                            ?.length ||
                                                        0
                                                    }
                                                </strong>
                                            </div>

                                            <div className="clan-tier-record-list">
                                                {
                                                    profile.incidents
                                                        ?.length
                                                        ? profile.incidents.map(
                                                            incident => (
                                                                <article
                                                                    className="clan-tier-record-card"
                                                                    key={
                                                                        incident.id
                                                                    }
                                                                >
                                                                    <div className="clan-tier-record-card-header">
                                                                        <div>
                                                                            <span>
                                                                                INCIDENT #{incident.id}
                                                                            </span>

                                                                            <h4>
                                                                                {
                                                                                    incident.title
                                                                                }
                                                                            </h4>
                                                                        </div>

                                                                        <div
                                                                            className={
                                                                                incident.contributes_points
                                                                                    ? "clan-tier-contribution active"
                                                                                    : "clan-tier-contribution expired"
                                                                            }
                                                                        >
                                                                            {
                                                                                incident.contributes_points
                                                                                    ? `+${Number(
                                                                                        incident.points
                                                                                    ).toFixed(
                                                                                        1
                                                                                    )} ACTIVE`
                                                                                    : "0 ACTIVE // HISTORICAL"
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    <p>
                                                                        {
                                                                            incident.description ||
                                                                            "No description."
                                                                        }
                                                                    </p>

                                                                    <div className="clan-tier-record-meta">
                                                                        <span>
                                                                            CONFIRMED {
                                                                                dateLabel(
                                                                                    incident.confirmed_at
                                                                                )
                                                                            }
                                                                        </span>

                                                                        <span>
                                                                            EXPIRES {
                                                                                dateLabel(
                                                                                    incident.expires_at
                                                                                )
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    <EvidenceList
                                                                        items={
                                                                            incident.evidence
                                                                        }
                                                                    />
                                                                </article>
                                                            )
                                                        )
                                                        : (
                                                            <p className="clan-tier-muted">
                                                                No confirmed Clan Tier incidents are recorded.
                                                            </p>
                                                        )
                                                }
                                            </div>
                                        </section>

                                        <section className="clan-tier-record-section">
                                            <div className="clan-tier-section-heading">
                                                <div>
                                                    <span>
                                                        NON-DECAYING POINTS
                                                    </span>

                                                    <h3>
                                                        LISTED INDIVIDUALS
                                                    </h3>
                                                </div>

                                                <strong>
                                                    {
                                                        profile.listedIndividuals
                                                            ?.filter(
                                                                person =>
                                                                    person.is_active
                                                            )
                                                            .length ||
                                                        0
                                                    } ACTIVE
                                                </strong>
                                            </div>

                                            <div className="clan-tier-listed-grid">
                                                {
                                                    profile.listedIndividuals
                                                        ?.length
                                                        ? profile.listedIndividuals.map(
                                                            person => (
                                                                <article
                                                                    className="clan-tier-listed-card"
                                                                    key={
                                                                        person.id
                                                                    }
                                                                >
                                                                    <span>
                                                                        {
                                                                            person.is_active
                                                                                ? "+0.5 POINT"
                                                                                : "HISTORICAL"
                                                                        }
                                                                    </span>

                                                                    <h4>
                                                                        {
                                                                            person.username ||
                                                                            person.user_id ||
                                                                            "Unknown User"
                                                                        }
                                                                    </h4>

                                                                    <p>
                                                                        {
                                                                            person.case_id
                                                                                ? `${person.case_type || "CASE"} #${person.case_id}`
                                                                                : "No linked case."
                                                                        }
                                                                    </p>
                                                                </article>
                                                            )
                                                        )
                                                        : (
                                                            <p className="clan-tier-muted">
                                                                No listed individuals are associated with this clan.
                                                            </p>
                                                        )
                                                }
                                            </div>
                                        </section>

                                        <section className="clan-tier-policy">
                                            <span>
                                                HOW CLAN TIER WORKS
                                            </span>

                                            <p>
                                                Clan Tier is informational only. Confirmed incidents contribute
                                                1 Degenerate Point for 90 days. Currently listed individuals
                                                contribute 0.5 points each and do not decay until they are no
                                                longer associated with the clan. Expired incidents and their
                                                evidence remain visible as historical context.
                                            </p>

                                            <div>
                                                <strong>S</strong>
                                                <small>0–1</small>

                                                <strong>A</strong>
                                                <small>&gt;1–4</small>

                                                <strong>B</strong>
                                                <small>&gt;4–7</small>

                                                <strong>C</strong>
                                                <small>&gt;7–11</small>

                                                <strong>D</strong>
                                                <small>&gt;11–15</small>

                                                <strong>F</strong>
                                                <small>&gt;15</small>
                                            </div>
                                        </section>
                                    </>
                                )
                            }
                        </section>
                    )
                }

                <section className="clan-tier-directory">
                    <div className="clan-tier-directory-heading">
                        <div>
                            <span>
                                DIRECTORY
                            </span>

                            <h2>
                                FIND A CLAN
                            </h2>
                        </div>

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
                            placeholder="Search clan name or Roblox group ID..."
                        />
                    </div>

                    {
                        loading
                            ? (
                                <div className="clan-tier-empty">
                                    LOADING CLANS...
                                </div>
                            )
                            : (
                                <div className="clan-tier-directory-list">
                                    {
                                        visibleClans.map(
                                            item => (
                                                <button
                                                    type="button"
                                                    className={
                                                        selected?.id ===
                                                            item.id
                                                            ? "clan-tier-directory-card selected"
                                                            : "clan-tier-directory-card"
                                                    }
                                                    key={
                                                        item.id
                                                    }
                                                    onClick={() =>
                                                        openClan(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <div>
                                                        <span>
                                                            GROUP {
                                                                item.group_id ||
                                                                "—"
                                                            }
                                                        </span>

                                                        <strong>
                                                            {
                                                                item.clan_name
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div className="clan-tier-directory-score">
                                                        <small>
                                                            {
                                                                Number(
                                                                    item.total_points ||
                                                                    0
                                                                )
                                                                    .toFixed(
                                                                        1
                                                                    )
                                                            } PTS
                                                        </small>

                                                        <strong>
                                                            {
                                                                item.tier ||
                                                                "S"
                                                            }
                                                        </strong>
                                                    </div>
                                                </button>
                                            )
                                        )
                                    }
                                </div>
                            )
                    }
                </section>
            </section>
        </main>
    );
}


export default ClanTier;
