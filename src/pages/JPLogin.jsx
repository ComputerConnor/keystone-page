import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API_BASE from "../utils/api";

import "./JPLogin.css";


function JPLogin() {
    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] =
        useState({
            username:
                "",

            password:
                "",

            code:
                ""
        });

    const [
        step,
        setStep
    ] =
        useState(
            "password"
        );

    const [
        error,
        setError
    ] =
        useState("");

    const [
        working,
        setWorking
    ] =
        useState(false);


    function update(event) {
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


    function restartLogin() {
        setStep(
            "password"
        );

        setError("");

        setForm(
            current => ({
                ...current,

                password:
                    "",

                code:
                    ""
            })
        );
    }


    async function readJsonResponse(
        response
    ) {
        const responseText =
            await response.text();

        if (!responseText) {
            return {};
        }

        try {
            return JSON.parse(
                responseText
            );
        } catch {
            throw new Error(
                "The login server returned an invalid response."
            );
        }
    }


    async function verifySession() {
        const response =
            await fetch(
                `${API_BASE}/api/jp/me`,
                {
                    method:
                        "GET",

                    credentials:
                        "include",

                    cache:
                        "no-store",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );

        if (response.ok) {
            return true;
        }

        if (
            response.status ===
            401
        ) {
            throw new Error(
                "Safari could not retain the login session. The Keystone API must use a keystone-swords.com subdomain rather than the Railway domain."
            );
        }

        const data =
            await readJsonResponse(
                response
            );

        throw new Error(
            data.error ||
            "Unable to verify the login session."
        );
    }


    async function submit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (working) {
            return;
        }

        setWorking(true);
        setError("");

        try {
            const isTwoFactor =
                step ===
                "twoFactor";

            const response =
                await fetch(
                    isTwoFactor
                        ? `${API_BASE}/api/jp/2fa/challenge`
                        : `${API_BASE}/api/jp/login`,
                    {
                        method:
                            "POST",

                        credentials:
                            "include",

                        cache:
                            "no-store",

                        headers: {
                            Accept:
                                "application/json",

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                isTwoFactor
                                    ? {
                                        code:
                                            form.code
                                                .replace(
                                                    /\D/g,
                                                    ""
                                                )
                                    }
                                    : {
                                        username:
                                            form.username
                                                .trim(),

                                        password:
                                            form.password
                                    }
                            )
                    }
                );

            const data =
                await readJsonResponse(
                    response
                );

            if (
                response.status ===
                    202 &&
                data.requiresTwoFactor
            ) {
                setForm(
                    current => ({
                        ...current,

                        code:
                            ""
                    })
                );

                setStep(
                    "twoFactor"
                );

                return;
            }

            if (!response.ok) {
                const message =
                    data.error ||
                    "Unable to sign in.";

                if (
                    isTwoFactor &&
                    message
                        .toLowerCase()
                        .includes(
                            "challenge expired"
                        )
                ) {
                    setStep(
                        "password"
                    );

                    setForm(
                        current => ({
                            ...current,

                            password:
                                "",

                            code:
                                ""
                        })
                    );

                    throw new Error(
                        "The two-factor challenge expired. Enter your password to begin again."
                    );
                }

                throw new Error(
                    message
                );
            }

            await verifySession();

            if (
                data.requiresTwoFactorSetup
            ) {
                navigate(
                    "/jp/settings?setup2fa=1",
                    {
                        replace:
                            true
                    }
                );
            } else {
                navigate(
                    "/jp/dashboard",
                    {
                        replace:
                            true
                    }
                );
            }
        } catch (loginError) {
            setError(
                loginError.message
            );
        } finally {
            setWorking(false);
        }
    }


    return (
        <main className="jp-login-page">
            <section className="jp-login-card">
                <header className="jp-login-header">
                    <span className="jp-login-label">
                        KEYSTONE // JUDICIAL PANEL
                    </span>

                    <h1>
                        {
                            step ===
                            "twoFactor"
                                ? "TWO-FACTOR VERIFICATION"
                                : "SECURE LOGIN"
                        }
                    </h1>

                    <p>
                        {
                            step ===
                            "twoFactor"
                                ? "Enter the six-digit code from your authenticator. This challenge remains valid for ten minutes."
                                : "Authenticate to access internal panel systems."
                        }
                    </p>
                </header>

                <form
                    onSubmit={
                        submit
                    }
                    noValidate
                >
                    {
                        step ===
                        "password"
                            ? (
                                <>
                                    <label className="jp-login-field">
                                        <span>
                                            USERNAME
                                        </span>

                                        <input
                                            type="text"
                                            name="username"
                                            value={
                                                form.username
                                            }
                                            onChange={
                                                update
                                            }
                                            autoComplete="username"
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            required
                                        />
                                    </label>

                                    <label className="jp-login-field">
                                        <span>
                                            PASSWORD
                                        </span>

                                        <input
                                            type="password"
                                            name="password"
                                            value={
                                                form.password
                                            }
                                            onChange={
                                                update
                                            }
                                            autoComplete="current-password"
                                            required
                                        />
                                    </label>
                                </>
                            )
                            : (
                                <label className="jp-login-field">
                                    <span>
                                        AUTHENTICATOR CODE
                                    </span>

                                    <input
                                        type="text"
                                        name="code"
                                        value={
                                            form.code
                                        }
                                        onChange={
                                            event =>
                                                setForm(
                                                    current => ({
                                                        ...current,

                                                        code:
                                                            event.target.value
                                                                .replace(
                                                                    /\D/g,
                                                                    ""
                                                                )
                                                                .slice(
                                                                    0,
                                                                    6
                                                                )
                                                    })
                                                )
                                        }
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        autoFocus
                                        required
                                    />
                                </label>
                            )
                    }

                    {
                        error && (
                            <div
                                className="jp-login-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )
                    }

                    <button
                        className="jp-login-primary"
                        type="submit"
                        disabled={
                            working
                        }
                    >
                        {
                            working
                                ? "VERIFYING..."
                                : step ===
                                    "twoFactor"
                                    ? "VERIFY CODE"
                                    : "SIGN IN"
                        }
                    </button>

                    {
                        step ===
                            "twoFactor" && (
                            <button
                                className="jp-login-secondary"
                                type="button"
                                disabled={
                                    working
                                }
                                onClick={
                                    restartLogin
                                }
                            >
                                START OVER
                            </button>
                        )
                    }
                </form>
            </section>
        </main>
    );
}


export default JPLogin;
