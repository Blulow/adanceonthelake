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
        this.dashCooldownBar.style.setProperty("--dash-cooldown", `${this.DASH_COOLDOWN / 1000}s`)
        this.dashCooldownBar.addEventListener("animationend", e => {
            if (this.dashCooldownBar.classList.contains("dash-cooldown-bar-active") && e.animationName === "dash-cooldown-bar-active") {
                this.dashCooldownBar.classList.remove("dash-cooldown-bar-active");
            }
        })
        this.pc.appendChild(this.dashCooldownBar);

        //mobile
        this.joystick = document.getElementById("joystick");
        this.stick = document.getElementById("stick");

        this.touch = false;
        this.initialTouchPos = { x: 0, y: 0 };
        this.touchPos = { x: 0, y: 0 };
        //

    }

    spawn() {
        document.getElementById("arena").appendChild(this.pc, this.joystick);
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

        window.addEventListener("touchstart", e => {
            this.joystick.style.visibility = "visible";
            this.stick.style.visibility = "visible";
            this.initialTouchPos.x = e.touches[0].clientX;
            this.initialTouchPos.y = e.touches[0].clientY;
            this.joystick.style.top = `${this.initialTouchPos.y - this.joystick.offsetHeight / 2}px`;
            this.joystick.style.left = `${this.initialTouchPos.x - this.joystick.offsetWidth / 2}px`;
            this.stick.style.top = `${this.initialTouchPos.y - this.joystick.offsetHeight / 2}px`;
            this.stick.style.left = `${this.initialTouchPos.x - this.joystick.offsetWidth / 2}px`;
            this.touch = true;
        });

        window.addEventListener("touchmove", e => {
            this.touchPos.x = e.touches[0].clientX;
            this.touchPos.y = e.touches[0].clientY;
            this.updateJoystick()
        });

        window.addEventListener("touchend", e => {
            this.joystick.style.visibility = "hidden";
            this.stick.style.visibility = "hidden";
            this.touch = false;
        })
    }

    update() {
        if (!this.touch) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

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

    updateJoystick() {
        const relWidth = this.touchPos.x - this.initialTouchPos.x;
        const relHeight = this.touchPos.y - this.initialTouchPos.y;
        //const relAngle = Math.atan(Math.abs(relWidth / relHeight));
        const relDist = Math.hypot(relWidth, relHeight);
        const unitDist = this.joystick.offsetWidth / 2;
        //const unitX = Math.sin(relAngle) * unitDist;
        //const unitY = Math.cos(relAngle) * unitDist;
        const unitVec = this.normalize({ x: relWidth, y: relHeight });
        if (relDist / unitDist > 1) {
            let posX = this.initialTouchPos.x + unitVec.x * unitDist;
            let posY = this.initialTouchPos.y + unitVec.y * unitDist;
            this.stick.style.top = `${posY - this.joystick.offsetHeight / 4}px`;
            this.stick.style.left = `${posX - this.joystick.offsetWidth / 4}px`;
        } else {
            this.stick.style.top = `${this.touchPos.y - this.joystick.offsetHeight / 4}px`;
            this.stick.style.left = `${this.touchPos.x - this.joystick.offsetWidth / 4}px`;
        }
        //console.log(unitX, unitY)
        this.velocity.x = unitVec.x;
        this.velocity.y = unitVec.y;
    }
}