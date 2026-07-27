import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE from "../utils/api";

import "./JPSubmissionQueue.css";

function JPSubmissionQueue() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState(null);

    const [cases, setCases] = useState([]);


    useEffect(() => {

        load();

    }, []);


    async function load() {

        try {

            const response =
                await fetch(
                    `${API_BASE}/api/jp/me`,
                    {
                        credentials: "include"
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(data.error);

            }

            if (

                data.user.category.toUpperCase() !== "ADMIN"

            ) {

                navigate("/jp/dashboard");

                return;

            }

            setUser(data.user);

            //
            // Will later fetch pending submissions
            //

            const queue =
                await fetch(
                    `${API_BASE}/api/jp/submissions`,
                    {
                        credentials:"include"
                    }
                );

            setCases(
                await queue.json()
            );

        }

        catch (err) {

            console.error(err);

            navigate("/jp");

        }

        finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <main className="jp-case-page">

                <div className="jp-case-shell">

                    <h1>

                        Loading Submission Queue...

                    </h1>

                </div>

            </main>

        );

    }


    return (

        <main className="jp-case-page">

            <div className="jp-case-shell">

                <header className="jp-case-header">

                    <div>

                        <span>

                            KEYSTONE // ADMIN

                        </span>

                        <h1>

                            SUBMISSION QUEUE

                        </h1>

                        <p>

                            Review investigator submissions.

                        </p>

                    </div>

                    <button
                        className="jp-back-button"
                        onClick={() => navigate("/jp/dashboard")}
                    >

                        ← Dashboard

                    </button>

                </header>


                <div className="jp-divider" />


                {

                    cases.length === 0 && (

                        <div className="jp-empty">

                            <h2>

                                No Pending Submissions

                            </h2>

                            <p>

                                Investigations awaiting approval will appear here.

                            </p>

                        </div>

                    )

                }


                <div className="jp-case-grid">

                    {

                        cases.map((c) => (

                            <div
                                className="jp-case-card"
                                key={c.id}
                            >

                                <div className="jp-case-status">

                                    Awaiting Review

                                </div>

                                <h2>

                                    {c.title}

                                </h2>

                                <button>

                                    Approve

                                </button>

                                <button>

                                    Return

                                </button>

                            </div>

                        ))

                    }

                </div>

            </div>

        </main>

    );

}

export default JPSubmissionQueue;