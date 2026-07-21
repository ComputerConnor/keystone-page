import {
    HashRouter,
    Routes,
    Route
} from "react-router-dom";

import MeshBackground from "./components/MeshBackground";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import JPLogin from "./pages/JPLogin";

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

                    </Routes>

                </div>

            </div>

        </HashRouter>
    );
}

export default App;