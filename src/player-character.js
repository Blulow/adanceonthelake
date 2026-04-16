import Coin from "./coin";

export default class PlayerCharacter {
    constructor() {
        const maxWidth = Math.max(window.innerHeight, window.innerWidth);
        console.log(maxWidth);
        this.NORMAL_SPEED = maxWidth > 1024 ? 10 : 3;
        this.DASH_SPEED = maxWidth > 1024 ? 50 : 20;
        this.DASH_TIME = 100;
        this.DASH_COOLDOWN = 500;

        this.pc = document.createElement("div");
        this.pc.id = "player";

        this.velocity = { x: 0, y: 0 };
        this.x = 0;
        this.y = 0;
        this.speed = this.NORMAL_SPEED;

        this.hits = 0;
        this.coins = 0;

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
        this.joystickTouchId = null;
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
            if (e.target.closest("#play")) return;

            e.preventDefault();
            for (let touch of e.changedTouches) {
                if (this.joystickTouchId === null) {
                    this.joystickTouchId = touch.identifier;
                    this.joystick.style.visibility = "visible";
                    this.stick.style.visibility = "visible";
                    this.initialTouchPos.x = touch.clientX;
                    this.initialTouchPos.y = touch.clientY;
                    this.joystick.style.top = `${this.initialTouchPos.y - this.joystick.offsetHeight / 2}px`;
                    this.joystick.style.left = `${this.initialTouchPos.x - this.joystick.offsetWidth / 2}px`;
                    this.stick.style.top = `${this.initialTouchPos.y - this.stick.offsetHeight / 2}px`;
                    this.stick.style.left = `${this.initialTouchPos.x - this.stick.offsetWidth / 2}px`;
                    this.isMoving = true;
                    this.touch = true;
                } else {
                    if (this.isMoving && !this.isDashed) {
                        this.dash();
                        this.isDashed = true;
                    }
                }
            }
        }, { passive: false });

        window.addEventListener("touchmove", e => {
            if (e.target.closest("#play")) return;

            e.preventDefault();
            for (let touch of e.touches) {
                if (touch.identifier === this.joystickTouchId) {
                    this.touchPos.x = touch.clientX;
                    this.touchPos.y = touch.clientY;
                    this.updateJoystick();
                }
            }
        }, { passive: false });

        window.addEventListener("touchend", e => {
            this.touchEndHelper(e);
        });
        
        window.addEventListener("touchcancel", e => {
            this.touchEndHelper(e);    
        });
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
        if (this.x + veloNorm.x * this.speed <= window.innerWidth - this.pc.offsetWidth && this.x + veloNorm.x * this.speed >= 0) {
            this.x += veloNorm.x * this.speed;
        }
        if (this.y + veloNorm.y * this.speed <= window.innerHeight - this.pc.offsetHeight && this.y + veloNorm.y * this.speed >= 0) {
            this.y += veloNorm.y * this.speed;
        }
        this.pc.style.left = `${this.x}px`;
        this.pc.style.top = `${this.y}px`;

        const bulletCollisions = this.checkBulletCollisions();
        if (bulletCollisions) {
            if (bulletCollisions.length > 0) {
                bulletCollisions.forEach(e => {
                    if (!e.classList.contains("hit")) {
                        e.classList.add("hit");
                        if (e.classList.contains("beam")) e.classList.add("beam-hit");
                        else if (e.classList.contains("lyric-bullet")) e.classList.add("lyric-bullet-hit");
                        this.hits++;
                        document.getElementById("hit-count").innerText = this.hits;
                    }
                });
            }
        }

        const coinCollisions = this.checkCoinCollisions();
        if (coinCollisions) {
            if (coinCollisions.length > 0) {
                coinCollisions.forEach(e => {
                    if (!e.classList.contains("coin-spin-fade")) {
                        e.classList.add("coin-spin-fade");
                        this.coins++;
                        document.getElementById("coin-count").innerText = this.coins;
                        new Coin().spawn();
                    }
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

    checkBulletCollisions() {
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

    checkCoinCollisions() {
        if (this.isDashing) return;

        const hitbox = this.pc.getBoundingClientRect();
        const coins = [...document.getElementsByClassName("coin")];

        const collided = coins.filter(e => !(
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
        const relDist = Math.hypot(relWidth, relHeight);
        const unitDist = this.joystick.offsetWidth / 2;
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
        this.velocity.x = unitVec.x;
        this.velocity.y = unitVec.y;
    }

    touchEndHelper(e) {
        for (let touch of e.changedTouches) {
            if (touch.identifier === this.joystickTouchId) {
                this.joystick.style.visibility = "hidden";
                this.stick.style.visibility = "hidden";
                this.touch = false;
                this.joystickTouchId = null;
            }
        }
    }
}