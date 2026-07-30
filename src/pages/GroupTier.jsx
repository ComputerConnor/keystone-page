import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";


function UnderConstruction() {
    const navigate =
        useNavigate();

    const [
        dots,
        setDots
    ] =
        useState("");


    useEffect(
        () => {
            const interval =
                window.setInterval(
                    () => {
                        setDots(
                            current =>
                                current.length >= 3
                                    ? ""
                                    : `${current}.`
                        );
                    },
                    500
                );

            return () =>
                window.clearInterval(
                    interval
                );
        },
        []
    );


    return (
        <main className="construction-page">

            <style>
                {`
                    .construction-page {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                        box-sizing: border-box;
                        position: relative;
                        color: #eeeaf8;
                        font-family:
                            Inter,
                            ui-sans-serif,
                            system-ui,
                            -apple-system,
                            BlinkMacSystemFont,
                            "Segoe UI",
                            sans-serif;
                    }

                    .construction-card {
                        width: min(100%, 520px);
                        padding: 28px;
                        box-sizing: border-box;
                        position: relative;
                        overflow: hidden;
                        border:
                            1px solid rgba(161, 126, 255, 0.18);
                        border-radius: 16px;
                        background:
                            linear-gradient(
                                145deg,
                                rgba(25, 21, 35, 0.9),
                                rgba(14, 12, 21, 0.92)
                            );
                        box-shadow:
                            0 18px 55px rgba(0, 0, 0, 0.34),
                            inset 0 1px 0 rgba(255, 255, 255, 0.035);
                        backdrop-filter: blur(16px);
                    }

                    .construction-card::before {
                        content: "";
                        width: 210px;
                        height: 210px;
                        position: absolute;
                        top: -130px;
                        right: -90px;
                        border-radius: 50%;
                        pointer-events: none;
                        background:
                            rgba(139, 92, 246, 0.12);
                        filter: blur(34px);
                    }

                    .construction-status {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 18px;
                        color: #a998d4;
                        font-size: 0.68rem;
                        font-weight: 700;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                    }

                    .construction-status-dot {
                        width: 7px;
                        height: 7px;
                        border-radius: 50%;
                        background: #9b7af3;
                        box-shadow:
                            0 0 10px rgba(155, 122, 243, 0.55);
                        animation:
                            constructionPulse 1.8s ease-in-out infinite;
                    }

                    .construction-eyebrow {
                        margin: 0 0 8px;
                        color: #8d78c5;
                        font-size: 0.7rem;
                        font-weight: 700;
                        letter-spacing: 0.13em;
                        text-transform: uppercase;
                    }

                    .construction-title {
                        margin: 0;
                        color: #f2eefb;
                        font-size:
                            clamp(
                                1.75rem,
                                6vw,
                                2.35rem
                            );
                        line-height: 1.1;
                        letter-spacing: -0.035em;
                    }

                    .construction-description {
                        margin: 14px 0 0;
                        color: #aaa2bb;
                        font-size: 0.9rem;
                        line-height: 1.65;
                    }

                    .construction-progress {
                        margin-top: 22px;
                        padding: 14px 16px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                        border:
                            1px solid rgba(161, 126, 255, 0.1);
                        border-radius: 10px;
                        background:
                            rgba(120, 90, 180, 0.055);
                    }

                    .construction-progress span {
                        color: #8f86a2;
                        font-size: 0.68rem;
                        font-weight: 700;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                    }

                    .construction-progress strong {
                        color: #b9a8e7;
                        font-family:
                            "Courier New",
                            monospace;
                        font-size: 0.75rem;
                        font-weight: 600;
                    }

                    .construction-actions {
                        display: flex;
                        gap: 10px;
                        margin-top: 22px;
                    }

                    .construction-button {
                        min-height: 40px;
                        padding: 0 16px;
                        border-radius: 9px;
                        cursor: pointer;
                        font: inherit;
                        font-size: 0.7rem;
                        font-weight: 750;
                        letter-spacing: 0.09em;
                        text-transform: uppercase;
                        transition:
                            transform 150ms ease,
                            border-color 150ms ease,
                            background 150ms ease;
                    }

                    .construction-button:hover {
                        transform: translateY(-1px);
                    }

                    .construction-button-primary {
                        color: #f8f5ff;
                        border:
                            1px solid rgba(160, 126, 255, 0.48);
                        background:
                            linear-gradient(
                                135deg,
                                rgba(125, 89, 218, 0.92),
                                rgba(91, 62, 165, 0.92)
                            );
                    }

                    .construction-button-primary:hover {
                        border-color:
                            rgba(184, 157, 255, 0.72);
                        background:
                            linear-gradient(
                                135deg,
                                rgba(140, 101, 235, 0.96),
                                rgba(101, 69, 180, 0.96)
                            );
                    }

                    .construction-button-secondary {
                        color: #aaa2b8;
                        border:
                            1px solid rgba(255, 255, 255, 0.08);
                        background:
                            rgba(255, 255, 255, 0.025);
                    }

                    .construction-button-secondary:hover {
                        color: #d8d1e7;
                        border-color:
                            rgba(161, 126, 255, 0.2);
                        background:
                            rgba(161, 126, 255, 0.055);
                    }

                    .construction-footer {
                        margin-top: 20px;
                        padding-top: 16px;
                        border-top:
                            1px solid rgba(255, 255, 255, 0.055);
                        color: #675f78;
                        font-size: 0.64rem;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                    }

                    @keyframes constructionPulse {
                        0%,
                        100% {
                            opacity: 0.45;
                            transform: scale(0.9);
                        }

                        50% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    @media (max-width: 540px) {
                        .construction-page {
                            padding: 16px;
                        }

                        .construction-card {
                            padding: 22px;
                            border-radius: 14px;
                        }

                        .construction-actions {
                            flex-direction: column;
                        }

                        .construction-button {
                            width: 100%;
                        }

                        .construction-progress {
                            align-items: flex-start;
                            flex-direction: column;
                            gap: 6px;
                        }
                    }

                    @media (
                        prefers-reduced-motion:
                        reduce
                    ) {
                        .construction-status-dot {
                            animation: none;
                        }

                        .construction-button {
                            transition: none;
                        }
                    }
                `}
            </style>


            <section className="construction-card">

                <div className="construction-status">
                    <span
                        className="construction-status-dot"
                        aria-hidden="true"
                    />

                    Development in progress
                </div>


                <p className="construction-eyebrow">
                    Keystone
                </p>

                <h1 className="construction-title">
                    This page is under construction
                </h1>

                <p className="construction-description">
                    This section is still being prepared.
                    Check back later once development is complete.
                </p>


                <div className="construction-progress">

                    <span>
                        Current status
                    </span>

                    <strong>
                        Building{dots}
                    </strong>

                </div>


                <div className="construction-actions">

                    <button
                        type="button"
                        className="construction-button construction-button-primary"
                        onClick={() =>
                            navigate("/home")
                        }
                    >
                        Return home
                    </button>

                    <button
                        type="button"
                        className="construction-button construction-button-secondary"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        Go back
                    </button>

                </div>


                <footer className="construction-footer">
                    Keystone Network
                </footer>

            </section>

        </main>
    );
}


export default UnderConstruction;
