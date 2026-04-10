export default class Telegraph {
    constructor() {
        this.telegraph = document.createElement("div");
        this.x = 0;
        this.y = 0;
    }

    spawn(parent, x, y, text) {
        parent.appendChild(this.telegraph);
        this.x = x + text.clientWidth / 2 - this.telegraph.clientWidth / 2;
        this.y = y + text.clientHeight / 2 - this.telegraph.clientHeight / 2;
        this.telegraph.style.left = `${this.x}px`;
        this.telegraph.style.top = `${this.y}px`;
    }
}