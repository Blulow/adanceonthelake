import SpawnPattern from "./spawn-pattern";

export default class WordPattern extends SpawnPattern {
    constructor(player, arena) {
        super(player, arena);
        this.w = player.video.firstWord;
        this.lastWord = null;
        this.lastTextElements = [];
    }

    animate() {
        while(this.w) {
            this.w.animate = (now, unit) => {
                if (unit.contains(now)) {
                    if (unit.text !== this.lastWord) {
                        const text = document.createElement("div");
                        text.classList.add("text");
                        text.innerText = unit.text;
                        this.arena.appendChild(text);

                        text.style.top = `${Math.random() * (window.innerHeight - text.offsetHeight)}px`;
                        text.style.left = `${Math.random() * (window.innerWidth - text.offsetWidth)}px`;
                        const { x, y } = this.getRandomDirection();
                        text.style.setProperty("--start-x", `${x}px`);
					    text.style.setProperty("--start-y", `${y}px`);

                        this.lastTextElements.push(text);
                        this.lastWord = unit.text;

                        text.addEventListener("animationend", e => {
                            if (e.animationName === "movein") {
                                text.classList.add("fadeout");
                            } else if (e.animationName === "fadeout") {
                                if (Array.from(text.parentElement.children).indexOf(text) === text.parentElement.children.length - 1) {
                                    text.parentElement.remove();
                                    this.lastTextElements.splice(this.lastTextElements.indexOf(text.parentElement), 1);
                                }
                            }
                        });
                    }
                }
            };
            this.w = this.w.next;
        }
    }

    getRandomDirection() {
        const angle = Math.random() * 360;
        const rad = angle * (Math.PI / 180);

        const distance = 300;

        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;

        return { x, y };
    }
}