export default class Telegraph {
    constructor() {
        this.telegraph = document.createElement("div");
        this.x = 0;
        this.y = 0;
    }

    spawn(parent, x, y) {
        parent.appendChild(this.telegraph);
        this.x = x;
        this.y = y;
        this.telegraph.style.left = `${x}px`;
        this.telegraph.style.top = `${y}px`;
    }
}