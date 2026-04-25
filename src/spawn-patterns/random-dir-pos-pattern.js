import AttackPattern from "../attack-patterns/attack-pattern";
import BulletShootPattern from "../attack-patterns/bullet-shoot-pattern";
import LinePattern from "../attack-patterns/line-pattern";
import SpawnPattern from "./spawn-pattern";
export default class RandomDirPosPattern extends SpawnPattern {
    constructor(player) {
        super();
        this.player = player;

        this.textTopValue = "";
        this.textLeftValue = "";
        ({ x: this.x, y: this.y } = this.getRandomDirection());

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
                if (unitWord.offsetHeight * textInGroup.length > window.innerHeight) {
                    this.textTopValue = window.innerHeight - unitWord.offsetHeight;
                    this.textTopValueCache = this.textTopValue;
                } else {
                    this.textTopValue = window.innerHeight - Math.random() * (window.innerHeight - unitWord.offsetHeight * textInGroup.length) - unitWord.offsetHeight;
                }
                this.textLeftValue = Math.random() * (window.innerWidth - unitWord.offsetWidth);
            } else {
                if (unitWord.offsetHeight * textInGroup.length > window.innerHeight) {
                    this.textTopValue = 0;
                    this.textTopValueCache = this.textTopValue;
                } else {
                    this.textTopValue = Math.random() * (window.innerHeight - unitWord.offsetHeight * textInGroup.length);
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
                this.textTopValue = Math.random() * (window.innerHeight - unitWord.offsetHeight);
            } else {
                if (unitWord.offsetWidth * textInGroup.length > window.innerWidth) {
                    this.textLeftValue = 0;
                    this.textLeftValueCache = this.textLeftValue;
                } else {
                    this.textLeftValue = Math.random() * (window.innerWidth - unitWord.offsetWidth * textInGroup.length);
                }
                this.textTopValue = Math.random() * (window.innerHeight - unitWord.offsetHeight);
            }
        }
        unitWord.remove();
        ({ x: this.x, y: this.y } = this.getRandomDirection());

        if (isWord) this.textGroup.dataset.length = 1;
        else this.textGroup.dataset.length = textInGroup.length;
    }

    getRandomDirection() {
        const angle = Math.random() * 360;
        const rad = angle * (Math.PI / 180);

        const distance = 700;

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