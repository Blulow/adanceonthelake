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
                // const x = this.x + this.text.clientWidth / 2 - this.attack.bullet.clientWidth / 2;
                // const y = this.y + this.text.clientHeight / 2 - this.attack.bullet.clientHeight / 2;
                this.attack.shoot(this.x, this.y, this.text, params);
                this.attack.telegraph.fadeOutAndRemove();
            } else if (e.animationName === "fadeout") {
                action();
            }
        });
    }
}