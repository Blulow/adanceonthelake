import AttackPattern from "./attack-pattern";

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
            const bullet = document.createElement("div");
            bullet.classList.add("bullet", "bullet-shoot");
            document.getElementById("bullets").appendChild(bullet);
            
            const playerPos = {
                x: params.playerPos.x,
                y: params.playerPos.y
            }
            
            let bulletX = x + text.clientWidth / 2 - bullet.clientWidth / 2;
            let bulletY = y + text.clientHeight / 2 - bullet.clientHeight / 2;
            bullet.style.left = `${this.x}px`;
            bullet.style.top = `${this.y}px`;
            
            const relX = playerPos.x - bulletX;
            const relY = playerPos.y - bulletY;
            const relLength = Math.hypot(relX, relY);
            const dirVec = { x: relX / relLength, y: relY / relLength };
            const angle = i * this.ANGLE;
            let dirX = dirVec.x * Math.cos(angle) - dirVec.y * Math.sin(angle);
            let dirY = dirVec.x * Math.sin(angle) + dirVec.y * Math.cos(angle);
            
            this.animate(bullet, bulletX, bulletY, { x: dirX, y: dirY });
        }
    }
    
    animate(bullet, x, y, dirVec)  {
        const step = () => {
            x += dirVec.x * this.SPEED;
            y += dirVec.y * this.SPEED;
            
            if (x + bullet.clientWidth <= 0 ||
                x >= window.innerWidth ||
                y + bullet.clientHeight <= 0 ||
                y >= window.innerHeight) {
                    bullet.remove();
            }
                
            bullet.style.left = `${x}px`;
            bullet.style.top = `${y}px`;
            
            requestAnimationFrame(step);
        }
        step();
    }
}