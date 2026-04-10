import SpawnPattern from "./spawn-pattern";
import Lyric from "../lyric";

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
                        const lyric = new Lyric(unit);
                        lyric.spawn(this.arena);

                        const textTopValue = Math.random() * (window.innerHeight - text.offsetHeight);
                        const textLeftValue = Math.random() * (window.innerWidth - text.offsetWidth);
                        const { x, y } = this.getRandomDirection();
                        lyric.setPosAndMoveIn(textLeftValue, textTopValue, x, y);
                        
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