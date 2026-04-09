import SpawnPattern from "./spawn-pattern";

export default class CharInWordPattern extends SpawnPattern {
    constructor(player, arena) {
        super(player, arena);
        this.c = player.video.firstChar;
        this.lastWord = null;
        this.lastChar = null;
        this.lastTextGroups = [];

        this.textTopValue = "";
        this.textLeftValue = "";
        ({ x: this.x, y: this.y } = this.getRandomDirection());

        this.textGroup = null;
    }

    animate() {
        while(this.c) {
            this.c.animate = (now, unit) => {
                if (unit.contains(now)) {
                    if (unit.text !== this.lastChar) {
                        const text = document.createElement("div");
                        text.classList.add("text");
                        text.innerText = unit.text;
                        this.arena.appendChild(text);
                        
                        if (unit.parent.text !== this.lastWord) {
                            this.textGroup = document.createElement("div");
                            this.textGroup.classList.add("text-group");
                            this.arena.appendChild(this.textGroup);

                            if (this.lastTextElements) {
                                for (let i = 0; i < this.lastTextElements.length; i++) {
                                    this.lastTextElements[i].remove();
                                }
                            }
                            
                            const fullWord = document.createElement("div");
                            fullWord.innerText = unit.parent.text;
                            fullWord.style.fontSize = "10vw";
                            this.arena.appendChild(fullWord);
                            this.textTopValue = `${Math.random() * (window.innerHeight - fullWord.offsetHeight)}px`;
                            this.textLeftValue = `${Math.random() * (window.innerWidth - fullWord.offsetWidth)}px`;
                            fullWord.remove();
                            ({ x: this.x, y: this.y } = this.getRandomDirection());
                            
                            this.lastWord = unit.parent.text;
                            this.lastTextGroups.push(this.textGroup);
                        }

                        text.addEventListener("animationend", e => {
                            if (e.animationName === "movein") {
                                text.classList.add("fadeout");
                            } else if (e.animationName === "fadeout") {
                                if (Array.from(text.parentElement.children).indexOf(text) === text.parentElement.children.length - 1) {
                                    text.parentElement.remove();
                                    this.lastTextGroups.splice(this.lastTextGroups.indexOf(text.parentElement), 1);
                                }
                            }
                        });

                        this.textGroup.appendChild(text);
                        text.style.top = this.textTopValue;
                        text.style.left = this.textLeftValue;
                        text.style.setProperty("--start-x", `${this.x}px`);
					    text.style.setProperty("--start-y", `${this.y}px`);

                        this.lastChar = unit.text;
                    }
                }
                if (!this.player.video.findChar(now)) {
                    if (this.lastTextElements) {
                        for (let i = 0; i < this.lastTextElements.length; i++) {
                            this.lastTextElements[i].remove();
                        }
                    }
                }
            };
            this.c = this.c.next;
        }
    }
}