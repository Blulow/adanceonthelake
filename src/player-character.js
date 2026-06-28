import { shotBullets } from "./game-loop";
import Coin from "./coin";
import { lyrics } from "./game-loop";
import { settings } from "./settings";

export default class PlayerCharacter {
    constructor() {
        const maxWidth = Math.max(window.innerHeight, window.innerWidth);
        this.NORMAL_SPEED = maxWidth > 1024 ? 10 : 7;
        this.DASH_SPEED = maxWidth > 1024 ? 50 : 20;
        this.DASH_TIME = 100;
        this.DASH_COOLDOWN = 500;

        this.pc = document.createElement("div");
        this.pc.id = "player";

        this.sprite = document.createElement("div");
        this.sprite.classList.add("sprite");
        this.pc.appendChild(this.sprite);

        this.velocity = { x: 0, y: 0 };
        this.x = 0;
        this.y = 0;
        this.speed = this.NORMAL_SPEED;

        this.hits = 0;
        this.coins = 0;
        this.coinCombo = 0;
        this.maxCombo = 0;
        this.score = 0;
        this.comboBonus = 0;
        this.maxScore = 0;

        this.hitbox = document.createElement("div");
        this.hitbox.classList.add("hitbox");
        this.pc.appendChild(this.hitbox);

        this._settings = JSON.parse(localStorage.getItem("settings")) ?? settings;

        this.keys = {
            moveUp: false,
            moveDown: false,
            moveLeft: false,
            moveRight: false,
        };
        this.isDashed = false;
        this.isDashing = false;
        this.isDashCoolDownFinished = false;

        this.pressed = [];

        this.dirs = {
            BOTTOM: 0,
            BOTTOMRIGHT: 1,
            RIGHT: 2,
            TOPRIGHT: 3,
            TOP: 4,
            TOPLEFT: 5,
            LEFT: 6,
            BOTTOMLEFT: 7
        }
        this.dir = this.dirs.BOTTOM;
        this.lastDir = 0;
        this.idleAnim = "idlebottom";
        this.glideAnim = "glidebottom";
        this.currentAnim = this.idleAnim;
        this.lastAnim = "";
        
        this.splash = document.createElement("div");
        this.pc.appendChild(this.splash);

        this.watertrail = document.createElement("div");
        this.pc.appendChild(this.watertrail);
        this.watertrail.addEventListener("animationend", e => {
            switch (e.animationName) {
                case "watertrailstraight-fadein":
                    this.watertrail.classList.remove("watertrailstraight-fadein");
                    if (this.lastAnim.includes("idle")) {
                        this.watertrail.classList.add("watertrailstraight-fadeout");
                    } else {
                        this.watertrail.classList.add("watertrailstraight-sustain");
                    }
                    break;
                case "watertrailstraight-sustain":
                    this.watertrail.classList.remove("watertrailstraight-sustain", "watertrailstraight-sustain-end");
                    this.watertrail.classList.add("watertrailstraight-fadeout");
                    break;
                case "watertrailstraight-fadeout":
                    this.watertrail.classList.remove("watertrailstraight-fadeout");
                    break;
                case "watertraildiagonal-fadein":
                    this.watertrail.classList.remove("watertraildiagonal-fadein");
                    if (this.lastAnim.includes("idle")) {
                        this.watertrail.classList.add("watertraildiagonal-fadeout");
                    } else {
                        this.watertrail.classList.add("watertraildiagonal-sustain");
                    }
                    break;
                case "watertraildiagonal-sustain":
                    this.watertrail.classList.remove("watertraildiagonal-sustain", "watertraildiagonal-sustain-end");
                    this.watertrail.classList.add("watertraildiagonal-fadeout");
                    break;
                case "watertraildiagonal-fadeout":
                    this.watertrail.classList.remove("watertraildiagonal-fadeout");
                    break;
            }
        });

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
        this.joystick.style.setProperty("--joystick-size", this._settings.joystickSize);
        this.stick.style.setProperty("--joystick-size", this._settings.joystickSize);

        this.touch = false;
        this.initialTouchPos = { x: 0, y: 0 };
        this.touchPos = { x: 0, y: 0 };
        this.joystickTouchId = null;
        //
    }

    spawn() {
        document.getElementById("arena").appendChild(this.pc, this.joystick);
        this.x = window.innerWidth / 2 - this.pc.clientWidth / 2;
        this.y = window.innerHeight / 2 - this.pc.clientHeight / 2;
        this.pc.style.top = `${this.y}px`;
        this.pc.style.left = `${this.x}px`;
        window.addEventListener("keydown", e => {
            if (e.repeat) return;
            this.pressed.push(e.key);
            this.checkKeyPress();
        });
        window.addEventListener("keyup", e => {
            this.pressed.splice(this.pressed.indexOf(e.key), 1);
            this.checkKeyPress();
        });

        window.addEventListener("touchstart", e => {
            if (e.target.closest("#start")) return;

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
                    this.touch = true;
                } else {
                    if ((this.velocity.x !== 0 || this.velocity.y !== 0) && !this.isDashed) {
                        this.dash();
                        this.isDashed = true;
                    }
                }
            }
        }, { passive: false });

        window.addEventListener("touchmove", e => {
            if (e.target.closest("#start")) return;

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

    update(isChorus) {
        if (!this.touch) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

        if (this.keys.moveUp) this.velocity.y -= 1;
        if (this.keys.moveDown) this.velocity.y += 1;
        if (this.keys.moveLeft) this.velocity.x -= 1;
        if (this.keys.moveRight) this.velocity.x += 1;

        const veloNorm = this.normalize(this.velocity);
        if (this.x + veloNorm.x * this.speed <= window.innerWidth - this.pc.offsetWidth && this.x + veloNorm.x * this.speed >= 0) {
            this.x += veloNorm.x * this.speed;
        }
        if (this.y + veloNorm.y * this.speed <= window.innerHeight - this.pc.offsetHeight && this.y + veloNorm.y * this.speed >= 0) {
            this.y += veloNorm.y * this.speed;
        }
        this.pc.style.left = `${this.x}px`;
        this.pc.style.top = `${this.y}px`;

        if (this.currentAnim) this.sprite.classList.remove(this.currentAnim);

        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            const angle = Math.round(Math.atan2(this.velocity.y, this.velocity.x) / (Math.PI/4)) * (Math.PI/4);
            switch (angle) {
                case Math.PI / 2:
                    this.dir = this.dirs.BOTTOM;
                    break;
                case Math.PI / 4:
                    this.dir = this.dirs.BOTTOMRIGHT;
                    break;
                case 0:
                    this.dir = this.dirs.RIGHT;
                    break;
                case -Math.PI / 4:
                    this.dir = this.dirs.TOPRIGHT;
                    break;
                case -Math.PI / 2:
                    this.dir = this.dirs.TOP;
                    break;
                case 3 * -Math.PI / 4:
                    this.dir = this.dirs.TOPLEFT;
                    break;
                case Math.PI:
                    this.dir = this.dirs.LEFT;
                    break;
                case 3 * Math.PI / 4:
                    this.dir = this.dirs.BOTTOMLEFT;
                    break;
            }

            switch (this.dir) {
                case this.dirs.BOTTOM:
                    this.idleAnim = "idlebottom";
                    this.glideAnim = "glidebottom";
                    break;
                case this.dirs.BOTTOMRIGHT:
                    this.idleAnim = "idlebottomright";
                    this.glideAnim = "glidebottomright";
                    break;
                case this.dirs.RIGHT:
                    this.idleAnim = "idleright";
                    this.glideAnim = "glideright";
                    break;
                case this.dirs.TOPRIGHT:
                    this.idleAnim = "idletopright";
                    this.glideAnim = "glidetopright";
                    break;
                case this.dirs.TOP:
                    this.idleAnim = "idletop";
                    this.glideAnim = "glidetop";
                    break;
                case this.dirs.TOPLEFT:
                    this.idleAnim = "idletopleft";
                    this.glideAnim = "glidetopleft";
                    break;
                case this.dirs.LEFT:
                    this.idleAnim = "idleleft";
                    this.glideAnim = "glideleft";
                    break;
                case this.dirs.BOTTOMLEFT:
                    this.idleAnim = "idlebottomleft";
                    this.glideAnim = "glidebottomleft";
                    break;
            }
        }

        this.currentAnim = (this.velocity.x === 0 && this.velocity.y === 0) ? this.idleAnim : this.glideAnim;
        if (this.velocity.x === 0 && this.velocity.y === 0) {
            this.currentAnim = this.idleAnim;
            if (this.lastAnim.includes("glide")) this.splash.classList.remove("splashwater");
            this.splash.classList.add("idlewater");

            if (this.watertrail.classList.contains("watertrailstraight-sustain") && (this.dir === this.dirs.BOTTOM || this.dir === this.dirs.RIGHT || this.dir === this.dirs.TOP || this.dir === this.dirs.LEFT)) {
                this.watertrail.classList.remove("watertrailstraight-sustain");
                this.watertrail.classList.add("watertrailstraight-sustain-end");
            } else if (this.watertrail.classList.contains("watertraildiagonal-sustain") && (this.dir === this.dirs.BOTTOMRIGHT || this.dir === this.dirs.TOPRIGHT || this.dir === this.dirs.TOPLEFT || this.dir === this.dirs.BOTTOMLEFT)) {
                this.watertrail.classList.remove("watertrailsdiagonal-sustain");
                this.watertrail.classList.add("watertraildiagonal-sustain-end");
            }
        } else {
            this.currentAnim = this.glideAnim;
            if (this.lastAnim.includes("idle")) this.splash.classList.remove("idlewater");
            this.splash.classList.add("splashwater");

            if (this.dir === this.dirs.BOTTOM || this.dir === this.dirs.RIGHT || this.dir === this.dirs.TOP || this.dir === this.dirs.LEFT) {
                if (this.lastDir === this.dirs.BOTTOMRIGHT || this.lastDir === this.dirs.TOPRIGHT || this.lastDir === this.dirs.TOPLEFT || this.lastDir === this.dirs.BOTTOMLEFT) {
                    this.watertrail.classList.remove("watertraildiagonal-fadein", "watertraildiagonal-sustain", "watertraildiagonal-fadeout");
                    this.watertrail.classList.add("watertrailstraight-fadein");
                }
                if (this.lastAnim.includes("idle")) this.watertrail.classList.add("watertrailstraight-fadein");
            } else {
                if (this.lastDir === this.dirs.BOTTOM || this.lastDir === this.dirs.RIGHT || this.lastDir === this.dirs.TOP || this.lastDir === this.dirs.LEFT) {
                    this.watertrail.classList.remove("watertrailstraight-fadein", "watertrailstraight-sustain", "watertrailstraight-fadeout");
                    this.watertrail.classList.add("watertraildiagonal-fadein");
                }
                if (this.lastAnim.includes("idle")) this.watertrail.classList.add("watertraildiagonal-fadein");
            }
            this.watertrail.style.setProperty("--angle-index", Math.floor(this.dir/2));
        }
        this.sprite.classList.add(this.currentAnim);
        this.lastAnim = this.currentAnim;
        this.lastDir = this.dir;

        const bulletCollisions = this.checkBulletCollisions();
        if (bulletCollisions) {
            if (bulletCollisions.length > 0) {
                bulletCollisions.forEach(e => {
                    if (!e.classList.contains("hit")) {
                        e.classList.add("hit");
                        if (e.classList.contains("beam") || e.classList.contains("beam-column")) e.classList.add("beam-hit");
                        else if (e.classList.contains("lyric-bullet")) e.classList.add("lyric-bullet-hit");
                        this.hit();
                    }
                });
            }
        }

        const lyricCollisions = this.checkLyricCollisions();
        for (const id in lyricCollisions) {
            if (!lyricCollisions[id].bullet) continue;
            if (Object.hasOwn(lyricCollisions[id], "hit")) continue;

            lyricCollisions[id].hit = true;
            this.hit();
        }

        const coinCollisions = this.checkCoinCollisions();
        if (coinCollisions) {
            if (coinCollisions.length > 0) {
                coinCollisions.forEach(e => {
                    if (!e.classList.contains("coin-spin-fade")) {
                        e.classList.add("coin-spin-fade");
                        this.coinCollect(e);
                        new Coin().spawn({ x: e.getBoundingClientRect().x, y: e.getBoundingClientRect().y }, isChorus);
                        if (!this._settings.coinAnimation) e.remove();
                    }
                });
            }
        }

        const shotBulletCollisions = this.checkShotBulletCollisions();
        for (const id in shotBulletCollisions) {
            if (shotBulletCollisions[id].hit) continue;
            shotBulletCollisions[id].hit = true;
            this.hit();
        }

        if (this.isDashCoolDownFinished) this.isDashed = false;

        [...document.getElementsByClassName("water-wave")].forEach(e => {
            if (e.getBoundingClientRect().y + e.clientHeight < this.pc.getBoundingClientRect().y + this.pc.clientHeight) {
                e.parentElement.style.zIndex = "1";
            } else {
                e.parentElement.style.zIndex = "2";
            }
        });
    }

    normalize(v) {
        const length = Math.hypot(v.x, v.y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: v.x / length, y: v.y / length };
    }

    checkBulletCollisions() {
        if (this.isDashing) return;

        const hitbox = this.hitbox.getBoundingClientRect();
        const bullets = [...document.getElementsByClassName("bullet")];

        const collided = bullets.filter(e => !(
            hitbox.right < e.getBoundingClientRect().left ||
            hitbox.left > e.getBoundingClientRect().right ||
            hitbox.bottom < e.getBoundingClientRect().top ||
            hitbox.top > e.getBoundingClientRect().bottom
        ));

        return collided;
    }

    checkLyricCollisions() {
        if (this.isDashing) return;

        const hitbox = this.hitbox.getBoundingClientRect();

        const collided = Object.fromEntries(Object.entries(lyrics).filter(([k, v]) =>
            !(
            hitbox.right < v.currentX ||
            hitbox.left > v.currentX + v.size ||
            hitbox.bottom < v.currentY ||
            hitbox.top > v.currentY + v.size
            )
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

    checkShotBulletCollisions() {
        if (this.isDashing) return;

        const hitbox = this.hitbox.getBoundingClientRect();

        const collided = Object.fromEntries(Object.entries(shotBullets).filter(([k, v]) => 
            !(
            hitbox.right < v.x - (v.size / 2) / Math.SQRT2 ||
            hitbox.left > v.x + (v.size / 2) / Math.SQRT2 ||
            hitbox.bottom < v.y - (v.size / 2) / Math.SQRT2 ||
            hitbox.top > v.y + (v.size / 2) / Math.SQRT2
            )
        ));

        return collided;
    }

    checkKeyPress() {
        Object.entries(this._settings.keybinds).forEach(([k, v]) => {
            if (v.every(f => this.pressed.includes(f))) {
                if (Object.hasOwn(this.keys, k)) {
                    this.keys[k] = true;
                }
                
                if (k === "dash") {
                    if ((this.velocity.x !== 0 || this.velocity.y !== 0) && !this.isDashed) {
                        this.dash();
                        this.isDashed = true;
                    }
                }
            } else {
                this.keys[k] = false;
            }
        });
    }

    dash() {
        this.pc.classList.add("dash");
        this.isDashing = true;
        this.isDashCoolDownFinished = false;
        this.speed = this.DASH_SPEED;
        setTimeout(() => {
            this.speed = this.NORMAL_SPEED;
            this.dashCooldownBar.classList.add("dash-cooldown-bar-active");
            this.isDashing = false;
            this.pc.classList.remove("dash");
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

    coinCollect(coin) {
        const BASE_COIN_SCORE = 100;
        this.coins++;
        this.coinCombo++;
        if (this.coinCombo > this.maxCombo) this.maxCombo = this.coinCombo;
        const bonus = Math.sqrt(this.coinCombo) * 0.1;
        this.comboBonus += BASE_COIN_SCORE * bonus;
        this.score += BASE_COIN_SCORE * (1 + bonus);
        this.maxScore += BASE_COIN_SCORE * (1 + Math.sqrt(this.coins) * 0.1);
        document.getElementById("score-count").innerText = parseInt(this.score);

        if (this.coinCombo <= 2) return;
        if (!this._settings.comboPopups) return;

        const comboPopup = document.createElement("div");
        comboPopup.classList.add("combo-popup");
        comboPopup.innerText = `COMBO x${this.coinCombo}`;
        comboPopup.style.fontSize = this.coinCombo > 20 ? "4vw" : `${(this.coinCombo - 2) * 0.1 + 2}vw`;
        
        const coinRect = coin.getBoundingClientRect();
        const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
        const comboPopupX = clamp(coinRect.x + window.innerWidth * 0.05, window.innerWidth * 0.1, window.innerWidth * 0.9);
        const comboPopupY = clamp(coinRect.y - window.innerWidth * 0.05, window.innerHeight * 0.1, window.innerHeight * 0.9);
        comboPopup.style.left = `${comboPopupX}px`;
        comboPopup.style.top = `${comboPopupY}px`;

        comboPopup.addEventListener("animationend", (e) => {
            if (e.animationName === "comboPop") {
                comboPopup.remove();
            }
        });
        document.getElementById("combo-popups").appendChild(comboPopup);
    }

    hit() {
        const HIT_PENALTY = 50;
        this.hits++;
        this.coinCombo = 0;
        this.score -= HIT_PENALTY;
        document.getElementById("score-count").innerText = parseInt(this.score);
    }
}