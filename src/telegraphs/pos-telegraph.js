import Telegraph from "./telegraph";

export default class PosTelegraph extends Telegraph {
    constructor() {
        super();
        this.telegraph.classList.add("pos-telegraph");
    }

    fadeOut() {
        this.telegraph.classList.add("fadeout");
    }
}