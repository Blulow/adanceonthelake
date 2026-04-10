import SpawnPattern from "./spawn-pattern";
import Lyric from "../lyric";

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
                        const lyric = new Lyric(unit);

                        if (unit.parent.text !== this.lastWord) {
                            this.textGroup = document.createElement("div");
                            this.textGroup.classList.add("text-group");
                            this.arena.appendChild(this.textGroup);
                            
                            const fullWord = document.createElement("div");
                            fullWord.innerText = unit.parent.text;
                            fullWord.style.fontSize = "10vw";
                            this.arena.appendChild(fullWord);
                            this.textTopValue = Math.random() * (window.innerHeight - fullWord.offsetHeight);
                            this.textLeftValue = Math.random() * (window.innerWidth - fullWord.offsetWidth);
                            fullWord.remove();
                            ({ x: this.x, y: this.y } = this.getRandomDirection());
                            
                            this.lastWord = unit.parent.text;
                            this.lastTextGroups.push(this.textGroup);
                        }

                        lyric.onFadeOut(() => {
                            const text = lyric.text;
                            if (Array.from(text.parentElement.children).indexOf(text) === text.parentElement.children.length - 1) {
                                text.parentElement.remove();
                                this.lastTextGroups.splice(this.lastTextGroups.indexOf(text.parentElement), 1);
                            }
                        });

                        lyric.spawn(this.textGroup);
                        lyric.setPosAndMoveIn(this.textTopValue, this.textLeftValue, this.x, this.y);

                        this.lastChar = unit.text;
                    }
                }
            };
            this.c = this.c.next;
        }
    }
}