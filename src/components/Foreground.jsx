import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { openGate } from "../utils/gate";

import emblemImage from "../assets/bladewatchemblem.png";
import swordImage from "../assets/bladewatchsword.png";

function Foreground() {
    const navigate = useNavigate();
    function enter(){
        openGate();
        setTimeout(() => {
            navigate("/home");
        }, 1500);
    }
    return (
        <main className="foreground">
            <div className="logo-stage">
                <img
                    className="logo-emblem"
                    src={emblemImage}
                    alt=""
                />

                <img
                    className="logo-sword"
                    src={swordImage}
                    alt="Keystone"
                />
            </div>
            <button
                className="enter-link"
                onClick={enter}
            >
                <span>[</span>
                <span>ENTER KEYSTONE</span>
                <span>]</span>
            </button>
        </main>
    );
}

export default Foreground;
