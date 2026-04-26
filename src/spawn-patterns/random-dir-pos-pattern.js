import AttackPattern from "../attack-patterns/attack-pattern";
import BulletShootPattern from "../attack-patterns/bullet-shoot-pattern";
import LinePattern from "../attack-patterns/line-pattern";
import SpawnPattern from "./spawn-pattern";
export default class RandomDirPosPattern extends SpawnPattern {
    constructor(player) {
        super();
        this.player = player;

        this.minHeight = 0;
        this.maxHeight = window.innerHeight;
        this.minWidth = 0;
        this.maxWidth = window.innerWidth;

        this.textTopValue = "";
        this.textLeftValue = "";
        ({ x: this.x, y: this.y } = { x: 0, y: 0 });

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

        this.textGroup = document.createElement("div");
        this.textGroup.classList.add("text-group");
        arena.appendChild(this.textGroup);

        const unitWord = document.createElement("div");
        unitWord.innerText = textInGroup[0];
        unitWord.style.fontSize = Math.max(window.innerHeight, window.innerWidth) > 1024 ? "7vw" : "10vw";
        unitWord.style.lineHeight = "1";
        arena.appendChild(unitWord);

        this.maxFitHeight = Math.floor((maxHeight - minHeight) / unitWord.clientHeight);
        this.maxFitWidth = Math.floor((maxWidth - minWidth) / unitWord.clientWidth);
        do {
            if (this.isColumn) {
                if (this.reverse) {
                    if (unitWord.offsetHeight * textInGroup.length > this.maxHeight) {
                        this.textTopValue = this.maxHeight - unitWord.offsetHeight;
                        this.textTopValueCache = this.textTopValue;
                    } else {
                        this.textTopValue = this.maxHeight - Math.random() * ((this.maxHeight - this.minHeight) - unitWord.offsetHeight * textInGroup.length) - unitWord.offsetHeight;
                    }
                    this.textLeftValue = this.minWidth + Math.random() * ((this.maxWidth - this.minWidth) - unitWord.offsetWidth);
                } else {
                    if (unitWord.offsetHeight * textInGroup.length > this.maxHeight) {
                        this.textTopValue = this.minHeight;
                        this.textTopValueCache = this.textTopValue;
                    } else {
                        this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight) - unitWord.offsetHeight * textInGroup.length);
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
                    this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight) - unitWord.offsetHeight);
                } else {
                    if (unitWord.offsetWidth * textInGroup.length > this.maxWidth) {
                        this.textLeftValue = this.minWidth;
                        this.textLeftValueCache = this.textLeftValue;
                    } else {
                        this.textLeftValue = this.minWidth + Math.random() * ((this.maxWidth - this.minWidth) - unitWord.offsetWidth * textInGroup.length);
                    }
                    this.textTopValue = this.minHeight + Math.random() * ((this.maxHeight - this.minHeight) - unitWord.offsetHeight);
                }
            }
        } while ([...document.getElementsByClassName("text")].filter(e => !(
            this.textLeftValue + unitWord.offsetWidth < e.getBoundingClientRect().left ||
            this.textLeftValue > e.getBoundingClientRect().right ||
            this.textTopValue + unitWord.offsetHeight < e.getBoundingClientRect().top ||
            this.textTopValue > e.getBoundingClientRect().bottom
        )).length > 0);
        
        unitWord.remove();
        ({ x: this.x, y: this.y } = this.getRandomDirection());

        if (isWord) this.textGroup.dataset.length = 1;
        else this.textGroup.dataset.length = textInGroup.length;
    }

    getRandomDirection() {
        const angle = Math.random() * 360;
        const rad = angle * (Math.PI / 180);

        const distance = 1200;

        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;

        return { x, y };
    }

    spawnLyric(lyric) {
        if (lyric.attack.constructor === AttackPattern) lyric.text.classList.add("bullet", "lyric-bullet");
        lyric.text.classList.add("text-movein");
        if (this.isColumn) lyric.text.classList.add("column");

        const waterWave = document.createElement("div");
        waterWave.classList.add("water-wave");
        lyric.text.appendChild(waterWave);
        
        lyric.onFadeOut(() => {
            const text = lyric.text;
            text.parentElement.dataset.length--;
            if (text.parentElement.dataset.length <= 0) text.parentElement.remove();
        }, { isColumn: this.isColumn, playerPos: { x: this.player.x, y: this.player.y }});
        
        lyric.setPosAndMoveIn(this.textLeftValue, this.textTopValue, this.x, this.y);
        lyric.spawn(this.textGroup);

        const relLength = Math.hypot(this.x, this.y);
        const angle = Math.atan2(this.y / relLength, this.x / relLength);
        lyric.spawnTelegraph(true, { angle: angle, column: this.isColumn });
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