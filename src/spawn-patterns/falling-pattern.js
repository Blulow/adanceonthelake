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
        
        // this.textGroup = null;

        this.isColumn = false;
        this.reverse = false;
        this.textTopValueCache = "";
        this.textLeftValueCache = "";
        this.maxFitHeight = 0;
        this.maxFitWidth = 0;
    }

    spawnGroup(textInGroup, arena, isChorus, isWord = false) {
        if (Math.random() > 0.5) this.isColumn = !this.isColumn;
        if (Math.random() > 0.5) this.reverse = !this.reverse;

        if (isChorus) {
            const landscape = window.matchMedia("(orientation: landscape)").matches;
            this.minHeight = window.innerHeight * (landscape ? 0.03 : 0.05);
            this.maxHeight = window.innerHeight * (landscape ? 0.97 : 0.95);
            this.minWidth = window.innerWidth * (landscape ? 0.03 : 0.05);
            this.maxWidth = window.innerWidth * (landscape ? 0.97 : 0.95);
        }

        // this.textGroup = document.createElement("div");
        // this.textGroup.classList.add("text-group");
        // arena.appendChild(this.textGroup);

        const size = window.innerWidth * (Math.max(window.innerHeight, window.innerWidth) > 1024 ? 0.07 : 0.1);
        // const unitWord = document.createElement("div");
        // unitWord.innerText = textInGroup[0];
        // unitWord.style.fontSize = Math.max(window.innerHeight, window.innerWidth) > 1024 ? "7vw" : "10vw";
        // unitWord.style.lineHeight = "1";
        // arena.appendChild(unitWord);

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
        // unitWord.remove();

        // if (isWord) this.textGroup.dataset.length = 1;
        // else this.textGroup.dataset.length = textInGroup.length;
    }

    spawnLyric(lyric) {
        lyric.text.bullet = true;
        lyric.text.fallin = true;
        lyric.text.delayStart = null;
        lyric.text.delayProgress = 0;
        lyric.text.delay = 500;
        if (this.isColumn) lyric.text.column = true;
        // lyric.text.classList.add("bullet", "lyric-bullet")
        // lyric.text.classList.add("text-fall");
        // if (this.isColumn) lyric.text.classList.add("column");
        
        // lyric.onFadeOut(() => {
        //     const text = lyric.text;
        //     text.parentElement.dataset.length--;
        //     if (text.parentElement.dataset.length <= 0) text.parentElement.remove();
        // }, { isColumn: this.isColumn, playerPos: { x: this.player.x, y: this.player.y }});
        
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