import SpawnPattern from "./spawn-pattern";
import Lyric from "../lyric";

export default class WordPattern extends SpawnPattern {
    constructor(player, arena, telegraph) {
        super(player, arena, telegraph);
        this.w = player.video.firstWord;
        this.lastWord = null;
        this.lastTextElements = [];
    }

    animate() {
        while(this.w) {
            this.w.animate = (now, unit) => {
                if (unit.contains(now)) {
                    if (unit.text !== this.lastWord) {
                        const lyric = new Lyric(unit, this.telegraph);
                        lyric.text.classList.add("text-word");
                        
                        const fullWord = document.createElement("div");
                        fullWord.innerText = unit.text;
                        fullWord.style.fontSize = "10vw";
                        this.arena.appendChild(fullWord);
                        const textTopValue = Math.random() * (window.innerHeight - fullWord.offsetHeight);
                        const textLeftValue = Math.random() * (window.innerWidth - fullWord.offsetWidth);
                        fullWord.remove();
                        const { x, y } = this.getRandomDirection();
                        lyric.setPosAndMoveIn(textLeftValue, textTopValue, x, y);
                        lyric.spawn(this.arena);
                        
                        this.lastTextElements.push(lyric.text);
                        this.lastWord = unit.text;

                        lyric.onFadeOut(() => {
                            const text = lyric.text;
                            text.remove();
                            this.lastTextElements.splice(this.lastTextElements.indexOf(text), 1);
                        });
                    }
                }
            };
            this.w = this.w.next;
        }
    }
}