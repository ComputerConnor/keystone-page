import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home(){
    return(
        <div className="home-page">
            <Navbar />
            <main className="home-content">
                <h1>
                    KEYSTONE
                </h1>
                <div className="home-menu">
                    <Link to="/cases">
                        CASES
                    </Link>
                    <Link to="/tierlist">
                        TIERLIST
                    </Link>
                    <Link to="/groups">
                        GROUP TIERS
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default Home;