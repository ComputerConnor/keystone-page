import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE from "../utils/api";

import "./JPCaseQueue.css";

function JPCaseQueue() {

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

            setUser(data.user);

            //
            // API comes later
            //

            const queue =
                await fetch(
                    `${API_BASE}/api/jp/cases`,
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

                        Loading Case Queue...

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

                            KEYSTONE // CASE MANAGEMENT

                        </span>

                        <h1>

                            CASE QUEUE

                        </h1>

                        <p>

                            Review assigned investigations.

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

                                No Cases Available

                            </h2>

                            <p>

                                Assigned investigations will appear here.

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

                                    Pending

                                </div>

                                <h2>

                                    {c.title}

                                </h2>

                                <p>

                                    Case #{c.id}

                                </p>

                            </div>

                        ))

                    }

                </div>

            </div>

        </main>

    );

}

export default JPCaseQueue;