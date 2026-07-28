import {
    HashRouter,
    Routes,
    Route
} from "react-router-dom";

import MeshBackground from "./components/MeshBackground";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import JPLogin from "./pages/JPLogin";
import JPDashboard from "./pages/JPDashboard";
import DegenChat from "./pages/DegenChat";
import ExploitChat from "./pages/ExploitChat";
import JPCaseQueue from "./pages/JPCaseQueue";
import JPSubmissionQueue from "./pages/JPSubmissionQueue";
import JPSubmitCase from "./pages/JPSubmitCase";

function App() {

    return (

        <HashRouter>

            <div className="app">

                <MeshBackground />

                <div className="page-layer">

                    <Routes>

                        <Route
                            path="/"
                            element={<Landing />}
                        />

                        <Route
                            path="/home"
                            element={<Home />}
                        />

                        <Route
                            path="/jp"
                            element={<JPLogin />}
                        />

                        <Route
                            path="/jp/dashboard"
                            element={<JPDashboard />}
                        />

                        <Route
                            path="/jp/chat/degen"
                            element={<DegenChat />}
                        />

                        <Route
                            path="/jp/chat/exploit"
                            element={<ExploitChat />}
                        />
                        <Route
                            path="/jp/cases"
                            element={<JPCaseQueue />}
                        />

                        <Route
                            path="/jp/submissions"
                            element={<JPSubmissionQueue />}
                        />
                        <Route
                            path="/jp/submit"
                            element={<JPSubmitCase />}
                        />

                    </Routes>

                </div>

            </div>

        </HashRouter>

    );

}

export default App;
