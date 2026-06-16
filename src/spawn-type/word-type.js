import SpawnType from "./spawn-type";
import Lyric from "../lyric";

export default class WordType extends SpawnType {
    constructor(player, arena, pattern, attack, telegraph) {
        super(player, arena, pattern, attack, telegraph);
        this.iter = player.video.firstWord;
        this.lastWord = null;
    }

    animate(now, unit, isChorus) {
        if (unit.text !== this.lastWord) {
            const lyric = new Lyric(unit, this.attack, this.telegraph);

            this.pattern.spawnGroup(unit.text, this.arena, isChorus, true);
            this.pattern.spawnLyric(lyric);

            this.lastWord = unit.text;
        }
    }
}