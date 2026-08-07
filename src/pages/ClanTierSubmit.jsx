import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API_BASE from "../utils/api";

import "./ClanTierSubmit.css";


const INITIAL_FORM = {
    clanName: "",
    groupId: "",
    groupUrl: "",
    requestedTier: "",
    submitterName: "",
    submitterContact: "",
    justification: "",
    evidence: "",
    notes: ""
};


function ClanTierSubmit() {
    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] =
        useState(
            INITIAL_FORM
        );

    const [
        working,
        setWorking
    ] =
        useState(false);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        success,
        setSuccess
    ] =
        useState("");


    function update(
        event
    ) {
        const {
            name,
            value
        } =
            event.target;

        setForm(
            current => ({
                ...current,
                [name]:
                    value
            })
        );
    }


    async function submit(
        event
    ) {
        event.preventDefault();

        setWorking(
            true
        );

        setError("");
        setSuccess("");

        try {
            const response =
                await fetch(
                    `${API_BASE}/api/clan-tiers/submissions`,
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
                                form
                            )
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to submit clan tier review."
                );
            }

            setSuccess(
                `Clan tier submission #${data.submission.id} was added for review.`
            );

            setForm(
                INITIAL_FORM
            );
        } catch (submitError) {
            setError(
                submitError.message
            );
        } finally {
            setWorking(
                false
            );
        }
    }


    return (
        <main className="clan-submit-page">
            <section className="clan-submit-shell">
                <header>
                    <div>
                        <span>
                            KEYSTONE // CLAN TIER INTAKE
                        </span>

                        <h1>
                            SUBMIT TIER REVIEW
                        </h1>

                        <p>
                            Request a new clan tier or provide evidence supporting a tier change.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/clan-tier"
                            )
                        }
                    >
                        ← CLAN TIER
                    </button>
                </header>

                <div className="clan-submit-divider" />

                {
                    error && (
                        <div className="clan-submit-error">
                            {error}
                        </div>
                    )
                }

                {
                    success && (
                        <div className="clan-submit-success">
                            {success}
                        </div>
                    )
                }

                <form
                    onSubmit={
                        submit
                    }
                >
                    <div className="clan-submit-grid">
                        <label>
                            <span>
                                CLAN NAME
                            </span>

                            <input
                                name="clanName"
                                value={
                                    form.clanName
                                }
                                onChange={
                                    update
                                }
                                required
                            />
                        </label>

                        <label>
                            <span>
                                REQUESTED TIER
                            </span>

                            <input
                                name="requestedTier"
                                value={
                                    form.requestedTier
                                }
                                onChange={
                                    update
                                }
                                placeholder="S, A, B, C..."
                                maxLength={20}
                                required
                            />
                        </label>

                        <label>
                            <span>
                                ROBLOX GROUP ID
                            </span>

                            <input
                                name="groupId"
                                value={
                                    form.groupId
                                }
                                onChange={
                                    update
                                }
                                placeholder="14355748"
                            />
                        </label>

                        <label>
                            <span>
                                ROBLOX GROUP URL
                            </span>

                            <input
                                name="groupUrl"
                                value={
                                    form.groupUrl
                                }
                                onChange={
                                    update
                                }
                                placeholder="https://www.roblox.com/communities/..."
                            />
                        </label>

                        <label>
                            <span>
                                YOUR NAME / HANDLE
                            </span>

                            <input
                                name="submitterName"
                                value={
                                    form.submitterName
                                }
                                onChange={
                                    update
                                }
                                required
                            />
                        </label>

                        <label>
                            <span>
                                CONTACT
                            </span>

                            <input
                                name="submitterContact"
                                value={
                                    form.submitterContact
                                }
                                onChange={
                                    update
                                }
                                required
                            />
                        </label>
                    </div>

                    <label>
                        <span>
                            TIER JUSTIFICATION
                        </span>

                        <textarea
                            name="justification"
                            value={
                                form.justification
                            }
                            onChange={
                                update
                            }
                            placeholder="Explain why the clan should hold the requested tier."
                            required
                        />
                    </label>

                    <label>
                        <span>
                            EVIDENCE LINKS
                        </span>

                        <textarea
                            name="evidence"
                            value={
                                form.evidence
                            }
                            onChange={
                                update
                            }
                            placeholder="One supporting URL per line."
                            required
                        />
                    </label>

                    <label>
                        <span>
                            ADDITIONAL NOTES
                        </span>

                        <textarea
                            name="notes"
                            value={
                                form.notes
                            }
                            onChange={
                                update
                            }
                            placeholder="Optional context."
                        />
                    </label>

                    <div className="clan-submit-actions">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/clan-tier"
                                )
                            }
                        >
                            CANCEL
                        </button>

                        <button
                            type="submit"
                            disabled={
                                working
                            }
                        >
                            {
                                working
                                    ? "SUBMITTING..."
                                    : "SUBMIT FOR REVIEW"
                            }
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}


export default ClanTierSubmit;
