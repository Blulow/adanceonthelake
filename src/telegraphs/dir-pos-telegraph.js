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

        if (Object.hasOwn(params, "angle")) {
            const arrow = document.createElement("div");
            arrow.classList.add("arrow");
            arrow.style.transform = `rotate(${params.angle}rad)`;
            this.telegraph.appendChild(arrow);
        } else if (Object.hasOwn(params, "column")) {
            const arrow = document.createElement("div");
            arrow.classList.add("arrow");
            const arrow2 = arrow.cloneNode();
            if (params.column) {
                arrow.style.transform = `translate(-3vw, 0)`;
                arrow2.style.transform = `translate(3vw, 0) rotate(180deg)`;
            } else {
                arrow.style.transform = `translate(0, -3vw) rotate(90deg) `;
                arrow2.style.transform = `translate(0, 3vw) rotate(-90deg) `;
            }
            this.telegraph.appendChild(arrow);
            this.telegraph.appendChild(arrow2);
        }
    }

    fadeOutAndRemove() {
        this.telegraph.classList.add("fadeout");
        this.telegraph.addEventListener("animationend", e => {
            if (e.animationName === "fadeout") this.telegraph.remove();
        });
    }
}