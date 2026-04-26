export default class Coin {
    constructor() {
        this.coin = document.createElement("div");
        this.coin.classList.add("coin");

        this.x = 0;
        this.y = 0;

        this.MIN_COIN_DIST = 300;
        
        this.instance = this;
    }

    spawn(lastPos, isChorus) {
        let minHeight = window.innerHeight * 0.2;
        let maxHeight = window.innerHeight * 0.8;
        let minWidth = window.innerWidth * 0.2;
        let maxWidth = window.innerWidth * 0.8;

        document.getElementById("coins").appendChild(this.coin);

        do {
            this.x = minWidth + Math.random() * ((maxWidth - minWidth) - this.coin.clientWidth)
            this.y = minHeight + Math.random() * ((maxHeight - minHeight) - this.coin.clientHeight);
        } while (Math.hypot(this.x - lastPos.x, this.y - lastPos.y) < this.MIN_COIN_DIST);
        
        this.coin.style.top = `${this.y}px`;
        this.coin.style.left = `${this.x}px`;

        this.coin.addEventListener("animationend", e => {
            if (e.animationName === "coin-spin-fade") {
                this.coin.remove();
            }
        });
    }
}