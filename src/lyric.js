import AttackPattern from "./attack-patterns/attack-pattern";
import BulletShootPattern from "./attack-patterns/bullet-shoot-pattern";
import LinePattern from "./attack-patterns/line-pattern";

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
    }
    
    spawnTelegraph(isdirpos, params) {
        if (!isdirpos) {
            this.attack.telegraph.spawn(document.getElementById("telegraphs"), this.x, this.y, this.text);
            return;
        }

        if (this.attack.constructor === LinePattern) {
            this.attack.telegraph.spawn(document.getElementById("telegraphs"), this.x, this.y, this.text, { column: params.column });
        } else if (this.attack.constructor === BulletShootPattern) {
            this.attack.telegraph.spawn(document.getElementById("telegraphs"), this.x, this.y, this.text);
        } else if (this.attack.constructor === AttackPattern) {
            this.attack.telegraph.spawn(document.getElementById("telegraphs"), this.x, this.y, this.text, { angle: params.angle });
        }
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
                if (typeof this.attack.shoot(this.x, this.y, this.text, params) === "function") this.attack.shoot(this.x, this.y, this.text, params);
                if (typeof this.attack.telegraph.fadeOutAndRemove() === "function") this.attack.telegraph.fadeOutAndRemove();
            } else if (e.animationName === "fall") {
                this.text.classList.remove("bullet");
                this.text.classList.add("fadeout-fall");
                if (typeof this.attack.telegraph.fadeOutAndRemove() === "function") this.attack.telegraph.fadeOutAndRemove();
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