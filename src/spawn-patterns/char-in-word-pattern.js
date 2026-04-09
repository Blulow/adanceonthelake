import SpawnPattern from "./spawn-pattern";

export default class CharInWordPattern extends SpawnPattern {
    constructor(player, arena) {
        super(player, arena);
        this.c = player.video.firstChar;
        this.lastWord = null;
        this.lastChar = null;
        this.lastTextElements = [];

        this.textTopValue = "";
        this.textLeftValue = "";
        ({ x: this.x, y: this.y } = this.getRandomDirection());
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
                        }
                        text.style.top = this.textTopValue;
                        text.style.left = this.textLeftValue;
                        text.style.setProperty("--start-x", `${this.x}px`);
					    text.style.setProperty("--start-y", `${this.y}px`);

                        this.lastTextElements.push(text);
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