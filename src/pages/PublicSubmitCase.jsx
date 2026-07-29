import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API_BASE from "../utils/api";

import "./PublicSubmitCase.css";


const INITIAL_FORM = {
    caseType: "",
    submitterName: "",
    submitterContact: "",
    usernames: "",
    userIds: "",
    strike: "0",
    description: "",
    notes: "",
    evidence: "",
    website: ""
};


function PublicSubmitCase() {
    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] =
        useState(INITIAL_FORM);

    const [
        submitting,
        setSubmitting
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


    function updateField(event) {
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


    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const response =
                await fetch(
                    `${API_BASE}/api/public-submissions`,
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
                            JSON.stringify(form)
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to submit the report."
                );
            }

            setSuccess(
                `Submission #${data.submission.id} was added to the administrative review queue.`
            );

            setForm(
                INITIAL_FORM
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (submitError) {
            console.error(
                "PUBLIC CASE SUBMISSION ERROR:",
                submitError
            );

            setError(
                submitError.message
            );

        } finally {
            setSubmitting(false);
        }
    }


    return (
        <main className="public-submit-page">

            <section className="public-submit-shell">

                <header className="public-submit-header">

                    <div>
                        <span>
                            KEYSTONE // PUBLIC INTAKE
                        </span>

                        <h1>
                            SUBMIT A CASE
                        </h1>

                        <p>
                            Provide the report details and evidence available to you.
                            Keystone administrators will review, name, date, classify,
                            and finalize the case.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="public-submit-back"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        ← HOME
                    </button>

                </header>


                <div className="public-submit-divider" />


                <aside className="public-submit-notice">
                    <strong>
                        BEFORE SUBMITTING
                    </strong>

                    <p>
                        Submit factual information only. Do not include passwords,
                        private addresses, financial information, or unrelated
                        personal information. A submission does not automatically
                        create a public case.
                    </p>
                </aside>


                {
                    error && (
                        <div className="public-submit-message public-submit-error">
                            {error}
                        </div>
                    )
                }


                {
                    success && (
                        <div className="public-submit-message public-submit-success">
                            {success}
                        </div>
                    )
                }


                <form
                    className="public-submit-form"
                    onSubmit={handleSubmit}
                >

                    <div className="public-submit-grid">

                        <label className="public-submit-field">
                            <span>
                                CASE TYPE
                            </span>

                            <select
                                name="caseType"
                                value={form.caseType}
                                onChange={updateField}
                                required
                            >
                                <option value="">
                                    Select a case type
                                </option>

                                <option value="DGN">
                                    DGN // Degenerate
                                </option>

                                <option value="XPLT">
                                    XPLT // Exploiter
                                </option>
                            </select>
                        </label>


                        <label className="public-submit-field">
                            <span>
                                RECOMMENDED STRIKE
                            </span>

                            <select
                                name="strike"
                                value={form.strike}
                                onChange={updateField}
                            >
                                <option value="0">
                                    Unsure / Admin Review
                                </option>

                                <option value="1">
                                    Tier 1
                                </option>

                                <option value="2">
                                    Tier 2
                                </option>

                                <option value="3">
                                    Tier 3
                                </option>

                                <option value="4">
                                    Tier 4
                                </option>
                            </select>
                        </label>


                        <label className="public-submit-field">
                            <span>
                                YOUR NAME OR HANDLE
                            </span>

                            <input
                                name="submitterName"
                                value={form.submitterName}
                                onChange={updateField}
                                placeholder="Discord or Roblox name"
                                maxLength={100}
                                required
                            />
                        </label>


                        <label className="public-submit-field">
                            <span>
                                CONTACT INFORMATION
                            </span>

                            <input
                                name="submitterContact"
                                value={form.submitterContact}
                                onChange={updateField}
                                placeholder="Discord username or another contact"
                                maxLength={200}
                                required
                            />
                        </label>


                        <label className="public-submit-field">
                            <span>
                                ROBLOX USERNAMES
                            </span>

                            <input
                                name="usernames"
                                value={form.usernames}
                                onChange={updateField}
                                placeholder="Name1 | Name2"
                                maxLength={5000}
                            />
                        </label>


                        <label className="public-submit-field">
                            <span>
                                ROBLOX USER IDS
                            </span>

                            <input
                                name="userIds"
                                value={form.userIds}
                                onChange={updateField}
                                placeholder="12345 | 67890"
                                maxLength={5000}
                            />
                        </label>

                    </div>


                    <label className="public-submit-field public-submit-wide">
                        <span>
                            REPORT SUMMARY
                        </span>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={updateField}
                            placeholder="Explain what happened, who was involved, and why this should be reviewed."
                            maxLength={10000}
                            required
                        />
                    </label>


                    <label className="public-submit-field public-submit-wide">
                        <span>
                            ADDITIONAL CONTEXT
                        </span>

                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={updateField}
                            placeholder="Optional timeline, witnesses, servers, groups, prior incidents, or other context."
                            maxLength={20000}
                        />
                    </label>


                    <label className="public-submit-field public-submit-wide">
                        <span>
                            EVIDENCE LINKS
                        </span>

                        <textarea
                            name="evidence"
                            value={form.evidence}
                            onChange={updateField}
                            placeholder="Place one image, video, document, Discord attachment, or other evidence URL per line."
                            maxLength={30000}
                            required
                        />
                    </label>


                    <label
                        className="public-submit-honeypot"
                        aria-hidden="true"
                    >
                        Website

                        <input
                            name="website"
                            value={form.website}
                            onChange={updateField}
                            tabIndex="-1"
                            autoComplete="off"
                        />
                    </label>


                    <div className="public-submit-admin-note">
                        <span>
                            ADMINISTRATIVE FIELDS
                        </span>

                        <p>
                            Case title, official status, start date, end date,
                            permanent notes, and final database entry will be
                            completed by the reviewing administrator.
                        </p>
                    </div>


                    <div className="public-submit-actions">

                        <button
                            type="button"
                            className="public-submit-secondary"
                            onClick={() =>
                                navigate("/")
                            }
                        >
                            CANCEL
                        </button>

                        <button
                            type="submit"
                            className="public-submit-primary"
                            disabled={submitting}
                        >
                            {
                                submitting
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


export default PublicSubmitCase;
