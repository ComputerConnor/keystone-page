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
        pulse,
        setPulse
    ] =
        useState("");


    useEffect(
        () => {
            const timer =
                window.setInterval(
                    () => {
                        setPulse(
                            current =>
                                current.length >= 3
                                    ? ""
                                    : `${current}.`
                        );
                    },
                    450
                );

            return () =>
                window.clearInterval(
                    timer
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
                        padding: 32px;
                        box-sizing: border-box;
                        overflow: hidden;
                        position: relative;
                        color: #f4f4f4;
                        background:
                            radial-gradient(
                                circle at 20% 15%,
                                rgba(183, 27, 27, 0.15),
                                transparent 34%
                            ),
                            radial-gradient(
                                circle at 82% 78%,
                                rgba(145, 0, 0, 0.12),
                                transparent 30%
                            ),
                            linear-gradient(
                                145deg,
                                #070707 0%,
                                #0d0d0d 48%,
                                #050505 100%
                            );
                        font-family:
                            Inter,
                            ui-sans-serif,
                            system-ui,
                            -apple-system,
                            BlinkMacSystemFont,
                            "Segoe UI",
                            sans-serif;
                    }

                    .construction-page::before {
                        content: "";
                        position: absolute;
                        inset: 0;
                        opacity: 0.18;
                        pointer-events: none;
                        background-image:
                            linear-gradient(
                                rgba(255, 255, 255, 0.025) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                90deg,
                                rgba(255, 255, 255, 0.025) 1px,
                                transparent 1px
                            );
                        background-size: 38px 38px;
                        mask-image:
                            linear-gradient(
                                to bottom,
                                black,
                                transparent 90%
                            );
                    }

                    .construction-glow {
                        width: 440px;
                        height: 440px;
                        border-radius: 50%;
                        position: absolute;
                        filter: blur(120px);
                        opacity: 0.16;
                        pointer-events: none;
                        background: #ca1717;
                        animation:
                            constructionGlow 5s ease-in-out infinite;
                    }

                    .construction-shell {
                        width: min(100%, 900px);
                        position: relative;
                        z-index: 2;
                        border: 1px solid rgba(255, 255, 255, 0.09);
                        background:
                            linear-gradient(
                                145deg,
                                rgba(18, 18, 18, 0.97),
                                rgba(8, 8, 8, 0.98)
                            );
                        box-shadow:
                            0 30px 90px rgba(0, 0, 0, 0.58),
                            inset 0 1px 0 rgba(255, 255, 255, 0.04);
                    }

                    .construction-topbar {
                        min-height: 48px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 18px;
                        padding: 0 20px;
                        border-bottom:
                            1px solid rgba(255, 255, 255, 0.08);
                        background:
                            rgba(255, 255, 255, 0.02);
                    }

                    .construction-topbar span {
                        color: #a7a7a7;
                        font-family:
                            "Courier New",
                            monospace;
                        font-size: 0.72rem;
                        letter-spacing: 0.16em;
                    }

                    .construction-status {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        color: #d7d7d7;
                    }

                    .construction-status::before {
                        content: "";
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #d11d1d;
                        box-shadow:
                            0 0 12px rgba(209, 29, 29, 0.9);
                        animation:
                            constructionBlink 1.4s ease-in-out infinite;
                    }

                    .construction-content {
                        padding: clamp(42px, 7vw, 78px);
                    }

                    .construction-kicker {
                        margin: 0 0 16px;
                        color: #d02828;
                        font-family:
                            "Courier New",
                            monospace;
                        font-size: 0.74rem;
                        font-weight: 700;
                        letter-spacing: 0.18em;
                    }

                    .construction-title {
                        max-width: 700px;
                        margin: 0;
                        font-size:
                            clamp(
                                2.8rem,
                                8vw,
                                6.3rem
                            );
                        line-height: 0.88;
                        letter-spacing: -0.055em;
                        text-transform: uppercase;
                        font-weight: 900;
                    }

                    .construction-title strong {
                        display: block;
                        color: #d62222;
                        text-shadow:
                            0 0 32px rgba(214, 34, 34, 0.2);
                    }

                    .construction-description {
                        max-width: 650px;
                        margin: 28px 0 0;
                        color: #a9a9a9;
                        font-size: 1rem;
                        line-height: 1.8;
                    }

                    .construction-divider {
                        width: 100%;
                        height: 1px;
                        margin: 36px 0 26px;
                        background:
                            linear-gradient(
                                to right,
                                #ba1f1f,
                                rgba(255, 255, 255, 0.08),
                                transparent
                            );
                    }

                    .construction-terminal {
                        display: grid;
                        gap: 12px;
                        padding: 20px;
                        border:
                            1px solid rgba(255, 255, 255, 0.07);
                        background: #080808;
                        font-family:
                            "Courier New",
                            monospace;
                        font-size: 0.8rem;
                    }

                    .construction-terminal-line {
                        display: grid;
                        grid-template-columns:
                            minmax(110px, auto)
                            1fr;
                        gap: 16px;
                    }

                    .construction-terminal-line span:first-child {
                        color: #d02626;
                    }

                    .construction-terminal-line span:last-child {
                        color: #bdbdbd;
                    }

                    .construction-actions {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 12px;
                        margin-top: 28px;
                    }

                    .construction-button {
                        min-height: 46px;
                        padding: 0 22px;
                        border: 1px solid transparent;
                        cursor: pointer;
                        font: inherit;
                        font-size: 0.75rem;
                        font-weight: 800;
                        letter-spacing: 0.12em;
                        transition:
                            transform 160ms ease,
                            border-color 160ms ease,
                            background 160ms ease;
                    }

                    .construction-button:hover {
                        transform: translateY(-2px);
                    }

                    .construction-button-primary {
                        color: white;
                        border-color: #c82121;
                        background:
                            linear-gradient(
                                135deg,
                                #c51f1f,
                                #8e1010
                            );
                        box-shadow:
                            0 12px 28px rgba(181, 20, 20, 0.2);
                    }

                    .construction-button-primary:hover {
                        background:
                            linear-gradient(
                                135deg,
                                #df2929,
                                #a41313
                            );
                    }

                    .construction-button-secondary {
                        color: #d5d5d5;
                        border-color:
                            rgba(255, 255, 255, 0.12);
                        background:
                            rgba(255, 255, 255, 0.03);
                    }

                    .construction-button-secondary:hover {
                        border-color:
                            rgba(255, 255, 255, 0.25);
                        background:
                            rgba(255, 255, 255, 0.06);
                    }

                    .construction-footer {
                        display: flex;
                        justify-content: space-between;
                        gap: 18px;
                        padding: 16px 20px;
                        border-top:
                            1px solid rgba(255, 255, 255, 0.07);
                        color: #6f6f6f;
                        font-family:
                            "Courier New",
                            monospace;
                        font-size: 0.68rem;
                        letter-spacing: 0.12em;
                    }

                    @keyframes constructionBlink {
                        0%,
                        100% {
                            opacity: 0.35;
                        }

                        50% {
                            opacity: 1;
                        }
                    }

                    @keyframes constructionGlow {
                        0%,
                        100% {
                            transform: scale(0.92);
                            opacity: 0.11;
                        }

                        50% {
                            transform: scale(1.08);
                            opacity: 0.2;
                        }
                    }

                    @media (max-width: 640px) {
                        .construction-page {
                            padding: 16px;
                        }

                        .construction-topbar {
                            align-items: flex-start;
                            flex-direction: column;
                            padding-top: 14px;
                            padding-bottom: 14px;
                        }

                        .construction-content {
                            padding:
                                42px
                                24px;
                        }

                        .construction-title {
                            font-size:
                                clamp(
                                    2.6rem,
                                    17vw,
                                    4.8rem
                                );
                        }

                        .construction-terminal-line {
                            grid-template-columns: 1fr;
                            gap: 4px;
                        }

                        .construction-actions {
                            flex-direction: column;
                        }

                        .construction-button {
                            width: 100%;
                        }

                        .construction-footer {
                            flex-direction: column;
                        }
                    }

                    @media (
                        prefers-reduced-motion:
                        reduce
                    ) {
                        .construction-glow,
                        .construction-status::before {
                            animation: none;
                        }

                        .construction-button {
                            transition: none;
                        }
                    }
                `}
            </style>


            <div
                className="construction-glow"
                aria-hidden="true"
            />


            <section className="construction-shell">

                <header className="construction-topbar">

                    <span>
                        KEYSTONE // SYSTEM NOTICE
                    </span>

                    <span className="construction-status">
                        DEVELOPMENT ACTIVE
                    </span>

                </header>


                <div className="construction-content">

                    <p className="construction-kicker">
                        PAGE STATUS // 503
                    </p>

                    <h1 className="construction-title">
                        Under
                        <strong>
                            Construction
                        </strong>
                    </h1>

                    <p className="construction-description">
                        This section of Keystone is currently being built.
                    </p>


                    <div className="construction-divider" />


                    <div className="construction-terminal">

                        <div className="construction-terminal-line">
                            <span>
                                [STATUS]
                            </span>

                            <span>
                                PAGE BUILD IN PROGRESS{pulse}
                            </span>
                        </div>

                        <div className="construction-terminal-line">
                            <span>
                                [ACCESS]
                            </span>

                            <span>
                                TEMPORARILY RESTRICTED
                            </span>
                        </div>

                        <div className="construction-terminal-line">
                            <span>
                                [SYSTEM]
                            </span>

                            <span>
                                KEYSTONE
                            </span>
                        </div>

                    </div>


                    <div className="construction-actions">

                        <button
                            type="button"
                            className="construction-button construction-button-primary"
                            onClick={() =>
                                navigate("/home")
                            }
                        >
                            RETURN HOME
                        </button>

                        <button
                            type="button"
                            className="construction-button construction-button-secondary"
                            onClick={() =>
                                navigate(-1)
                            }
                        >
                            GO BACK
                        </button>

                    </div>

                </div>


                <footer className="construction-footer">

                    <span>
                        KEYSTONE
                    </span>

                </footer>

            </section>

        </main>
    );
}


export default UnderConstruction;
