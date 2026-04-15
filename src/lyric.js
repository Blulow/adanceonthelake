export default class Lyric {
    constructor(unit, Attack, Telegraph) {
        this.text = document.createElement("div");
        this.text.classList.add("text");
        this.text.innerText = unit.text;

        this.x = 0;
        this.y = 0;

        this.attack = new Attack(Telegraph);
    }

    spawn(parent) {
        parent.appendChild(this.text);
        this.attack.telegraph.spawn(document.getElementById("telegraphs"), this.x, this.y, this.text);
    }
    
    setPosAndMoveIn(x, y, startX, startY) {
        this.x = x;
        this.y = y;
        this.text.style.left = `${x}px`;
        this.text.style.top = `${y}px`;
        this.text.style.setProperty("--start-x", `${startX}px`);
        this.text.style.setProperty("--start-y", `${startY}px`);
    }

    onFadeOut(action, params) {
        this.text.addEventListener("animationend", e => {
            if (e.animationName === "movein") {
                this.text.classList.add("fadeout-movein");
                this.attack.shoot(this.x, this.y, this.text, params);
                this.attack.telegraph.fadeOutAndRemove();
            } else if (e.animationName === "fadeout") {
                this.text.style.display = "none";
                action();
            }
        });
    }

    setPosAndMoveToEdge(x, y, endX, endY) {
        this.x = x;
        this.y = y;
        this.text.style.left = `${x}px`;
        this.text.style.top = `${y}px`;
        this.text.style.setProperty("--end-x", `${endX}px`);
        this.text.style.setProperty("--end-y", `${endY}px`);
    }

    onMoveToEdge(action) {
        this.text.addEventListener("animationend", e => {
            if (e.animationName === "movetoedge") {
                this.text.classList.add("fadeout-movetoedge");
            } else if (e.animationName === "fadeout") {
                this.text.style.display = "none";
                action();
            }
        });
    }
}