import SpawnPattern from "./spawn-pattern";
import Lyric from "../lyric";

export default class WordPattern extends SpawnPattern {
    constructor(player, arena, attack, telegraph) {
        super(player, arena, attack, telegraph);
        this.w = player.video.firstWord;
        this.lastWord = null;
        this.lastTextElements = [];

        this.isColumn = false;
    }

    animate() {
        while(this.w) {
            this.w.animate = (now, unit) => {
                if (unit.contains(now)) {
                    if (unit.text !== this.lastWord) {
                        const lyric = new Lyric(unit, this.attack, this.telegraph);
                        lyric.text.classList.add("text-word");
                        
                        if (Math.random() > 0.5) this.isColumn = !this.isColumn;
                        
                        const fullWord = document.createElement("div");
                        fullWord.innerText = unit.text;
                        fullWord.style.fontSize = "10vw";
                        if (this.isColumn) fullWord.style.writingMode = "vertical-rl";
                        this.arena.appendChild(fullWord);
                        const textTopValue = Math.random() * (window.innerHeight - fullWord.offsetHeight);
                        const textLeftValue = Math.random() * (window.innerWidth - fullWord.offsetWidth);
                        fullWord.remove();
                        const { x, y } = this.getRandomDirection();

                        if (this.isColumn) lyric.text.style.writingMode = "vertical-rl";
                        lyric.setPosAndMoveIn(textLeftValue, textTopValue, x, y);
                        lyric.spawn(this.arena);
                        
                        this.lastTextElements.push(lyric.text);
                        this.lastWord = unit.text;

                        lyric.onFadeOut(() => {
                            const text = lyric.text;
                            text.remove();
                            this.lastTextElements.splice(this.lastTextElements.indexOf(text), 1);
                        }, { isColumn: this.isColumn });
                    }
                }
            };
            this.w = this.w.next;
        }
    }
}