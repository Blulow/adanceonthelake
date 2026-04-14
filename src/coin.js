export default class Coin {
    constructor() {
        this.coin = document.createElement("div");
        this.coin.classList.add("coin");
        
        this.instance = this;
    }

    spawn() {
        document.getElementById("coins").appendChild(this.coin);
        this.coin.style.top = `${Math.random() * (window.innerHeight - this.coin.clientHeight)}px`;
        this.coin.style.left = `${Math.random() * (window.innerWidth - this.coin.clientWidth)}px`;

        this.coin.addEventListener("animationend", e => {
            if (e.animationName === "coin-spin-fade") {
                this.coin.remove();
            }
        });
    }
}