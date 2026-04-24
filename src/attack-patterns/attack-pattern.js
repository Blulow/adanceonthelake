export default class AttackPattern {
    constructor(Telegraph) {
       this.bullet = document.createElement("div");
       this.bullet.classList.add("bullet");
       this.telegraph = new Telegraph();
    }

    shoot() {
        
    }
}