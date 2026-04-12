import SpawnPattern from "./spawn-pattern";
import Lyric from "../lyric";

export default class CharInWordPattern extends SpawnPattern {
    constructor(player, arena, attack, telegraph) {
        super(player, arena, attack, telegraph);
        this.c = player.video.firstChar;
        this.lastWord = null;
        this.lastChar = null;

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

    animate() {
        while(this.c) {
            this.c.animate = (now, unit) => {
                if (unit.contains(now)) {
                    if (unit.text !== this.lastChar) {
                        const lyric = new Lyric(unit, this.attack, this.telegraph);

                        if (unit.parent.text !== this.lastWord) {
                            if (Math.random() > 0.5) this.isColumn = !this.isColumn;
                            if (Math.random() > 0.5) this.reverse = !this.reverse;
                            
                            this.textGroup = document.createElement("div");
                            this.textGroup.classList.add("text-group");
                            this.arena.appendChild(this.textGroup);
                            
                            const unitWord = document.createElement("div");
                            unitWord.innerText = unit.parent.text[0];
                            unitWord.style.fontSize = "10vw";
                            unitWord.style.lineHeight = "1";
                            this.arena.appendChild(unitWord);

                            this.maxFitHeight = Math.floor(window.innerHeight / unitWord.clientHeight);
                            this.maxFitWidth = Math.floor(window.innerWidth / unitWord.clientWidth);
                            if (this.isColumn) {
                                if (this.reverse) {
                                    if (unitWord.offsetHeight * unit.parent.text.length > window.innerHeight) {
                                        this.textTopValue = window.innerHeight - unitWord.offsetHeight;
                                        this.textTopValueCache = this.textTopValue;
                                    } else {
                                        this.textTopValue = window.innerHeight - Math.random() * (window.innerHeight - unitWord.offsetHeight * unit.parent.text.length) - unitWord.offsetHeight;
                                    }
                                    this.textLeftValue = Math.random() * (window.innerWidth - unitWord.offsetWidth);
                                } else {
                                    if (unitWord.offsetHeight * unit.parent.text.length > window.innerHeight) {
                                        this.textTopValue = 0;
                                        this.textTopValueCache = this.textTopValue;
                                    } else {
                                        this.textTopValue = Math.random() * (window.innerHeight - unitWord.offsetHeight * unit.parent.text.length);
                                    }
                                    this.textLeftValue = Math.random() * (window.innerWidth - unitWord.offsetWidth);
                                }
                            } else {
                                if (this.reverse) {
                                    if (unitWord.offsetWidth * unit.parent.text.length > window.innerWidth) {
                                        this.textLeftValue = window.innerWidth - unitWord.offsetWidth;
                                        this.textLeftValueCache = this.textLeftValue;
                                    } else {
                                        this.textLeftValue = window.innerWidth - Math.random() * (window.innerWidth - unitWord.offsetWidth * unit.parent.text.length) - unitWord.offsetWidth;
                                    }
                                    this.textTopValue = Math.random() * (window.innerHeight - unitWord.offsetHeight);
                                } else {
                                    if (unitWord.offsetWidth * unit.parent.text.length > window.innerWidth) {
                                        this.textLeftValue = 0;
                                        this.textLeftValueCache = this.textLeftValue;
                                    } else {
                                        this.textLeftValue = Math.random() * (window.innerWidth - unitWord.offsetWidth * unit.parent.text.length);
                                    }
                                    this.textTopValue = Math.random() * (window.innerHeight - unitWord.offsetHeight);
                                }
                            }
                            unitWord.remove();
                            ({ x: this.x, y: this.y } = this.getRandomDirection());
                            
                            this.lastWord = unit.parent.text;
                            this.textGroup.dataset.length = unit.parent.text.length;
                        }

                        lyric.onFadeOut(() => {
                            const text = lyric.text;
                            text.parentElement.dataset.length--;
                            if (text.parentElement.dataset.length <= 0) text.parentElement.remove();
                        }, { isColumn: this.isColumn });

                        lyric.setPosAndMoveIn(this.textLeftValue, this.textTopValue, this.x, this.y);
                        lyric.spawn(this.textGroup);
                        if (unit.parent.text === this.lastWord) {
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
                        this.lastChar = unit.text;
                    }
                }
            };
            this.c = this.c.next;
        }
    }
}