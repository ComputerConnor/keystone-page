import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <Link
        className="keystone-logo"
        to="/home"
    >
        Keystone
    </Link>
  );
}

export default Navbar;