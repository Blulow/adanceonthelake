import SpawnPattern from "./spawn-pattern";

export default class FallingPattern extends SpawnPattern {
    constructor(player) {
        super();
        this.player = player;

        this.minHeight = 0;
        this.maxHeight = window.innerHeight;
        this.minWidth = 0;
        this.maxWidth = window.innerWidth;

        this.textTopValue = "";
        this.textLeftValue = "";

        this.isColumn = false;
        this.reverse = false;
        this.textTopValueCache = "";
        this.textLeftValueCache = "";
        this.maxFitHeight = 0;
        this.maxFitWidth = 0;

        this.isWord = false;
    }

    spawnGroup(textInGroup, arena, isChorus, isWord = false) {
        this.isWord = isWord;
        if (Math.random() > 0.5) this.isColumn = !this.isColumn;
        if (Math.random() > 0.5) this.reverse = !this.reverse;

        if (isChorus) {
            const landscape = window.matchMedia("(orientation: landscape)").matches;
            this.minHeight = window.innerHeight * (landscape ? 0.03 : 0.05);
            this.maxHeight = window.innerHeight * (landscape ? 0.97 : 0.95);
            this.minWidth = window.innerWidth * (landscape ? 0.03 : 0.05);
            this.maxWidth = window.innerWidth * (landscape ? 0.97 : 0.95);
        }

        const size = window.innerWidth * (Math.max(window.innerHeight, window.innerWidth) > 1024 ? 0.07 : 0.1);

        this.maxFitHeight = Math.floor((this.maxHeight - this.minHeight) / size);
        this.maxFitWidth = Math.floor((this.maxWidth - this.minWidth) / size);
        do {
            if (this.isColumn) {
                if (this.reverse) {
                    if (size * textInGroup.length > this.maxHeight/2) {
                        this.textTopValue = this.maxHeight - size;
                        this.textTopValueCache = this.textTopValue;
                    } else {
                        this.textTopValue = this.maxHeight - Math.random() * ((this.maxHeight - this.minHeight)/2 - size * textInGroup.length) - size;
                    }
                    this.textLeftValue = this.minWidth + Math.random() * ((this.maxWidth - this.minWidth) - size);
                } else {
                    if (size * textInGroup.length > this.maxHeight/2) {
                        this.textTopValue = (this.maxHeight - this.minHeight)/2;
                        this.textTopValueCache = this.textTopValue;
                    } else {
                        this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight)/2 - size * textInGroup.length) + (this.maxHeight - this.minHeight)/2;
                    }
                    this.textLeftValue = this.minWidth + Math.random() * ((this.maxWidth - this.minWidth) - size);
                }
            } else {
                if (this.reverse) {
                    if (size * textInGroup.length > this.maxWidth) {
                        this.textLeftValue = this.maxWidth - size;
                        this.textLeftValueCache = this.textLeftValue;
                    } else {
                        this.textLeftValue = this.maxWidth - Math.random() * ((this.maxWidth - this.minWidth) - size * textInGroup.length) - size;
                    }
                    this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight)/2 - size) + (this.maxHeight - this.minHeight)/2;
                } else {
                    if (size * textInGroup.length > this.maxWidth) {
                        this.textLeftValue = this.minWidth;
                        this.textLeftValueCache = this.textLeftValue;
                    } else {
                        this.textLeftValue = this.minWidth + Math.random() * ((this.maxWidth - this.minWidth) - size * textInGroup.length);
                    }
                    this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight)/2 - size) + (this.maxHeight - this.minHeight)/2;
                }
            }
        } while (Object.values(lyrics).filter(e => !(
            this.textLeftValue + size < e.x ||
            this.textLeftValue > e.x + size ||
            this.textTopValue + size < e.y ||
            this.textTopValue > e.y + size
        )).length > 0);
    }

    spawnLyric(lyric) {
        lyric.text.bullet = true;
        lyric.text.fallin = true;
        lyric.text.delayStart = null;
        lyric.text.delayProgress = 0;
        lyric.text.delay = 500;
        if (this.isColumn) lyric.text.column = true;
        lyric.text.isWord = this.isWord;
        
        lyric.setPosAndMoveIn(this.textLeftValue, this.textTopValue, this.textLeftValue, this.textTopValue - window.innerHeight);
        lyric.spawn();
        lyric.spawnTelegraph(false);
    }

    offsetText(lyric) {
        if (this.isColumn) {
            if (this.reverse) {
                this.textTopValue -= lyric.text.size;
                if (this.textTopValue < 0) {
                    this.textTopValue = this.textTopValueCache;
                    if (this.textLeftValue + lyric.text.size + lyric.text.size > this.maxWidth) {
                        this.textLeftValue -= lyric.text.size;
                    } else this.textLeftValue += lyric.text.size;
                }
            } else {
                this.textTopValue += lyric.text.size;
                if (this.textTopValue + lyric.text.size > this.maxFitHeight * lyric.text.size) {
                    this.textTopValue = this.textTopValueCache;
                    if (this.textLeftValue + lyric.text.size + lyric.text.size > this.maxWidth) {
                        this.textLeftValue -= lyric.text.size;
                    } else this.textLeftValue += lyric.text.size;
                }
            }
        } else {
            if (this.reverse) {
                this.textLeftValue -= lyric.text.size;
                if (this.textLeftValue < 0) {
                    this.textLeftValue = this.textLeftValueCache;
                    if (this.textTopValue + lyric.text.size + lyric.text.size > this.maxHeight) {
                        this.textTopValue -= lyric.text.size;
                    } else this.textTopValue += lyric.text.size;
                }
            } else {
                this.textLeftValue += lyric.text.size;
                if (this.textLeftValue + lyric.text.size > this.maxFitWidth * lyric.text.size) {
                    this.textLeftValue = this.textLeftValueCache;
                    if (this.textTopValue + lyric.text.size + lyric.text.size > this.maxHeight) {
                        this.textTopValue -= lyric.text.size;
                    } else this.textTopValue += lyric.text.size;
                }
            }
        }
    }
}