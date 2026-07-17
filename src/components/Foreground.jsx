import emblemImage from "../assets/bladewatchemblem.png";
import swordImage from "../assets/bladewatchsword.png";

function Foreground() {
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
                    alt="BladeWatch"
                />
            </div>

            <a className="enter-link" href="#database">
                <span>[</span>
                <span>ENTER BLADEWATCH</span>
                <span>]</span>
            </a>
        </main>
    );
}

export default Foreground;
