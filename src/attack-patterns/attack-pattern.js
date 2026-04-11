export default class AttackPattern {
    constructor(Telegraph) {
       this.bullet = document.createElement("bullet");
       this.telegraph = new Telegraph();
    }

    shoot(x, y, text) {
        document.getElementById("bullets").appendChild(this.bullet);
    }
}