import AttackPattern from "./attack-pattern";

export default class LinePattern extends AttackPattern {
    constructor(Telegraph) {
        super(Telegraph);
        this.beamWrapper = document.createElement("div");
    }
    
    shoot(x, y, params) {
        const column = params.isColumn ? "-column" : "";
        this.beamWrapper.classList.add(`beam${column}-wrapper`);
        this.bullet.classList.add(`beam${column}`);

        if (params.isColumn) {
            this.beamWrapper.style.left = 0;
            this.beamWrapper.style.top = `${y}px`;
        } else {
            this.beamWrapper.style.left = `${x}px`;
            this.beamWrapper.style.top = 0;
        }

        this.beamWrapper.appendChild(this.bullet);
        document.getElementById("bullets").appendChild(this.beamWrapper);

        this.bullet.addEventListener("animationend", e => {
            if (e.animationName === `beam${column}-shoot`) {
                console.log(this.bullet);
                this.bullet.classList.add(`beam${column}-fade`);
            } else if(e.animationName === `beam${column}-fade`) {
                this.bullet.parentElement.remove();
            }
        });
    }
}