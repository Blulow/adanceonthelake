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
        
        this.textGroup = null;

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

        this.textGroup = document.createElement("div");
        this.textGroup.classList.add("text-group");
        arena.appendChild(this.textGroup);

        const unitWord = document.createElement("div");
        unitWord.innerText = textInGroup[0];
        unitWord.style.fontSize = Math.max(window.innerHeight, window.innerWidth) > 1024 ? "7vw" : "10vw";
        unitWord.style.lineHeight = "1";
        arena.appendChild(unitWord);

        this.maxFitHeight = Math.floor((this.maxHeight - this.minHeight) / unitWord.clientHeight);
        this.maxFitWidth = Math.floor((this.maxWidth - this.minWidth) / unitWord.clientWidth);
        do {
            if (this.isColumn) {
                if (this.reverse) {
                    if (unitWord.offsetHeight * textInGroup.length > this.maxHeight/2) {
                        this.textTopValue = this.maxHeight - unitWord.offsetHeight;
                        this.textTopValueCache = this.textTopValue;
                    } else {
                        this.textTopValue = this.maxHeight - Math.random() * ((this.maxHeight - this.minHeight)/2 - unitWord.offsetHeight * textInGroup.length) - unitWord.offsetHeight;
                    }
                    this.textLeftValue = this.minWidth + Math.random() * ((this.maxWidth - this.minWidth) - unitWord.offsetWidth);
                } else {
                    if (unitWord.offsetHeight * textInGroup.length > this.maxHeight/2) {
                        this.textTopValue = (this.maxHeight - this.minHeight)/2;
                        this.textTopValueCache = this.textTopValue;
                    } else {
                        this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight)/2 - unitWord.offsetHeight * textInGroup.length) + (this.maxHeight - this.minHeight)/2;
                    }
                    this.textLeftValue = this.minWidth + Math.random() * ((this.maxWidth - this.minWidth) - unitWord.offsetWidth);
                }
            } else {
                if (this.reverse) {
                    if (unitWord.offsetWidth * textInGroup.length > this.maxWidth) {
                        this.textLeftValue = this.maxWidth - unitWord.offsetWidth;
                        this.textLeftValueCache = this.textLeftValue;
                    } else {
                        this.textLeftValue = this.maxWidth - Math.random() * ((this.maxWidth - this.minWidth) - unitWord.offsetWidth * textInGroup.length) - unitWord.offsetWidth;
                    }
                    this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight)/2 - unitWord.offsetHeight) + (this.maxHeight - this.minHeight)/2;
                } else {
                    if (unitWord.offsetWidth * textInGroup.length > this.maxWidth) {
                        this.textLeftValue = this.minWidth;
                        this.textLeftValueCache = this.textLeftValue;
                    } else {
                        this.textLeftValue = this.minWidth + Math.random() * ((this.maxWidth - this.minWidth) - unitWord.offsetWidth * textInGroup.length);
                    }
                    this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight)/2 - unitWord.offsetHeight) + (this.maxHeight - this.minHeight)/2;
                }
            }
        } while ([...document.getElementsByClassName("text")].filter(e => !(
            this.textLeftValue + unitWord.offsetWidth < e.getBoundingClientRect().left ||
            this.textLeftValue > e.getBoundingClientRect().right ||
            this.textTopValue + unitWord.offsetHeight < e.getBoundingClientRect().top ||
            this.textTopValue > e.getBoundingClientRect().bottom
        )).length > 0);
        unitWord.remove();

        if (isWord) this.textGroup.dataset.length = 1;
        else this.textGroup.dataset.length = textInGroup.length;
    }

    spawnLyric(lyric) {
        lyric.text.classList.add("bullet", "lyric-bullet")
        lyric.text.classList.add("text-fall");
        if (this.isColumn) lyric.text.classList.add("column");
        
        lyric.onFadeOut(() => {
            const text = lyric.text;
            text.parentElement.dataset.length--;
            if (text.parentElement.dataset.length <= 0) text.parentElement.remove();
        }, { isColumn: this.isColumn, playerPos: { x: this.player.x, y: this.player.y }});
        
        lyric.setPosAndMoveIn(this.textLeftValue, this.textTopValue, 0, 0);
        lyric.spawn(this.textGroup);
        lyric.spawnTelegraph(false);
    }

    offsetText(lyric) {
        if (this.isColumn) {
            if (this.reverse) {
                this.textTopValue -= lyric.text.clientHeight;
                if (this.textTopValue < 0) {
                    this.textTopValue = this.textTopValueCache;
                    if (this.textLeftValue + lyric.text.clientWidth + lyric.text.clientWidth > this.maxWidth) {
                        this.textLeftValue -= lyric.text.clientWidth;
                    } else this.textLeftValue += lyric.text.clientWidth;
                }
            } else {
                this.textTopValue += lyric.text.clientHeight;
                if (this.textTopValue + lyric.text.clientHeight > this.maxFitHeight * lyric.text.clientHeight) {
                    this.textTopValue = this.textTopValueCache;
                    if (this.textLeftValue + lyric.text.clientWidth + lyric.text.clientWidth > this.maxWidth) {
                        this.textLeftValue -= lyric.text.clientWidth;
                    } else this.textLeftValue += lyric.text.clientWidth;
                }
            }
        } else {
            if (this.reverse) {
                this.textLeftValue -= lyric.text.clientWidth;
                if (this.textLeftValue < 0) {
                    this.textLeftValue = this.textLeftValueCache;
                    if (this.textTopValue + lyric.text.clientHeight + lyric.text.clientHeight > this.maxHeight) {
                        this.textTopValue -= lyric.text.clientHeight;
                    } else this.textTopValue += lyric.text.clientHeight;
                }
            } else {
                this.textLeftValue += lyric.text.clientWidth;
                if (this.textLeftValue + lyric.text.clientWidth > this.maxFitWidth * lyric.text.clientWidth) {
                    this.textLeftValue = this.textLeftValueCache;
                    if (this.textTopValue + lyric.text.clientHeight + lyric.text.clientHeight > this.maxHeight) {
                        this.textTopValue -= lyric.text.clientHeight;
                    } else this.textTopValue += lyric.text.clientHeight;
                }
            }
        }
    }
}