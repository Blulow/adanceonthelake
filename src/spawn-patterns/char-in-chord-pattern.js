import SpawnPattern from "./spawn-pattern";
import Lyric from "../lyric";

export default class CharInChordPattern extends SpawnPattern {
    constructor(player, arena, telegraph) {
        super(player, arena, telegraph);
        this.c = player.video.firstChar;
        this.lastWord = null;
        this.lastChar = null;
        this.lastTextGroups = [];
        this.lastChord = null;

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
                        const chordChange = this.player.findChordChange(this.player.videoPosition, now);
					    const chord = chordChange.current;

                        const lyric = new Lyric(unit, this.telegraph);
                        
                        if (chord !== this.lastChord) {
                            this.textGroup = document.createElement("div");
                            this.textGroup.classList.add("text-group");
                            this.arena.appendChild(this.textGroup);
                            
                            const charsInChord = this.player.video.chars
                                .filter(w => w.startTime >= chord.startTime && w.startTime < chord.endTime)
                                .map(w => w.text)
                                .join("");

                            const fullWord = document.createElement("div");
                            fullWord.innerText = charsInChord;
                            fullWord.style.fontSize = "10vw";
                            this.arena.appendChild(fullWord);
                            this.textTopValue = Math.random() * (window.innerHeight - fullWord.offsetHeight);
                            this.textLeftValue = Math.random() * (window.innerWidth - fullWord.offsetWidth);
                            fullWord.remove();
                            ({ x: this.x, y: this.y } = this.getRandomDirection());
                            
                            this.lastWord = charsInChord;
                            this.lastChord = chord;
                            this.lastTextGroups.push(this.textGroup);
                        }

                        lyric.onFadeOut(() => {
                            const text = lyric.text;
                            if (Array.from(text.parentElement.children).indexOf(text) === text.parentElement.children.length - 1) {
                                text.parentElement.remove();
                                this.lastTextGroups.splice(this.lastTextGroups.indexOf(text.parentElement), 1);
                            }
                        })

                        lyric.setPosAndMoveIn(this.textLeftValue, this.textTopValue, this.x, this.y);
                        // console.log(this.textLeftValue);
                        lyric.spawn(this.textGroup);
                        if (chord === this.lastChord) this.textLeftValue += lyric.text.clientWidth;

                        this.lastChar = unit.text;
                    }
                }
            };
            this.c = this.c.next;
        }
    }
}