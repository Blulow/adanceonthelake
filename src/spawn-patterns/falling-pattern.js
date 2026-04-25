import SpawnPattern from "./spawn-pattern";

export default class FallingPattern extends SpawnPattern {
    constructor(player) {
        super();
        this.player = player;

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

    spawnGroup(textInGroup, arena, isWord = false) {
        if (Math.random() > 0.5) this.isColumn = !this.isColumn;
        if (Math.random() > 0.5) this.reverse = !this.reverse;
        
        this.textGroup = document.createElement("div");
        this.textGroup.classList.add("text-group");
        arena.appendChild(this.textGroup);

        const unitWord = document.createElement("div");
        unitWord.innerText = textInGroup[0];
        const maxWidth = Math.max(window.innerHeight, window.innerWidth);
        unitWord.style.fontSize = maxWidth > 1024 ? "7vw" : "10vw";
        unitWord.style.lineHeight = "1";
        arena.appendChild(unitWord);

        this.maxFitHeight = Math.floor(window.innerHeight / unitWord.clientHeight);
        this.maxFitWidth = Math.floor(window.innerWidth / unitWord.clientWidth);
        if (this.isColumn) {
            if (this.reverse) {
                if (unitWord.offsetHeight * textInGroup.length > window.innerHeight/2) {
                    this.textTopValue = window.innerHeight - unitWord.offsetHeight;
                    this.textTopValueCache = this.textTopValue;
                } else {
                    this.textTopValue = window.innerHeight - Math.random() * (window.innerHeight/2 - unitWord.offsetHeight * textInGroup.length) - unitWord.offsetHeight;
                }
                this.textLeftValue = Math.random() * (window.innerWidth - unitWord.offsetWidth);
            } else {
                if (unitWord.offsetHeight * textInGroup.length > window.innerHeight/2) {
                    this.textTopValue = window.innerHeight/2;
                    this.textTopValueCache = this.textTopValue;
                } else {
                    this.textTopValue = Math.random() * (window.innerHeight/2 - unitWord.offsetHeight * textInGroup.length) + window.innerHeight/2;
                }
                this.textLeftValue = Math.random() * (window.innerWidth - unitWord.offsetWidth);
            }
        } else {
            if (this.reverse) {
                if (unitWord.offsetWidth * textInGroup.length > window.innerWidth) {
                    this.textLeftValue = window.innerWidth - unitWord.offsetWidth;
                    this.textLeftValueCache = this.textLeftValue;
                } else {
                    this.textLeftValue = window.innerWidth - Math.random() * (window.innerWidth - unitWord.offsetWidth * textInGroup.length) - unitWord.offsetWidth;
                }
                this.textTopValue = Math.random() * (window.innerHeight/2 - unitWord.offsetHeight) + window.innerHeight/2;
            } else {
                if (unitWord.offsetWidth * textInGroup.length > window.innerWidth) {
                    this.textLeftValue = 0;
                    this.textLeftValueCache = this.textLeftValue;
                } else {
                    this.textLeftValue = Math.random() * (window.innerWidth - unitWord.offsetWidth * textInGroup.length);
                }
                this.textTopValue = Math.random() * (window.innerHeight/2 - unitWord.offsetHeight) + window.innerHeight/2;
            }
        }
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
                if (this.textTopValue < 0) this.textTopValue = this.textTopValueCache;
            } else {
                this.textTopValue += lyric.text.clientHeight;
                if (this.textTopValue + lyric.text.clientHeight > this.maxFitHeight * lyric.text.clientHeight) this.textTopValue = this.textTopValueCache;
            }
        } else {
            if (this.reverse) {
                this.textLeftValue -= lyric.text.clientWidth;
                if (this.textLeftValue < 0) this.textLeftValue = this.textLeftValueCache;
            } else {
                this.textLeftValue += lyric.text.clientWidth;
                if (this.textLeftValue + lyric.text.clientWidth > this.maxFitWidth * lyric.text.clientWidth) this.textLeftValue = this.textLeftValueCache;
            }
        }
    }
}