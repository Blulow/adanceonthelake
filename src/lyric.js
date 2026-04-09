export default class Lyric {
    constructor(unit) {
        this.text = document.createElement("div");
        this.text.classList.add("text");
        this.text.innerText = unit.text;
    }

    spawn(parent) {
        if (!parent instanceof HTMLElement) return;
        parent.appendChild(this.text);
    }
}