export default class Lyric {
    constructor(unit) {
        this.text = document.createElement("div");
        this.text.classList.add("text");
        this.text.innerText = unit.text;

        this.x = 0;
        this.y = 0;
    }

    spawn(parent) {
        if (!parent instanceof HTMLElement) return;
        parent.appendChild(this.text);
    }

    setPosAndMoveIn(x, y, startX, startY) {
        this.x = x;
        this.y = y;
        this.text.style.left = `${x}px`;
        this.text.style.top = `${y}px`;
        console.log()
        console.log([x, y]);
        this.text.style.setProperty("--start-x", `${startX}px`);
        this.text.style.setProperty("--start-y", `${startY}px`);
    }

    onFadeOut(action) {
        this.text.addEventListener("animationend", e => {
            if (e.animationName === "movein") {
                this.text.classList.add("fadeout");
            } else if (e.animationName === "fadeout") {
                action();
            }
        });
    }
}