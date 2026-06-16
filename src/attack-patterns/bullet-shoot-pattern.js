import AttackPattern from "./attack-pattern";
import { shotBullets } from "../game-loop";

export default class BulletShootPattern extends AttackPattern {
    constructor(Telegraph) {
        super(Telegraph);
        this.bullet.remove();

        this.playerPos = { x: 0, y: 0 };
        const maxWidth = Math.max(window.innerHeight, window.innerWidth);
        this.SPEED = maxWidth > 1024 ? 5 : 2;
        this.ANGLE = Math.PI / 3;
    }
    
    shoot(x, y, text, params) {
        for (let i = -1; i <= 1; i++) {
            const bullet = { hit: false, speed: this.SPEED };
            
            console.log(params);
            const playerPos = {
                x: params.playerPos.x,
                y: params.playerPos.y
            }
            
            bullet.size = window.innerWidth * 0.01;
            bullet.x = x + text.size / 2 - bullet.size / 2;
            bullet.y = y + text.size / 2 - bullet.size / 2;
            
            const relX = playerPos.x - bullet.x;
            const relY = playerPos.y - bullet.y;
            const relLength = Math.hypot(relX, relY);
            const dirVec = { x: relX / relLength, y: relY / relLength };
            const angle = i * this.ANGLE;
            const dirX = dirVec.x * Math.cos(angle) - dirVec.y * Math.sin(angle);
            const dirY = dirVec.x * Math.sin(angle) + dirVec.y * Math.cos(angle);
            bullet.dir = { x: dirX, y: dirY };
            
            const id = this.generateUUID();
            shotBullets[id] = bullet;
        }
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