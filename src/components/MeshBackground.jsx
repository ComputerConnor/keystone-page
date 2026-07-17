import { useRef, useEffect } from "react";
import emblemImage from "../assets/bladewatchemblem.png";

function MeshBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let width;
        let height;

        function resizeCanvas() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)

            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        resizeCanvas();

        let animationFrameId;

        let targetX = width / 2;
        let targetY = height / 2;

        let pointerX = targetX;
        let pointerY = targetY;

        function pointerEventHandler(event) {
            targetX = event.clientX;
            targetY = event.clientY;
        }

        window.addEventListener("pointermove", pointerEventHandler);
        window.addEventListener("resize", resizeCanvas);

        const img = new Image();
        let formationStart = null;
        let targets = [];

        img.onload = () => {

            const scratch = document.createElement("canvas");
            const sctx = scratch.getContext("2d");
            scratch.width = img.width;
            scratch.height = img.height;
            sctx.drawImage(img, 0, 0);

            const pixels = sctx.getImageData(0, 0, img.width, img.height).data;

            for (let y = 0; y < img.height; y += 24) {
                for (let x = 0; x < img.width; x += 24) {
                    const alpha = pixels[(y * img.width + x) * 4 + 3] //if this pixel is >128 transparency
                    if (alpha > 128) {
                        targets.push({ x, y });
                    }
                }
            }

            console.log(targets.length)
            formationStart = performance.now();

        };

        img.src = emblemImage;

        function draw(time) {

            pointerX += (targetX - pointerX) * 0.195;
            pointerY += (targetY - pointerY) * 0.195;

            const spacing = width < 640 ? 34 : 28; //mobile
            const maxShadowBlur = width < 640 ? 9 : 16; //mobile
            const breath = 1 + Math.sin(time * 0.0005) * 0.028; //RETURN to this later and change fixed variables for mouse-over
            const scale = 220 / img.width;
            const duration = 1400;
            const elapsed = formationStart === null ? 0 : time - formationStart;
            const formation = Math.min(1, elapsed / duration);
            const zoneRadius = 400;
            const zoneDots = (Math.PI * zoneRadius * zoneRadius) / (spacing * spacing);
            const stride = Math.max(1, Math.floor(zoneDots / targets.length));
            let recruitIndex = 0;


            ctx.clearRect(0, 0, width, height); //added this to clear the first frame on callback
            let dotIndex = 0;
            for (let row = 0; row < height / spacing; row++) {
                for (let col = 0; col < width / spacing; col++) {

                    const baseX = col * spacing + (row % 2 === 1 ? spacing / 2 : 0);
                    const baseY = row * spacing;

                    const pulse = .5 + .15 * Math.sin(time * 0.002 + row * 0.44 + col * 0.31); //RETURN to this later and change fixed variables for mouse-over
                    const driftX =
                        Math.sin(
                            time * 0.00042 +
                            row * 0.37 +
                            col * 0.13) * 4.2 +
                        Math.sin(
                            time * 0.0003 +
                            baseY * 0.008
                        ) * 5.5;
                    const driftY =
                        Math.cos(
                            time * 0.00036 +
                            col * 0.31 +
                            row * 0.11
                        ) * 4.2 +
                        Math.cos(
                            time * 0.00027 +
                            baseX * 0.007
                        ) * 5.5;
                    const x = width / 2 + (baseX - width / 2) * breath + driftX;
                    const y = height / 2 + (baseY - height / 2) * breath + driftY;
                    const distance = Math.hypot(
                        x - pointerX,
                        y - pointerY
                    );
                    const proximity = Math.max(0, 1 - distance / 100);
                    const radius = 1 + proximity * 3;
                    const alpha = Math.min(1, pulse + proximity * 0.5);

                    const homeDistance = Math.hypot(baseX - width / 2, baseY - height / 2);

                    let target;
                    if (homeDistance < zoneRadius) {
                        if (recruitIndex % stride === 0) {
                            target = targets[recruitIndex / stride];
                        }
                        recruitIndex++;
                    }

                    let drawX = x;
                    let drawY = y;

                    if (target) {
                        const tx = width / 2 + (target.x - img.width / 2) * scale;
                        const ty = height / 2 + (target.y - img.height / 2) * scale;
                        drawX = x + (tx - x) * formation;
                        drawY = y + (ty - y) * formation;
                    }

                    ctx.fillStyle = `rgba(186, 108, 255, ${alpha})`;
                    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
                    ctx.shadowBlur = proximity * maxShadowBlur;
                    ctx.beginPath();
                    ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
                    ctx.fill();
                    dotIndex++;
                }
            }

            ctx.shadowBlur = 0; //if you delete this itll glow when you put your cursor on the bottom right. ask me how i know

            animationFrameId = requestAnimationFrame(draw);
        }

        animationFrameId = requestAnimationFrame(draw);

        return () => { //Cleanup
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("pointermove", pointerEventHandler)
            window.removeEventListener("resize", resizeCanvas)
        }

    }, []);

    return (
        <canvas ref={canvasRef}
            className="mesh-background"
        />
    );
}

export default MeshBackground;

//CHANGELOG
//Fixed pulse and finally got this around to numbers I like (wave and breath effect).
