import {
    HashRouter,
    Routes,
    Route
} from "react-router-dom";

import MeshBackground from "./components/MeshBackground";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Cases from "./pages/Cases";
import JPLogin from "./pages/JPLogin";
import JPDashboard from "./pages/JPDashboard";
import DegenChat from "./pages/DegenChat";
import ExploitChat from "./pages/ExploitChat";
import JPCaseQueue from "./pages/JPCaseQueue";
import JPSubmissionQueue from "./pages/JPSubmissionQueue";
import JPWorkspaces from "./pages/JPWorkspaces";
import JPWorkspace from "./pages/JPWorkspace";
import JPSubmitCase from "./pages/JPSubmitCase";
import PublicSubmitCase from "./pages/PublicSubmitCase";
import Tierlist from "./pages/Tierlist";
import GroupTier from "./pages/GroupTier";
import JPSettings from "./pages/JPSettings";
import JPPanelAdmin from "./pages/JPPanelAdmin";

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
                            path="/cases"
                            element={<Cases />}
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
                            path="/jp/workspaces"
                            element={<JPWorkspaces />}
                        />

                        <Route
                            path="/jp/workspaces/:workspaceId"
                            element={<JPWorkspace />}
                        />

                        <Route
                            path="/jp/submit"
                            element={<JPSubmitCase />}
                        />

                        <Route
                            path="/submit-case"
                            element={<PublicSubmitCase />}
                        />

                        <Route
                            path="/tierlist"
                            element={<Tierlist />}
                        />

                        <Route
                            path="/groups"
                            element={<GroupTier />}
                        />

                        <Route
                            path="/jp/settings"
                            element={<JPSettings />}
                        />

                        <Route
                            path="/jp/panel-admin"
                            element={<JPPanelAdmin />}
                        />

                    </Routes>

                </div>

            </div>

        </HashRouter>
    );
}

export default App;
