import {
    useMemo,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API_BASE from "../utils/api";

import "./PublicSubmitCase.css";


const MAX_FILES =
    10;

const MAX_FILE_SIZE =
    1024 * 1024 * 1024;

const MAX_TOTAL_UPLOAD_SIZE =
    1024 * 1024 * 1024;

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
    appealedCaseId: "",
    appealReason: "",
    website: ""
};


function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) {
        return "Unknown size";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(
            bytes /
            (
                1024 *
                1024
            )
        ).toFixed(1)} MB`;
    }

    return `${(
        bytes /
        (
            1024 *
            1024 *
            1024
        )
    ).toFixed(2)} GB`;
}


function PublicSubmitCase() {
    const navigate =
        useNavigate();

    const fileInputRef =
        useRef(null);

    const [
        form,
        setForm
    ] =
        useState(INITIAL_FORM);

    const [
        mediaFiles,
        setMediaFiles
    ] =
        useState([]);

    const [
        submitting,
        setSubmitting
    ] =
        useState(false);

    const [
        uploadProgress,
        setUploadProgress
    ] =
        useState("");

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


    const isAppeal =
        form.caseType.endsWith(
            "_APPEAL"
        );


    const totalMediaSize =
        useMemo(
            () =>
                mediaFiles.reduce(
                    (
                        total,
                        file
                    ) =>
                        total +
                        file.size,
                    0
                ),
            [mediaFiles]
        );


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


    function addMediaFiles(event) {
        const selectedFiles =
            Array.from(
                event.target.files ||
                []
            );

        setError("");

        const combined =
            [
                ...mediaFiles,
                ...selectedFiles
            ];

        const unique =
            combined.filter(
                (
                    file,
                    index,
                    files
                ) =>
                    files.findIndex(
                        candidate =>
                            candidate.name ===
                                file.name &&
                            candidate.size ===
                                file.size &&
                            candidate.lastModified ===
                                file.lastModified
                    ) === index
            );

        if (
            unique.length >
            MAX_FILES
        ) {
            setError(
                `You can upload a maximum of ${MAX_FILES} files.`
            );

            event.target.value =
                "";

            return;
        }

        const oversized =
            unique.find(
                file =>
                    file.size >
                    MAX_FILE_SIZE
            );

        if (oversized) {
            setError(
                `${oversized.name} is larger than the 1 GB per-file limit.`
            );

            event.target.value =
                "";

            return;
        }

        const combinedSize =
            unique.reduce(
                (total, file) =>
                    total + file.size,
                0
            );

        if (
            combinedSize >
            MAX_TOTAL_UPLOAD_SIZE
        ) {
            setError(
                "The combined upload size cannot exceed 1 GB."
            );

            event.target.value =
                "";

            return;
        }

        setMediaFiles(
            unique
        );

        event.target.value =
            "";
    }


    function removeMediaFile(index) {
        setMediaFiles(
            current =>
                current.filter(
                    (
                        _,
                        currentIndex
                    ) =>
                        currentIndex !==
                        index
                )
        );
    }


    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setUploadProgress("");

        if (
            isAppeal &&
            !form.appealedCaseId.trim()
        ) {
            setError(
                "Enter the original case ID being appealed."
            );

            return;
        }

        if (
            isAppeal &&
            !form.appealReason.trim()
        ) {
            setError(
                "Explain the basis for the appeal."
            );

            return;
        }

        if (
            !form.evidence.trim() &&
            mediaFiles.length === 0
        ) {
            setError(
                "Provide at least one evidence link or upload at least one media file."
            );

            return;
        }

        setSubmitting(true);

        try {
            const body =
                new FormData();

            Object.entries(form)
                .forEach(
                    (
                        [
                            key,
                            value
                        ]
                    ) => {
                        body.append(
                            key,
                            value
                        );
                    }
                );

            mediaFiles.forEach(
                file => {
                    body.append(
                        "media",
                        file,
                        file.name
                    );
                }
            );

            setUploadProgress(
                mediaFiles.length > 0
                    ? `Uploading ${mediaFiles.length} media file${mediaFiles.length === 1 ? "" : "s"} and creating the queue entry...`
                    : "Creating the queue entry..."
            );

            const response =
                await fetch(
                    `${API_BASE}/api/public-submissions`,
                    {
                        method:
                            "POST",

                        credentials:
                            "include",

                        body
                    }
                );

            const responseText =
                await response.text();

            let data = {};

            try {
                data =
                    responseText
                        ? JSON.parse(
                            responseText
                        )
                        : {};
            } catch {
                data = {
                    error:
                        responseText ||
                        "The server returned an invalid response."
                };
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to submit the report."
                );
            }

            const uploadedCount =
                Number(
                    data.submission
                        ?.uploadedMediaCount ||
                    0
                );

            setSuccess(
                `Submission #${data.submission.id} was added to the administrative review queue${
                    uploadedCount > 0
                        ? ` with ${uploadedCount} uploaded media file${uploadedCount === 1 ? "" : "s"}.`
                        : "."
                }`
            );

            setForm(
                INITIAL_FORM
            );

            setMediaFiles([]);

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }

            setUploadProgress("");

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

            setUploadProgress("");

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
                            navigate("/home")
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


                {
                    uploadProgress && (
                        <div className="public-submit-message public-submit-progress">
                            {uploadProgress}
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
                                    DGN // Degenerate Case
                                </option>

                                <option value="XPLT">
                                    XPLT // Exploiter Case
                                </option>

                                <option value="DGN_APPEAL">
                                    DGN // Case Appeal
                                </option>

                                <option value="XPLT_APPEAL">
                                    XPLT // Case Appeal
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


                    {
                        isAppeal && (
                            <section className="public-submit-appeal">
                                <div className="public-submit-grid">
                                    <label className="public-submit-field">
                                        <span>
                                            ORIGINAL CASE ID
                                        </span>

                                        <input
                                            name="appealedCaseId"
                                            value={form.appealedCaseId}
                                            onChange={updateField}
                                            placeholder="Case ID being appealed"
                                            maxLength={30}
                                            required
                                        />
                                    </label>

                                    <label className="public-submit-field">
                                        <span>
                                            APPEAL TYPE
                                        </span>

                                        <input
                                            value={
                                                form.caseType === "DGN_APPEAL"
                                                    ? "DGN APPEAL"
                                                    : "XPLT APPEAL"
                                            }
                                            readOnly
                                        />
                                    </label>
                                </div>

                                <label className="public-submit-field public-submit-wide">
                                    <span>
                                        BASIS FOR APPEAL
                                    </span>

                                    <textarea
                                        name="appealReason"
                                        value={form.appealReason}
                                        onChange={updateField}
                                        placeholder="Explain what decision is being challenged, why it should be reconsidered, and what outcome you are requesting."
                                        maxLength={10000}
                                        required
                                    />
                                </label>
                            </section>
                        )
                    }


                    <label className="public-submit-field public-submit-wide">
                        <span>
                            {
                                isAppeal
                                    ? "APPEAL SUMMARY"
                                    : "REPORT SUMMARY"
                            }
                        </span>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={updateField}
                            placeholder={
                                isAppeal
                                    ? "Summarize the original case, the decision being appealed, and any relevant new context."
                                    : "Explain what happened, who was involved, and why this should be reviewed."
                            }
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
                            placeholder="Optional: place one image, video, document, Discord attachment, or other evidence URL per line."
                            maxLength={30000}
                        />

                        <small className="public-submit-field-help">
                            At least one evidence link or uploaded file is required.
                        </small>
                    </label>


                    <section className="public-submit-upload">

                        <div className="public-submit-upload-header">
                            <div>
                                <span>
                                    MEDIA UPLOADS
                                </span>

                                <p>
                                    Upload images, videos, audio, or documents.
                                    Maximum {MAX_FILES} files, 1 GB per file,
                                    and 1 GB combined per submission.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="public-submit-upload-button"
                                onClick={() =>
                                    fileInputRef.current
                                        ?.click()
                                }
                                disabled={
                                    submitting ||
                                    mediaFiles.length >=
                                        MAX_FILES
                                }
                            >
                                {
                                    mediaFiles.length >=
                                    MAX_FILES
                                        ? "FILE LIMIT REACHED"
                                        : "+ ADD MEDIA"
                                }
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            className="public-submit-file-input"
                            type="file"
                            name="media"
                            multiple
                            accept="image/*,video/*,audio/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx"
                            onChange={addMediaFiles}
                            disabled={
                                submitting ||
                                mediaFiles.length >=
                                    MAX_FILES
                            }
                        />

                        {
                            mediaFiles.length === 0
                                ? (
                                    <div className="public-submit-upload-empty">
                                        No media selected
                                    </div>
                                )
                                : (
                                    <div className="public-submit-file-list">
                                        {
                                            mediaFiles.map(
                                                (
                                                    file,
                                                    index
                                                ) => (
                                                    <div
                                                        className="public-submit-file"
                                                        key={`${file.name}-${file.size}-${file.lastModified}`}
                                                    >
                                                        <div>
                                                            <strong>
                                                                {file.name}
                                                            </strong>

                                                            <span>
                                                                {
                                                                    file.type ||
                                                                    "Unknown media"
                                                                } · {
                                                                    formatBytes(
                                                                        file.size
                                                                    )
                                                                }
                                                            </span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeMediaFile(
                                                                    index
                                                                )
                                                            }
                                                            disabled={submitting}
                                                            aria-label={`Remove ${file.name}`}
                                                        >
                                                            REMOVE
                                                        </button>
                                                    </div>
                                                )
                                            )
                                        }
                                    </div>
                                )
                        }

                        <div className="public-submit-upload-total">
                            <span>
                                SELECTED FILES
                            </span>

                            <strong>
                                {mediaFiles.length} · {
                                    formatBytes(
                                        totalMediaSize
                                    )
                                }
                            </strong>
                        </div>

                    </section>


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
                                navigate("/home")
                            }
                            disabled={submitting}
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
