export default class PlayerCharacter {
    constructor() {
        this.pc = document.createElement("div");
        this.pc.classList.add("player");

        this.velocity = { x: 0, y: 0 };
        this.x = 0;
        this.y = 0;
        this.speed = 7;
    }

    spawn() {
        document.getElementById("arena").appendChild(this.pc);
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.pc.style.top = `${this.y}px`;
        this.pc.style.left = `${this.x}px`;
        window.addEventListener("keydown", e => {
            switch(e.key) {
                case "ArrowUp":
                    this.velocity.y = -1;
                    break;
                case "ArrowDown":
                    this.velocity.y = 1;
                    break;
                case "ArrowLeft":
                    this.velocity.x = -1;
                    break;
                case "ArrowRight":
                    this.velocity.x = 1;
                    break;
            }
        });
        window.addEventListener("keyup", e => {
            switch(e.key) {
                case "ArrowUp":
                    this.velocity.y = 0;
                    break;
                case "ArrowDown":
                    this.velocity.y = 0;
                    break;
                case "ArrowLeft":
                    this.velocity.x = 0;
                    break;
                case "ArrowRight":
                    this.velocity.x = 0;
                    break;
            }
        });
    }

    update() {
        const veloNorm = this.normalize(this.velocity);
        this.x += veloNorm.x * this.speed;
        this.y += veloNorm.y * this.speed;
        this.pc.style.top = `${this.y}px`;
        this.pc.style.left = `${this.x}px`;

        const collisions = this.checkCollisions();
        if (collisions.length > 0) {
            collisions.forEach(e => {
                e.style.backgroundColor = "#00ff00";
            });
        }
    }

    normalize(v) {
        const length = Math.hypot(v.x, v.y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: v.x / length, y: v.y / length };
    }

    checkCollisions() {
        const hitbox = this.pc.getBoundingClientRect();
        const bullets = [...document.getElementsByClassName("bullet")];

        const collided = bullets.filter(e => !(
            hitbox.right < e.getBoundingClientRect().left || 
            hitbox.left > e.getBoundingClientRect().right || 
            hitbox.bottom < e.getBoundingClientRect().top || 
            hitbox.top > e.getBoundingClientRect().bottom
        ));

        return collided;
    }
}