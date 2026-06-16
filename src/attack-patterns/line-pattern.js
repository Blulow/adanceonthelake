import AttackPattern from "./attack-pattern";

export default class LinePattern extends AttackPattern {
    constructor(Telegraph) {
        super(Telegraph);
        this.beamWrapper = document.createElement("div");
    }
    
    shoot(x, y, text, params) {
        const column = params.isColumn ? "-column" : "";
        this.beamWrapper.classList.add(`beam${column}-wrapper`);
        this.bullet.classList.add(`beam${column}`);
        
        this.beamWrapper.appendChild(this.bullet);
        document.getElementById("bullets").appendChild(this.beamWrapper);

        this.x = x + text.size / 2 - this.bullet.clientWidth / 2;
        this.y = y + text.size / 2 - this.bullet.clientHeight / 2;
        // console.log("ee", text)

        if (params.isColumn) {
            this.beamWrapper.style.left = 0;
            this.beamWrapper.style.top = `${this.y}px`;
        } else {
            this.beamWrapper.style.left = `${this.x}px`;
            this.beamWrapper.style.top = 0;
        }

        this.bullet.addEventListener("animationend", e => {
            if (e.animationName === `beam${column}-shoot`) {
                this.bullet.classList.add(`beam${column}-fade`);
                this.bullet.classList.remove("bullet");
            } else if(e.animationName === `beam${column}-fade`) {
                this.bullet.parentElement.remove();
            }
        });
    }
}