import Telegraph from "./telegraph";

export default class DirPosTelegraph extends Telegraph {
    constructor() {
        super();
        this.telegraph.classList.add("pos-telegraph");
    }

    spawn(parent, x, y, text, params) {
        parent.appendChild(this.telegraph);
        this.x = x + text.clientWidth / 2 - this.telegraph.clientWidth / 2;
        this.y = y + text.clientHeight / 2 - this.telegraph.clientHeight / 2;
        this.telegraph.style.left = `${this.x}px`;
        this.telegraph.style.top = `${this.y}px`;

        if (params.angle !== null) {
            const arrow = document.createElement("div");
            arrow.classList.add("arrow");
            arrow.style.transform = `rotate(${params.angle}rad)`;
            this.telegraph.appendChild(arrow);
        }
    }

    fadeOutAndRemove() {
        this.telegraph.classList.add("fadeout");
        this.telegraph.addEventListener("animationend", e => {
            if (e.animationName === "fadeout") this.telegraph.remove();
        });
    }
}