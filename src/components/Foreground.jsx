import { useNavigate } from "react-router-dom";
import { setGateState } from "../utils/gate";

import emblemImage from "../assets/bladewatchemblem.png";
import swordImage from "../assets/bladewatchsword.png";

function Foreground() {
    const navigate = useNavigate();
    function enter() {
        setGateState("opening");
        setTimeout(() => {
            setGateState("open");
            navigate("/home");
        }, 1200);
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