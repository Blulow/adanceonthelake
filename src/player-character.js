export default class PlayerCharacter {
    constructor() {
        this.NORMAL_SPEED = 7;
        this.DASH_SPEED = 50;
        this.DASH_TIME = 100;
        this.DASH_COOLDOWN = 500;

        this.pc = document.createElement("div");
        this.pc.classList.add("player");

        this.velocity = { x: 0, y: 0 };
        this.x = 0;
        this.y = 0;
        this.speed = this.NORMAL_SPEED;

        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
        };
        this.isMoving = false;
        this.isDashed = false;
        this.isDashing = false;
        this.isDashCoolDownFinished = false;

        this.dashCooldownBar = document.createElement("div");
        this.dashCooldownBar.classList.add("dash-cooldown-bar");
        this.dashCooldownBar.style.setProperty("--dash-cooldown", `${this.DASH_COOLDOWN/1000}s`)
        this.dashCooldownBar.addEventListener("animationend", e => {
            if (this.dashCooldownBar.classList.contains("dash-cooldown-bar-active") && e.animationName === "dash-cooldown-bar-active") {
                this.dashCooldownBar.classList.remove("dash-cooldown-bar-active");
            }
        })
        this.pc.appendChild(this.dashCooldownBar);
    }

    spawn() {
        document.getElementById("arena").appendChild(this.pc);
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.pc.style.top = `${this.y}px`;
        this.pc.style.left = `${this.x}px`;
        window.addEventListener("keydown", e => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.isMoving = true;
                this.keys[e.key] = true;
            }
            if (e.key === "Shift") {
                if (this.isMoving && !this.isDashed) {
                    this.dash();
                    this.isDashed = true;
                }
            }
        });
        window.addEventListener("keyup", e => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.isMoving = true;
                this.keys[e.key] = false;
            }
        });
    }

    update() {
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (this.keys.ArrowUp) this.velocity.y -= 1;
        if (this.keys.ArrowDown) this.velocity.y += 1;
        if (this.keys.ArrowLeft) this.velocity.x -= 1;
        if (this.keys.ArrowRight) this.velocity.x += 1;
        
        const veloNorm = this.normalize(this.velocity);
        this.x += veloNorm.x * this.speed;
        this.y += veloNorm.y * this.speed;
        this.pc.style.top = `${this.y}px`;
        this.pc.style.left = `${this.x}px`;

        const collisions = this.checkCollisions();
        if (collisions) {
            if (collisions.length > 0) {
                collisions.forEach(e => {
                    e.style.backgroundColor = "#00ff00";
                });
            }
        }
        
        if (this.isDashCoolDownFinished) this.isDashed = false;
    }

    normalize(v) {
        const length = Math.hypot(v.x, v.y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: v.x / length, y: v.y / length };
    }

    checkCollisions() {
        if (this.isDashing) return;

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

    dash() {
        this.isDashing = true;
        this.isDashCoolDownFinished = false;
        this.speed = this.DASH_SPEED;
        setTimeout(() => {
            this.speed = this.NORMAL_SPEED;
            this.dashCooldownBar.classList.add("dash-cooldown-bar-active");
            this.isDashing = false;
        }, this.DASH_TIME);
        setTimeout(() => {
            this.isDashCoolDownFinished = true;
        }, this.DASH_COOLDOWN);
    }
}