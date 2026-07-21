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

                    </Routes>

                </div>

            </div>

        </HashRouter>
    );
}

export default App;