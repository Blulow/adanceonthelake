import { lyrics } from "../game-loop";
import SpawnPattern from "./spawn-pattern";

export default class RandomDirPattern extends SpawnPattern {
    constructor(player) {
        super();
        this.player = player;

        this.textTopValue = 0;
        this.textLeftValue = 0;

        this.sides = {
            TOP: 0,
            BOTTOM: 1,
            LEFT: 2,
            RIGHT: 3
        }
        this.side = this.sides.TOP;
        this.unitDim = { width: 0, height: 0 };

        this.reverse = false;
    }

    spawnGroup(textInGroup, arena, isChorus, isWord = false) {
        if (Math.random() > 0.5) this.reverse = !this.reverse;

        let minHeight = 0;
        let maxHeight = window.innerHeight;
        let minWidth = 0;
        let maxWidth = window.innerWidth;

        if (isChorus) {
            const landscape = window.matchMedia("(orientation: landscape)").matches;
            minHeight = window.innerHeight * (landscape ? 0.03 : 0.05);
            maxHeight = window.innerHeight * (landscape ? 0.97 : 0.95);
            minWidth = window.innerWidth * (landscape ? 0.03 : 0.05);
            maxWidth = window.innerWidth * (landscape ? 0.97 : 0.95);
        }

        const size = window.innerWidth * (Math.max(window.innerHeight, window.innerWidth) > 1024 ? 0.07 : 0.1);

        this.side = Math.floor(Math.random() * 4);
        do {
            switch (this.side) {
                case this.sides.TOP:
                    this.textTopValue = minHeight - size;
                    this.textLeftValue = minWidth + Math.random() * ((maxWidth - minWidth) + size) - size;
                    break;
                case this.sides.BOTTOM:
                    this.textTopValue = maxHeight - (window.innerHeight * 0.07);
                    this.textLeftValue = minWidth + Math.random() * ((maxWidth - minWidth) + size) - size;
                    break;
                case this.sides.LEFT:
                    this.textTopValue = minHeight + Math.random() * ((maxHeight - minHeight) + size) - size;
                    this.textLeftValue = minWidth - size;
                    break;
                case this.sides.RIGHT:
                    this.textTopValue = minHeight + Math.random() * ((maxHeight - minHeight) + size) - size;
                    this.textLeftValue = maxWidth;
                    break;
            }
        } while (Object.values(lyrics).filter(e => !(
            this.textLeftValue + size < e.x ||
            this.textLeftValue > e.x + size ||
            this.textTopValue + size < e.y ||
            this.textTopValue > e.y + size
        )).length > 0);
        this.unitDim = { width: size, height: size };
    }
    
    spawnLyric(lyric) {
        lyric.text.bullet = true;
        lyric.text.movetoedge = true;
        lyric.text.delayStart = null;
        lyric.text.delayProgress = 0;
        lyric.text.delay = 1500;
        if (this.side === this.sides.TOP || this.side === this.sides.BOTTOM) lyric.text.column = true;
        lyric.text.waterWave = true;
        // });
        const lyricPos = { x: this.textLeftValue, y: this.textTopValue };
        const endPos = this.getEndPos(lyricPos, this.unitDim);
        lyric.setPosAndMoveToEdge(this.textLeftValue, this.textTopValue, endPos.x, endPos.y);
        lyric.spawn();
    }

    getEndPos(lyricPos, lyricDim) {
        const relX = this.player.x - lyricPos.x;
        const relY = this.player.y - lyricPos.y;

        const values = [];

        if (relX !== 0) {
            values.push((-lyricDim.width - lyricPos.x) / relX);
            values.push((window.innerWidth - lyricPos.x) / relX);
        }
        if (relY !== 0) {
            values.push((-lyricDim.height - lyricPos.y) / relY);
            values.push((window.innerHeight - lyricPos.y) / relY);
        }

        const closestValue = Math.min(...values.filter(t => t > 1));

        return { x: lyricPos.x + relX * closestValue, y: lyricPos.y + relY * closestValue };
    }

    offsetText(lyric) {
        switch (this.side) {
            case this.sides.TOP:
                if (this.reverse) {
                    this.textLeftValue -= lyric.text.size;
                    if (this.textLeftValue < 0) {
                        this.side = this.sides.LEFT;
                        this.textLeftValue = -lyric.text.size;
                        this.textTopValue = 0;
                    }
                } else {
                    this.textLeftValue += lyric.text.size;
                    if (this.textLeftValue + lyric.text.size > window.innerWidth) {
                        this.side = this.sides.RIGHT;
                        this.textLeftValue = window.innerWidth;
                        this.textTopValue = 0;
                    }
                }
                break;
            case this.sides.BOTTOM:
                if (this.reverse) {
                    this.textLeftValue += lyric.text.size;
                    if (this.textLeftValue + lyric.text.size > window.innerWidth) {
                        this.side = this.sides.RIGHT;
                        this.textLeftValue = window.innerWidth;
                        this.textTopValue = window.innerHeight - lyric.text.size;
                    }
                } else {
                    this.textLeftValue -= lyric.text.size;
                    if (this.textLeftValue < 0) {
                        this.side = this.sides.LEFT;
                        this.textLeftValue = -lyric.text.size;
                        this.textTopValue = window.innerHeight - lyric.text.size;
                    }
                }
                break;
            case this.sides.LEFT:
                if (this.reverse) {
                    this.textTopValue += lyric.text.size;
                    if (this.textTopValue + lyric.text.size > window.innerHeight) {
                        this.side = this.sides.BOTTOM;
                        this.textLeftValue = 0;
                        this.textTopValue = window.innerHeight;
                    }
                } else {
                    this.textTopValue -= lyric.text.size;
                    if (this.textTopValue < 0) {
                        this.side = this.sides.TOP;
                        this.textLeftValue = 0;
                        this.textTopValue = -lyric.text.size;
                    }
                }
                break;
            case this.sides.RIGHT:
                if (this.reverse) {
                    this.textTopValue -= lyric.text.size;
                    if (this.textTopValue < 0) {
                        this.side = this.sides.TOP;
                        this.textLeftValue = window.innerWidth - lyric.text.size;
                        this.textTopValue = -lyric.text.size;
                    }
                } else {
                    this.textTopValue += lyric.text.size;
                    if (this.textTopValue + lyric.text.size > window.innerHeight) {
                        this.side = this.sides.BOTTOM;
                        this.textLeftValue = window.innerWidth - lyric.text.size;
                        this.textTopValue = window.innerHeight;
                    }
                }
                break;
        }
    }
}