import SpawnType from "./spawn-type";
import Lyric from "../lyric";

export default class CharInWordType extends SpawnType {
    constructor(player, arena, pattern, attack, telegraph) {
        super(player, arena, pattern, attack, telegraph);
        this.iter = player.video.firstChar;
        this.lastWord = null;
        this.lastChar = null;
    }

    animate(now, unit) {
        if (unit.text !== this.lastChar) {
            const lyric = new Lyric(unit, this.attack, this.telegraph);

            if (unit.parent.text !== this.lastWord) {
                this.pattern.spawnGroup(unit.parent.text, this.arena);

                this.lastWord = unit.parent.text;
            }

            this.pattern.spawnLyric(lyric)
            if (unit.parent.text === this.lastWord) {
                this.pattern.offsetText(lyric);
            }
            this.lastChar = unit.text;
        }
    }
}