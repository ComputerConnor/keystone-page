import { Link } from "react-router-dom";
import { setGateState } from "../utils/gate";
import "./Navbar.css";

function Navbar() {

    function returnHome(){
        setGateState("closing");
    }

    return (
        <Link
            className="keystone-logo"
            to="/"
            onClick={returnHome}
        >
            Main Page
        </Link>
    );
}

export default Navbar;