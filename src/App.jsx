import { BrowserRouter, Routes, Route } from "react-router-dom";

import MeshBackground from "./components/MeshBackground";

import Landing from "./pages/Landing";
import Home from "./pages/Home";

function App() {
    return (
        <BrowserRouter>

            <div className="app">

                <MeshBackground />

                <div className="page-layer">

                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/home" element={<Home />} />
                    </Routes>

                </div>

            </div>

        </BrowserRouter>
    );
}

export default App;