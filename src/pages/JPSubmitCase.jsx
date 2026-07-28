import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE from "../utils/api";

import "./JPSubmitCase.css";


function JPSubmitCase() {

    const navigate = useNavigate();


    const [form, setForm] = useState({

        caseType:"",
        title:"",
        description:""

    });


    const [error,setError] = useState("");

    const [loading,setLoading] = useState(false);



    function update(e){

        setForm({

            ...form,

            [e.target.name]:
                e.target.value

        });

    }



    async function submit(){


        setLoading(true);

        setError("");


        try {


            const response =
                await fetch(

                    `${API_BASE}/api/jp/submit`,

                    {

                        method:"POST",

                        credentials:"include",

                        headers:{

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(form)

                    }

                );


            const data =
                await response.json();



            if(!response.ok){

                throw new Error(
                    data.error
                );

            }



            navigate(
                "/jp/dashboard"
            );


        }

        catch(err){

            console.error(err);

            setError(
                err.message
            );

        }

        finally{

            setLoading(false);

        }

    }



    return (

        <main className="jp-submit-page">


            <div className="jp-submit-shell">


                <header>


                    <span>
                        KEYSTONE // INVESTIGATION
                    </span>


                    <h1>
                        SUBMIT CASE
                    </h1>


                    <p>
                        Submit an investigation for review.
                    </p>


                </header>



                <section className="jp-submit-card">


                    <label>
                        Case Type
                    </label>


                    <select

                        name="caseType"

                        value={form.caseType}

                        onChange={update}

                    >

                        <option value="">
                            Select Type
                        </option>

                        <option value="DGN">
                            Degenerate
                        </option>

                        <option value="XPLT">
                            Exploiter
                        </option>


                    </select>



                    <label>
                        Title
                    </label>


                    <input

                        name="title"

                        value={form.title}

                        onChange={update}

                        placeholder="Case title"

                    />



                    <label>
                        Description
                    </label>


                    <textarea

                        name="description"

                        value={form.description}

                        onChange={update}

                        placeholder="Explain the case..."

                    />



                    {
                        error &&
                        <p className="error">
                            {error}
                        </p>
                    }



                    <button

                        disabled={loading}

                        onClick={submit}

                    >

                        {
                            loading
                            ?
                            "Submitting..."
                            :
                            "Submit Case"
                        }


                    </button>


                </section>


            </div>


        </main>

    );


}


export default JPSubmitCase;
