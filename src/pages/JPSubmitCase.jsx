import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE from "../utils/api";

import "./JPSubmitCase.css";


function JPSubmitCase() {

    const navigate = useNavigate();

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [form, setForm] =
        useState({
            caseType: "",
            title: "",
            usernames: "",
            userIds: "",
            strike: "0",
            caseStatus: "Active",
            startDate: "",
            endDate: "",
            description: "",
            notes: "",
            evidence: ""
        });


    useEffect(() => {

        async function loadUser() {

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

                setUser(data.user);

                const role =
                    String(
                        data.user.category || ""
                    ).toUpperCase();

                if (
                    role === "DGN_PANEL" ||
                    role === "DEGEN"
                ) {
                    setForm(
                        current => ({
                            ...current,
                            caseType: "DGN"
                        })
                    );
                }

                if (
                    role === "XPLT_PANEL" ||
                    role === "EXPLOIT" ||
                    role === "EXPLOITER"
                ) {
                    setForm(
                        current => ({
                            ...current,
                            caseType: "XPLT"
                        })
                    );
                }

            } catch (loadError) {

                console.error(
                    "JP SUBMIT AUTH ERROR:",
                    loadError
                );

                navigate("/jp");

            } finally {

                setLoading(false);
            }
        }

        loadUser();

    }, [navigate]);


    const role =
        String(
            user?.category || ""
        ).toUpperCase();


    const availableTypes =
        useMemo(() => {

            if (role === "ADMIN") {
                return [
                    {
                        value: "DGN",
                        label: "DGN // Degenerate"
                    },
                    {
                        value: "XPLT",
                        label: "XPLT // Exploiter"
                    }
                ];
            }

            if (
                role === "DGN_PANEL" ||
                role === "DEGEN"
            ) {
                return [
                    {
                        value: "DGN",
                        label: "DGN // Degenerate"
                    }
                ];
            }

            if (
                role === "XPLT_PANEL" ||
                role === "EXPLOIT" ||
                role === "EXPLOITER"
            ) {
                return [
                    {
                        value: "XPLT",
                        label: "XPLT // Exploiter"
                    }
                ];
            }

            return [];

        }, [role]);


    function updateField(event) {

        const {
            name,
            value
        } =
            event.target;

        setForm(
            current => ({
                ...current,
                [name]: value
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
                    `${API_BASE}/api/jp/submit`,
                    {
                        method: "POST",
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
                    "Unable to submit case."
                );
            }

            setSuccess(
                `Submission #${data.submission.id} was added to the review queue.`
            );

            setForm(
                current => ({
                    ...current,
                    title: "",
                    usernames: "",
                    userIds: "",
                    strike: "0",
                    caseStatus: "Active",
                    startDate: "",
                    endDate: "",
                    description: "",
                    notes: "",
                    evidence: ""
                })
            );

        } catch (submitError) {

            console.error(
                "CASE SUBMISSION ERROR:",
                submitError
            );

            setError(
                submitError.message
            );

        } finally {

            setSubmitting(false);
        }
    }


    if (loading) {

        return (
            <main className="jp-submit-page">
                <div className="jp-submit-shell">
                    <h1>
                        Loading Case Submission...
                    </h1>
                </div>
            </main>
        );
    }


    return (

        <main className="jp-submit-page">

            <div className="jp-submit-shell">

                <header className="jp-submit-header">

                    <div>

                        <span>
                            KEYSTONE // CASE INTAKE
                        </span>

                        <h1>
                            SUBMIT CASE
                        </h1>

                        <p>
                            Submit a completed investigation for administrative review.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="jp-submit-back"
                        onClick={() =>
                            navigate("/jp/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </header>


                <div className="jp-submit-divider" />


                <form
                    className="jp-submit-form"
                    onSubmit={handleSubmit}
                >

                    <div className="jp-submit-grid">

                        <label className="jp-submit-field">

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
                                    Select a panel
                                </option>

                                {
                                    availableTypes.map(
                                        option => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )
                                }

                            </select>

                        </label>


                        <label className="jp-submit-field">

                            <span>
                                CASE TITLE
                            </span>

                            <input
                                name="title"
                                value={form.title}
                                onChange={updateField}
                                placeholder="Brief investigation title"
                                maxLength={200}
                                required
                            />

                        </label>


                        <label className="jp-submit-field">

                            <span>
                                ROBLOX USERNAMES
                            </span>

                            <input
                                name="usernames"
                                value={form.usernames}
                                onChange={updateField}
                                placeholder="Name1 | Name2"
                            />

                        </label>


                        <label className="jp-submit-field">

                            <span>
                                ROBLOX USER IDS
                            </span>

                            <input
                                name="userIds"
                                value={form.userIds}
                                onChange={updateField}
                                placeholder="12345 | 67890"
                            />

                        </label>


                        <label className="jp-submit-field">

                            <span>
                                STRIKE
                            </span>

                            <input
                                type="number"
                                name="strike"
                                value={form.strike}
                                onChange={updateField}
                                min="0"
                                step="1"
                            />

                        </label>


                        <label className="jp-submit-field">

                            <span>
                                CASE STATUS
                            </span>

                            <select
                                name="caseStatus"
                                value={form.caseStatus}
                                onChange={updateField}
                            >
                                <option value="Active">
                                    Active
                                </option>
                                <option value="Inactive">
                                    Inactive
                                </option>
                                <option value="Monitoring">
                                    Monitoring
                                </option>
                                <option value="Closed">
                                    Closed
                                </option>
                            </select>

                        </label>


                        <label className="jp-submit-field">

                            <span>
                                START DATE
                            </span>

                            <input
                                type="datetime-local"
                                name="startDate"
                                value={form.startDate}
                                onChange={updateField}
                            />

                        </label>


                        <label className="jp-submit-field">

                            <span>
                                END DATE
                            </span>

                            <input
                                type="datetime-local"
                                name="endDate"
                                value={form.endDate}
                                onChange={updateField}
                            />

                        </label>

                    </div>


                    <label className="jp-submit-field jp-submit-wide">

                        <span>
                            INVESTIGATION SUMMARY
                        </span>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={updateField}
                            placeholder="Explain the conduct, timeline, findings, and reason for submission."
                            maxLength={10000}
                            required
                        />

                    </label>


                    <label className="jp-submit-field jp-submit-wide">

                        <span>
                            INTERNAL NOTES
                        </span>

                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={updateField}
                            placeholder="Optional internal notes for reviewers."
                            maxLength={20000}
                        />

                    </label>


                    <label className="jp-submit-field jp-submit-wide">

                        <span>
                            EVIDENCE LINKS OR AZURE IDS
                        </span>

                        <textarea
                            name="evidence"
                            value={form.evidence}
                            onChange={updateField}
                            placeholder="Place one URL or evidence ID per line."
                        />

                    </label>


                    {
                        error && (
                            <div className="jp-submit-message jp-submit-error">
                                {error}
                            </div>
                        )
                    }


                    {
                        success && (
                            <div className="jp-submit-message jp-submit-success">
                                {success}
                            </div>
                        )
                    }


                    <div className="jp-submit-actions">

                        <button
                            type="button"
                            className="jp-submit-secondary"
                            onClick={() =>
                                navigate("/jp/dashboard")
                            }
                        >
                            CANCEL
                        </button>

                        <button
                            type="submit"
                            className="jp-submit-primary"
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

            </div>

        </main>

    );
}


export default JPSubmitCase;
