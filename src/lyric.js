import AttackPattern from "./attack-patterns/attack-pattern";
import BulletShootPattern from "./attack-patterns/bullet-shoot-pattern";
import LinePattern from "./attack-patterns/line-pattern";
import { glowParticles, lyrics } from "./game-loop";

export default class Lyric {
    constructor(unit, Attack, Telegraph) {
        //this.text = document.createElement("div");
        //this.text.classList.add("text");
        //this.text.innerText = unit.text;
        
        //this.x = 0;
        //this.y = 0;
        this.id = this.generateUUID();
        
        this.attack = new Attack(Telegraph);
        this.params = {};

        this.text = {
            text: unit.text,
            size: window.innerWidth * 0.07,
            progress: 0,
            fadeProgress: 0,
            start: performance.now(),
            fadeStart: null,
            attack: this.attack,
            params: this.params,
            onMovedIn: this.onMovedIn
        }
    }

    spawn(parent) {
        //parent.appendChild(this.text);
        lyrics[this.id] = this.text;
        window.setTimeout(() => this.spawnGlow(), 1500);
    }

    spawnGlow() {
        const size = window.innerWidth * 0.15;
        
        glowParticles.push({ text: this.text, size, start: performance.now() });
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
        this.text.x = x;
        this.text.y = y;
        this.text.startX = startX;
        this.text.startY = startY;
        this.text.currentX = startX;
        this.text.currentY = startY;
        //this.text.style.setProperty("--start-x", `${startX}px`);
        //this.text.style.setProperty("--start-y", `${startY}px`);
    }

    // onFadeOut(action) {
    //     this.text.addEventListener("animationend", e => {
    //         if (e.animationName === "movein") {
    //             this.text.classList.add("fadeout-movein");
    //             if (typeof this.attack.shoot(this.x, this.y, this.text, this.params) === "function") this.attack.shoot(this.x, this.y, this.text, this.params);
    //             if (typeof this.attack.telegraph.fadeOutAndRemove() === "function") this.attack.telegraph.fadeOutAndRemove();
    //         } else if (e.animationName === "fall") {
    //             this.text.classList.remove("bullet");
    //             this.text.classList.add("fadeout-fall");
    //             if (typeof this.attack.telegraph.fadeOutAndRemove() === "function") this.attack.telegraph.fadeOutAndRemove();
    //         } else if (e.animationName === "fadeout") {
    //             this.text.style.display = "none";
    //             action();
    //         }
    //     });
    // }

    onMovedIn(attack, params) {
        if (typeof attack.shoot(this.x, this.y, this.text, params) === "function") this.attack.shoot(this.x, this.y, this.text, params);
        if (typeof attack.telegraph.fadeOutAndRemove() === "function") attack.telegraph.fadeOutAndRemove();
    }

    setPosAndMoveToEdge(x, y, endX, endY) {
        this.x = x;
        this.y = y;
        this.text.x = x;
        this.text.y = y;
        this.text.endX = endX;
        this.text.endY = endY;
        //this.text.style.setProperty("--end-x", `${endX}px`);
        //this.text.style.setProperty("--end-y", `${endY}px`);
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

    generateUUID() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}