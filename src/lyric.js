import AttackPattern from "./attack-patterns/attack-pattern";
import BulletShootPattern from "./attack-patterns/bullet-shoot-pattern";
import LinePattern from "./attack-patterns/line-pattern";
import { glowParticles, lyrics } from "./game-loop";

export default class Lyric {
    constructor(unit, Attack, Telegraph) {
        this.id = this.generateUUID();
        
        this.attack = new Attack(Telegraph);

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

    spawn() {
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
    }

    onMovedIn(text, attack, params) {
        if (typeof attack.shoot(this.x, this.y, text, params) === "function") this.attack.shoot(this.x, this.y, text, params);
        if (typeof attack.telegraph.fadeOutAndRemove === "function") attack.telegraph.fadeOutAndRemove();
    }

    setPosAndMoveToEdge(x, y, endX, endY) {
        this.x = x;
        this.y = y;
        this.text.startX = x;
        this.text.startY = y;
        this.text.x = endX;
        this.text.y = endY;
        this.text.currentX = x;
        this.text.currentY = y;
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