import SpawnType from "./spawn-type";
import Lyric from "../lyric";

export default class CharInChordType extends SpawnType {
    constructor(player, arena, pattern, attack, telegraph) {
        super(player, arena, pattern, attack, telegraph);
        this.c = player.video.firstChar;
        this.lastChar = null;
        this.lastChord = null;
    }

    animate() {
        while(this.c) {
            this.c.animate = (now, unit) => {
                if (unit.contains(now)) {
                    if (unit.text !== this.lastChar) {
                        const chordChange = this.player.findChordChange(this.player.videoPosition, unit.startTime);
					    const chord = chordChange.current;

                        const lyric = new Lyric(unit, this.attack, this.telegraph);
                        
                        if (chord !== this.lastChord) {
                            const charsInChord = this.player.video.chars
                                .filter(w => w.startTime >= chord.startTime && w.startTime < chord.endTime)
                                .map(w => w.text)
                                .join("");

                            this.pattern.spawnGroup(charsInChord, this.arena);

                            this.lastChord = chord;
                        }

                        this.pattern.spawnLyric(lyric);
                        if (chord === this.lastChord) {
                            this.pattern.offsetText(lyric);
                        }
                        this.lastChar = unit.text;
                    }
                }
            };
            this.c = this.c.next;
        }

    }
}