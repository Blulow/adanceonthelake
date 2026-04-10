import Telegraph from "./telegraph";

export default class PosTelegraph extends Telegraph {
    constructor() {
        super();
        this.telegraph.classList.add("pos-telegraph");
    }

    fadeOutAndRemove() {
        this.telegraph.classList.add("fadeout");
        this.telegraph.addEventListener("animationend", e => {
            if (e.animationName === "fadeout") this.telegraph.remove();
        });
    }
}