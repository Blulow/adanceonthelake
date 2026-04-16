import SpawnType from "./spawn-type";
import Lyric from "../lyric";

export default class WordType extends SpawnType {
    constructor(player, arena, pattern, attack, telegraph) {
        super(player, arena, pattern, attack, telegraph);
        this.w = player.video.firstWord;
        this.lastWord = null;
    }

    animate() {
        while(this.w) {
            this.w.animate = (now, unit) => {
                if (unit.contains(now)) {
                    if (unit.text !== this.lastWord) {
                        const lyric = new Lyric(unit, this.attack, this.telegraph);
                        lyric.text.classList.add("text-word");

                        this.pattern.spawnGroup(unit.text, this.arena, true);
                        this.pattern.spawnLyric(lyric);

                        this.lastWord = unit.text;
                    }
                }
            };
            this.w = this.w.next;
        }
    }
}